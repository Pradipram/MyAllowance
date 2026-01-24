create or replace function delete_full_transaction(
  p_transaction_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
as $$
declare
  old_tx record;
  deleted_tx jsonb;
begin
  -- 1. Get the transaction data
  select * from transactions 
  where id = p_transaction_id and user_id = p_user_id
  into old_tx;

  if old_tx is null then
    raise exception 'Transaction not found or access denied';
  end if;

  -- ====================================================
  -- 2. HANDLE EXPENSE DELETION
  -- ====================================================
  if old_tx.type = 'expense' then
      -- SQL handles NULL automatically: 
      -- If category_id is NULL, 0 rows are updated. No crash.
      update budget_categories
      set spent = coalesce(spent, 0) - old_tx.amount
      where id = old_tx.category_id;

      update monthly_budgets
      set total_spent = coalesce(total_spent, 0) - old_tx.amount
      where user_id = p_user_id 
        and month = old_tx.month 
        and year = old_tx.year;

  -- ====================================================
  -- 3. HANDLE INCOME DELETION
  -- ====================================================
  elsif old_tx.type = 'income' then
      -- SQL handles NULL automatically here too.
      update income_sources
      set amount = coalesce(amount, 0) - old_tx.amount,
          updated_at = now()
      where id = old_tx.income_source_id;

      update monthly_incomes
      set total_income = coalesce(total_income, 0) - old_tx.amount,
          updated_at = now()
      where user_id = p_user_id 
        and month = old_tx.month 
        and year = old_tx.year;
  end if;

  -- ====================================================
  -- 4. DELETE
  -- ====================================================
  delete from transactions
  where id = p_transaction_id
  returning to_jsonb(transactions.*) into deleted_tx;

  return deleted_tx;
end;
$$;