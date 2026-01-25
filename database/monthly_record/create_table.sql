
-- 25 Jan 2026
create table monthly_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  month numeric not null,
  year numeric not null,
  
  -- Aggregates (Cached Totals)
  total_income numeric default 0,
  total_budget numeric default 0,
  total_spent numeric default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Constraint: One record per user per month
  unique(user_id, month, year)
);


-- 1. Add connection to Budget Categories
alter table budget_categories 
add column monthly_record_id uuid references monthly_records(id);

-- 2. Add connection to Income Sources
alter table income_sources 
add column monthly_record_id uuid references monthly_records(id);

-- 3. Add Indexes (Crucial for performance later)
create index idx_budget_categories_monthly_record on budget_categories(monthly_record_id);
create index idx_income_sources_monthly_record on income_sources(monthly_record_id);