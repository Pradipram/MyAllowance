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