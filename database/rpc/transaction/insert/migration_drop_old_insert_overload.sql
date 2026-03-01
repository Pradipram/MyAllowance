-- Run this in Supabase SQL Editor to remove the old overload and deploy the correct one.

-- Step 1: Drop the old 9-param overload
drop function if exists public.insert_full_transaction_v2(
  uuid, text, numeric, timestamptz, text, numeric, numeric, uuid, uuid
);

-- Step 2: Deploy the correct 11-param overload
create or replace function insert_full_transaction_v2(
  p_user_id uuid,
  p_category_id uuid,
  p_income_source_id uuid,
  p_category_name text,
  p_description text,
  p_date timestamptz,
  p_month numeric,
  p_year numeric,
  p_type text,
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
      if p_income_source_id is null then
        raise exception 'Income Source ID is required for income transactions';
      end if;

      update income_sources
      set amount = coalesce(amount, 0) + p_amount,
          updated_at = now()
      where id = p_income_source_id;

      update monthly_records
      set total_income = coalesce(total_income, 0) + p_amount,
          updated_at = now()
      where user_id = p_user_id and month = p_month and year = p_year;

      v_final_category_id := null;
      v_final_source_id := p_income_source_id;

  -- ====================================================
  -- 2. HANDLE EXPENSE LOGIC
  -- ====================================================
  elsif p_type = 'expense' then
      if p_category_id is null then
        raise exception 'Category ID is required for expense transactions';
      end if;

      update budget_categories
      set spent = coalesce(spent, 0) + p_amount
      where id = p_category_id;

      update monthly_records
      set total_spent = coalesce(total_spent, 0) + p_amount,
          updated_at = now()
      where user_id = p_user_id and month = p_month and year = p_year;

      v_final_category_id := p_category_id;
      v_final_source_id := null;
  end if;

  -- ====================================================
  -- 3. INSERT THE TRANSACTION
  -- ====================================================
  insert into transactions (
    user_id,
    category_id,
    income_source_id,
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
