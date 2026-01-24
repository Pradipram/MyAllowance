create or replace function insert_full_transaction_v2(
  p_user_id uuid,
  p_category_id uuid,       -- For Expenses (nullable)
  p_income_source_id uuid,  -- For Income (nullable) - ✅ KEY CHANGE
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
  new_tx jsonb;
  v_final_category_id uuid;
  v_final_source_id uuid;
begin
  -- ====================================================
  -- 1. HANDLE INCOME LOGIC
  -- ====================================================
  if p_type = 'income' then
      -- Validation: Ensure we actually got a Source ID
      if p_income_source_id is null then
        raise exception 'Income Source ID is required for income transactions';
      end if;

      -- A. Update the specific Income Source (The "Bucket")
      -- We add the money to this specific source (e.g. "Salary")
      update income_sources
      set amount = coalesce(amount, 0) + p_amount,
          updated_at = now()
      where id = p_income_source_id;

      -- B. Update the Monthly Total (The "Summary")
      -- We also need to increase the total for the whole month
      insert into monthly_incomes (user_id, month, year, total_income)
      values (p_user_id, p_month, p_year, p_amount)
      on conflict (user_id, month, year)
      do update set 
        total_income = monthly_incomes.total_income + p_amount,
        updated_at = now();
        
      -- Set IDs for the final insert
      v_final_category_id := null;
      v_final_source_id := p_income_source_id;

  -- ====================================================
  -- 2. HANDLE EXPENSE LOGIC
  -- ====================================================
  elsif p_type = 'expense' then
      -- Validation
      if p_category_id is null then
        raise exception 'Category ID is required for expense transactions';
      end if;

      -- A. Update Category Spent
      update budget_categories
      set spent = coalesce(spent, 0) + p_amount
      where id = p_category_id;

      -- B. Update Monthly Budget Total
      update monthly_budgets
      set total_spent = coalesce(total_spent, 0) + p_amount
      where user_id = p_user_id and month = p_month and year = p_year;

      -- Set IDs for the final insert
      v_final_category_id := p_category_id;
      v_final_source_id := null;
  end if;

  -- ====================================================
  -- 3. INSERT THE TRANSACTION
  -- ====================================================
  insert into transactions (
    user_id, 
    category_id,       -- Stores Expense Category
    income_source_id,  -- Stores Income Source
    category_name, 
    description, 
    date, 
    month, 
    year,
    type, 
    payment_mode, 
    amount, 
    is_deleted, 
    created_at, 
    updated_at
  )
  values (
    p_user_id, 
    v_final_category_id, 
    v_final_source_id,
    p_category_name, 
    p_description, 
    p_date, 
    p_month, 
    p_year,
    p_type, 
    p_payment_mode, 
    p_amount, 
    false, 
    now(), 
    now()
  )
  returning to_jsonb(transactions.*) into new_tx;

  return new_tx;
end;
$$;