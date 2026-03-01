-- 01 March 2026
create or replace function update_full_transaction_v2(
  p_transaction_id uuid,
  p_user_id uuid,
  p_description text,
  p_amount numeric,
  p_date timestamptz,
  p_type text, -- 'income' or 'expense'
  p_month numeric, 
  p_year numeric,  
  p_category_id uuid default null, 
  p_income_source_id uuid default null
)
returns jsonb
language plpgsql
as $$
declare
  v_old_tx record;
  v_old_month numeric;
  v_old_year numeric;
  v_record_id uuid;
begin
  -- ====================================================
  -- 1. FETCH OLD TRANSACTION
  -- ====================================================
  select * into v_old_tx from transactions 
  where id = p_transaction_id for update;

  if v_old_tx is null then
    raise exception 'TRANSACTION_NOT_FOUND: Transaction does not exist.';
  end if;

  v_old_month := extract(month from v_old_tx.date);
  v_old_year := extract(year from v_old_tx.date);

  -- ====================================================
  -- 2. STRICT CHECK: BLOCK MONTH/YEAR CHANGES
  -- ====================================================
  if v_old_month != p_month or v_old_year != p_year then
    raise exception 'MONTH_CHANGE_NOT_ALLOWED: You cannot move a transaction to a different month. Please delete this transaction and recreate it in the target month.';
  end if;

  -- ====================================================
  -- 3. GET PARENT RECORD ID (Guaranteed to be the same month)
  -- ====================================================
  select id into v_record_id from monthly_records
  where user_id = p_user_id and month = p_month and year = p_year;

  if v_record_id is null then
    raise exception 'MONTHLY_RECORD_NOT_FOUND: Monthly record missing or corrupted.';
  end if;

  -- ====================================================
  -- 4. REVERSE THE OLD DATA
  -- ====================================================
  if v_old_tx.type = 'expense' then
      update monthly_records set total_spent = total_spent - v_old_tx.amount where id = v_record_id;
      if v_old_tx.category_id is not null then
          update budget_categories set spent = spent - v_old_tx.amount where id = v_old_tx.category_id;
      end if;
  elsif v_old_tx.type = 'income' then
      update monthly_records set total_income = total_income - v_old_tx.amount where id = v_record_id;
      if v_old_tx.income_source_id is not null then
          update income_sources set earned = earned - v_old_tx.amount where id = v_old_tx.income_source_id;
      end if;
  end if;

  -- ====================================================
  -- 5. APPLY THE NEW DATA
  -- ====================================================
  if p_type = 'expense' then
      update monthly_records set total_spent = total_spent + p_amount where id = v_record_id;
      if p_category_id is not null then
          update budget_categories set spent = spent + p_amount where id = p_category_id;
      end if;
  elsif p_type = 'income' then
      update monthly_records set total_income = total_income + p_amount where id = v_record_id;
      if p_income_source_id is not null then
          update income_sources set earned = earned + p_amount where id = p_income_source_id;
      end if;
  end if;

  -- ====================================================
  -- 6. UPDATE TRANSACTION ROW
  -- ====================================================
  update transactions set
    description = p_description,
    amount = p_amount,
    date = p_date,
    type = p_type,
    category_id = p_category_id,
    income_source_id = p_income_source_id
  where id = p_transaction_id;

  return jsonb_build_object(
    'status', 'success', 
    'transaction_id', p_transaction_id, 
    'record_id', v_record_id
  );
end;
$$;

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

      -- Give money BACK to monthly_records total_spent
      update monthly_records
      set total_spent = coalesce(total_spent, 0) - old_tx.amount,
          updated_at = now()
      where user_id = p_user_id and month = old_tx.month and year = old_tx.year;

  elsif old_tx.type = 'income' then
      -- Revert Income Source
      update income_sources
      set amount = coalesce(amount, 0) - old_tx.amount,
          updated_at = now()
      where id = old_tx.income_source_id;

      -- Revert monthly_records total_income
      update monthly_records
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

      -- Add cost to monthly_records total_spent
      update monthly_records
      set total_spent = coalesce(total_spent, 0) + p_amount,
          updated_at = now()
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

      -- Add money to monthly_records total_income
      update monthly_records
      set total_income = coalesce(total_income, 0) + p_amount,
          updated_at = now()
      where user_id = p_user_id and month = p_month and year = p_year;

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