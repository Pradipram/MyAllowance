create table income_sources (
  id uuid default gen_random_uuid() primary key,
  
  -- Link to the parent Monthly Income record
  monthly_income_id uuid references monthly_incomes(id) on delete cascade not null,
  
  -- Owner (Essential for RLS security)
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Core Fields from your note
  name text not null,               -- e.g. "Google Salary" or "Stock Dividend"
  amount numeric not null check (amount >= 0),
  
  -- Active vs Passive constraint
  income_type text check (income_type in ('active', 'passive')) not null,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 🔒 Enable Security (Row Level Security)
alter table income_sources enable row level security;

-- Policy: Users can only see/edit their own income sources
create policy "Users can manage their own income sources"
on income_sources for all
using (auth.uid() = user_id);