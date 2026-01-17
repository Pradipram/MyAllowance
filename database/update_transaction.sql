
-- 17 Jan 2026
create or replace function update_full_transaction(
  p_transaction_id uuid,   -- ⚠️ Matches image type
  p_user_id uuid,
  p_category_id uuid,      -- ⚠️ Matches image type
  p_category_name text,
  p_description text,
  p_date timestamptz,      -- ⚠️ Matches image type
  p_month numeric,
  p_year numeric,
  p_type text,             -- ✅ Added: To switch between Income/Expense
  p_payment_mode text,
  p_amount numeric
)
returns jsonb
language plpgsql
as $$
declare
  old_tx record;
  updated_tx jsonb;
begin
  -- 1. Get the OLD transaction data (Before we change anything)
  select * from transactions 
  where id = p_transaction_id and user_id = p_user_id
  into old_tx;

  if old_tx is null then
    raise exception 'Transaction not found or access denied';
  end if;

  -- =========================================================
  -- 2. REVERT STEP: Undo the effect of the OLD transaction
  -- =========================================================
  if old_tx.type = 'expense' then
      -- Remove from old category (using old_tx.category_id)
      update budget_categories
      set spent = coalesce(spent, 0) - old_tx.amount
      where id = old_tx.category_id;

      -- Remove from old monthly budget
      update monthly_budgets
      set total_spent = coalesce(total_spent, 0) - old_tx.amount
      where user_id = p_user_id and month = old_tx.month and year = old_tx.year;

  elsif old_tx.type = 'income' then
      -- Remove from old income total
      update monthly_incomes
      set total_income = coalesce(total_income, 0) - old_tx.amount
      where user_id = p_user_id and month = old_tx.month and year = old_tx.year;
  end if;

  -- =========================================================
  -- 3. UPDATE STEP: Update the transaction record itself
  -- =========================================================
  update transactions
  set 
    category_id = p_category_id,
    category_name = p_category_name,
    description = p_description,
    date = p_date,
    month = p_month,
    year = p_year,
    type = p_type,        -- ✅ Update the type
    payment_mode = p_payment_mode,
    amount = p_amount,
    updated_at = now()
  where id = p_transaction_id
  returning to_jsonb(transactions.*) into updated_tx;

  -- =========================================================
  -- 4. APPLY STEP: Add the effect of the NEW transaction
  -- =========================================================
  if p_type = 'expense' then
      -- Add to new category (using p_category_id)
      update budget_categories
      set spent = coalesce(spent, 0) + p_amount
      where id = p_category_id;

      -- Add to new monthly budget
      update monthly_budgets
      set total_spent = coalesce(total_spent, 0) + p_amount
      where user_id = p_user_id and month = p_month and year = p_year;

  elsif p_type = 'income' then
      -- Add to new income total (Upsert logic to be safe)
      insert into monthly_incomes (user_id, month, year, total_income)
      values (p_user_id, p_month, p_year, p_amount)
      on conflict (user_id, month, year)
      do update set 
        total_income = monthly_incomes.total_income + p_amount,
        updated_at = now();
  end if;

  return updated_tx;
end;
$$;


-- Old SQL
create or replace function update_full_transaction(
  p_transaction_id uuid,
  p_user_id uuid,
  p_category_id uuid,
  p_category_name text,
  p_description text,
  p_date timestamp,
  p_month numeric,
  p_year numeric,
  p_payment_mode text,
  p_amount numeric
)
returns jsonb
language plpgsql
as $$
declare
  old_tx record;
  updated_tx jsonb;
  amount_diff numeric;
begin
  -- 1. Get the OLD transaction data (to calculate difference)
  select * from transactions 
  where id = p_transaction_id and user_id = p_user_id
  into old_tx;

  if old_tx is null then
    raise exception 'Transaction not found or access denied';
  end if;

  -- 2. Update the transaction record
  update transactions
  set 
    category_id = p_category_id,
    category_name = p_category_name,
    description = p_description,
    date = p_date,
    month = p_month,
    year = p_year,
    payment_mode = p_payment_mode,
    amount = p_amount,
    updated_at = now()
  where id = p_transaction_id
  returning to_jsonb(transactions.*) into updated_tx;

  -- 3. Handle Budget Calculation
  -- Logic: New Total = Old Total - Old Amount + New Amount
  -- Or simply: Diff = New Amount - Old Amount
  amount_diff := p_amount - old_tx.amount;

  -- 3a. Update Category Spent
  -- Note: If category changed, we would need to subtract from old cat and add to new cat.
  -- Assuming category stays same for simple update. If category changes, logic is more complex.
  if old_tx.category_id = p_category_id then
      update budget_categories
      set spent = coalesce(spent, 0) + amount_diff
      where id = p_category_id;
  else
      -- If user changed category, remove from old, add to new
      update budget_categories
      set spent = coalesce(spent, 0) - old_tx.amount
      where id = old_tx.category_id;

      update budget_categories
      set spent = coalesce(spent, 0) + p_amount
      where id = p_category_id;
  end if;

  -- 3b. Update Monthly Budget Total
  -- Similar logic for month changes could be applied, but assuming month stays same for now:
  update monthly_budgets
  set total_spent = coalesce(total_spent, 0) + amount_diff
  where user_id = p_user_id
    and month = p_month
    and year = p_year;

  return updated_tx;
end;
$$;