create or replace function delete_monthly_record(
  p_user_id uuid,
  p_month numeric,
  p_year numeric
)
returns void
language plpgsql
as $$
begin
  -- 🗑️ DELETE PARENT
  -- Because of 'ON DELETE CASCADE' on your child tables, 
  -- this single line will wipe:
  -- 1. The Monthly Record
  -- 2. All Budget Categories for that month
  -- 3. All Income Sources for that month
  -- 4. All Transactions linked to that month (if they have the foreign key)
  
  delete from monthly_records
  where user_id = p_user_id 
    and month = p_month 
    and year = p_year;
    
end;
$$;