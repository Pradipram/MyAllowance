create or replace function update_full_transaction_v2(
  p_transaction_id uuid,
  p_user_id uuid,
  p_category_id uuid,       -- New/Current Expense Category
  p_income_source_id uuid,  -- New/Current Income Source
  p_category_name text,
  p_description text,
  p_date timestamptz,
  p_month numeric,
  p_year numeric,
  p_type text,              -- 'income' or 'expense'
  p_payment_mode text,
  p_amount numeric
)
returns jsonb
language plpgsql
as $$
declare
  old_tx record;
  updated_tx jsonb;
  v_final_category_id uuid;
  v_final_source_id uuid;
begin
  -- 1. GET OLD DATA (To undo its effect)
  select * from transactions 
  where id = p_transaction_id and user_id = p_user_id
  into old_tx;

  if old_tx is null then
    raise exception 'Transaction not found or access denied';
  end if;

  -- ====================================================
  -- 2. REVERT STEP: Undo the OLD transaction completely
  -- ====================================================
  if old_tx.type = 'expense' then
      -- Give money BACK to the old Category
      update budget_categories
      set spent = coalesce(spent, 0) - old_tx.amount
      where id = old_tx.category_id;

      -- Give money BACK to the old Monthly Budget
      update monthly_budgets
      set total_spent = coalesce(total_spent, 0) - old_tx.amount
      where user_id = p_user_id and month = old_tx.month and year = old_tx.year;

  elsif old_tx.type = 'income' then
      -- Revert Income Source
      -- If income_source_id is NULL, this updates 0 rows. Safe.
      update income_sources
      set amount = coalesce(amount, 0) - old_tx.amount,
          updated_at = now()
      where id = old_tx.income_source_id;

      -- Revert Monthly Total
      update monthly_incomes
      set total_income = coalesce(total_income, 0) - old_tx.amount,
          updated_at = now()
      where user_id = p_user_id and month = old_tx.month and year = old_tx.year;
  end if;

  -- ====================================================
  -- 3. APPLY STEP: Apply the NEW transaction data
  -- ====================================================
  if p_type = 'expense' then
      -- Validation
      if p_category_id is null then raise exception 'Category ID required for expense'; end if;

      -- Add cost to NEW Category
      update budget_categories
      set spent = coalesce(spent, 0) + p_amount
      where id = p_category_id;

      -- Add cost to NEW Monthly Budget
      update monthly_budgets
      set total_spent = coalesce(total_spent, 0) + p_amount
      where user_id = p_user_id and month = p_month and year = p_year;

      -- Prepare IDs for update
      v_final_category_id := p_category_id;
      v_final_source_id := null;

  elsif p_type = 'income' then
      -- Validation
      if p_income_source_id is null then raise exception 'Income Source ID required for income'; end if;

      -- Add money to NEW Income Source
      update income_sources
      set amount = coalesce(amount, 0) + p_amount,
          updated_at = now()
      where id = p_income_source_id;

      -- Add money to NEW Monthly Total
      -- (Using Upsert to be safe, though month likely exists if we are updating)
      insert into monthly_incomes (user_id, month, year, total_income)
      values (p_user_id, p_month, p_year, p_amount)
      on conflict (user_id, month, year)
      do update set 
        total_income = monthly_incomes.total_income + p_amount,
        updated_at = now();

      -- Prepare IDs for update
      v_final_category_id := null;
      v_final_source_id := p_income_source_id;
  end if;

  -- ====================================================
  -- 4. UPDATE RECORD
  -- ====================================================
  update transactions
  set 
    category_id = v_final_category_id,
    income_source_id = v_final_source_id, -- Correctly switches columns
    category_name = p_category_name,
    description = p_description,
    date = p_date,
    month = p_month,
    year = p_year,
    type = p_type,
    payment_mode = p_payment_mode,
    amount = p_amount,
    updated_at = now()
  where id = p_transaction_id
  returning to_jsonb(transactions.*) into updated_tx;

  return updated_tx;
end;
$$;