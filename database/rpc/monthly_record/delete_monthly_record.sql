create or replace function delete_monthly_record(
  p_user_id uuid,
  p_month numeric,
  p_year numeric
)
returns void
language plpgsql
as $$
declare
  v_record_id uuid;
begin
  -- Resolve the record id first
  select id into v_record_id
  from monthly_records
  where user_id = p_user_id
    and month = p_month
    and year = p_year;

  if v_record_id is null then
    return; -- nothing to delete
  end if;

  -- 1. Delete transactions that belong to budget_categories of this record
  delete from transactions
  where category_id in (
    select id from budget_categories where monthly_record_id = v_record_id
  );

  -- 2. Delete transactions that belong to income_sources of this record
  delete from transactions
  where income_source_id in (
    select id from income_sources where monthly_record_id = v_record_id
  );

  -- 3. Delete child rows explicitly (in case FK is not ON DELETE CASCADE)
  delete from budget_categories where monthly_record_id = v_record_id;
  delete from income_sources    where monthly_record_id = v_record_id;

  -- 4. Delete the parent record
  delete from monthly_records
  where id = v_record_id;
end;
$$;