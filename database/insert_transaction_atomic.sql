-- -- SQL function to insert transaction atomically following ACID properties
-- -- This ensures all three table updates happen together or none at all

create table public.transactions (
    id uuid primary key default gen_random_uuid(),

    -- Foreign keys
    user_id uuid not null references auth.users(id) on delete cascade,
    category_id uuid not null references budget_categories(id) on delete cascade,

    category_name text not null,

    amount numeric(12, 2) not null check (amount >= 0),
    description text not null,

    date date not null,
    month int not null check (month >= 1 and month <= 12),
    year int not null,

    type text not null check (type in ('expense', 'income')),
    payment_mode text not null,

    attachment_url text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    is_deleted boolean not null default false,
    deleted_at timestamptz
);

-- CREATE OR REPLACE FUNCTION insert_transaction_atomic(
--   p_user_id UUID,
--   p_category_id UUID,
--   p_category_name TEXT,
--   p_description TEXT,
--   p_date TIMESTAMP,
--   p_month INTEGER,
--   p_year INTEGER,
--   p_type TEXT,
--   p_payment_mode TEXT,
--   p_amount NUMERIC
-- )
-- RETURNS JSON
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
--   v_transaction_id UUID;
--   v_monthly_budget_id UUID;
--   v_result JSON;
-- BEGIN
--   -- Start transaction (implicit in function)
  
--   -- 1. Insert transaction
--   INSERT INTO transactions (
--     user_id,
--     category_id,
--     category_name,
--     description,
--     date,
--     month,
--     year,
--     type,
--     payment_mode,
--     amount,
--     is_deleted
--   ) VALUES (
--     p_user_id,
--     p_category_id,
--     p_category_name,
--     p_description,
--     p_date,
--     p_month,
--     p_year,
--     p_type,
--     p_payment_mode,
--     p_amount,
--     false
--   )
--   RETURNING id INTO v_transaction_id;
  
--   -- 2. Update budget_categories spent amount (atomic increment)
--   UPDATE budget_categories
--   SET spent = COALESCE(spent, 0) + p_amount
--   WHERE id = p_category_id;
  
--   -- Verify category was updated
--   IF NOT FOUND THEN
--     RAISE EXCEPTION 'Category with id % not found', p_category_id;
--   END IF;
  
--   -- 3. Get monthly budget id and update total_spent (atomic increment)
--   SELECT id INTO v_monthly_budget_id
--   FROM monthly_budgets
--   WHERE user_id = p_user_id
--     AND month = p_month
--     AND year = p_year;
  
--   -- Verify budget exists
--   IF NOT FOUND THEN
--     RAISE EXCEPTION 'Monthly budget not found for month % year %', p_month, p_year;
--   END IF;
  
--   UPDATE monthly_budgets
--   SET total_spent = COALESCE(total_spent, 0) + p_amount
--   WHERE id = v_monthly_budget_id;
  
--   -- Return the transaction details
--   v_result := json_build_object(
--     'transaction_id', v_transaction_id,
--     'category_id', p_category_id,
--     'amount', p_amount,
--     'success', true
--   );
  
--   RETURN v_result;
  
--   -- If any error occurs, the entire transaction will be rolled back automatically
-- EXCEPTION
--   WHEN OTHERS THEN
--     -- Log error and re-raise
--     RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
-- END;
-- $$;

-- -- Grant execute permission to authenticated users
-- GRANT EXECUTE ON FUNCTION insert_transaction_atomic TO authenticated;

create or replace function public.insert_full_transaction(
  p_user_id uuid,
  p_category_id uuid,
  p_category_name text,
  p_description text,
  p_date timestamptz,
  p_month int,
  p_year int,
  p_type text,
  p_payment_mode text,
  p_amount numeric
)
returns jsonb
language plpgsql
as $$
declare
  new_transaction jsonb;
begin
  -- Start Transaction
  begin
    -- 1) Insert into transactions
    insert into transactions (
      user_id, category_id, category_name,
      description, date, month, year,
      type, payment_mode, amount, is_deleted
    )
    values (
      p_user_id, p_category_id, p_category_name,
      p_description, p_date, p_month, p_year,
      p_type, p_payment_mode, p_amount, false
    )
    returning to_jsonb(transactions.*)
    into new_transaction;

    -- 2) Update category spent
    update budget_categories
    set spent = coalesce(spent, 0) + p_amount
    where id = p_category_id;

    -- 3) Update monthly budget
    update monthly_budgets
    set total_spent = coalesce(total_spent, 0) + p_amount
    where user_id = p_user_id
      and month = p_month
      and year = p_year;

    commit;

  exception
    when others then
      rollback;
      raise;
  end;

  return new_transaction;
end;
$$;

