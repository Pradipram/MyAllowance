-- STEP 1: MIGRATE PARENT DATA
-- Copy all existing monthly budgets into the new unified table.
insert into monthly_records (
  user_id, 
  month, 
  year, 
  total_budget, 
  total_spent, 
  total_income -- We default this to 0 since you have no income data
)
select 
  user_id, 
  month, 
  year, 
  total_budget, 
  total_spent, 
  0 -- Total Income
from monthly_budgets
on conflict (user_id, month, year) do nothing;


-- STEP 2: LINK CHILD TABLE (Budget Categories)
-- Update the categories to point to the new parent ID.
-- We find the correct ID by matching the User + Month + Year.
update budget_categories bc
set monthly_record_id = mr.id
from monthly_records mr, monthly_budgets mb
where bc.monthly_budget_id = mb.id  -- Link Category to Old Parent
  and mb.user_id = mr.user_id       -- Match Old Parent to New Parent...
  and mb.month = mr.month           -- ...by Month
  and mb.year = mr.year;            -- ...by Year