-- 1 May 2026
-- Add the user_id column and link it to Supabase's auth.users table
ALTER TABLE expense_categories 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- If you want to enforce that every category MUST belong to a user, 
-- run this ONLY IF the table is currently empty (otherwise it will fail):
ALTER TABLE expense_categories ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE budget_categories RENAME TO expense_categories;
ALTER TABLE expense_categories
  DROP COLUMN IF EXISTS monthly_budget_id CASCADE,
  DROP COLUMN IF EXISTS amount CASCADE,
  DROP COLUMN IF EXISTS monthly_record_id CASCADE,
  DROP COLUMN IF EXISTS spent CASCADE;


-- 7 Feb 2026

update budget_categories set budget = amount;
-- 1. Add 'budget' to budget_categories (Nullable for now to avoid locking)
alter table budget_categories add column budget numeric;

-- ============================================================
-- 01 March 2026
-- Drop NOT NULL on monthly_budget_id so that new rows inserted
-- via upsert_monthly_record (which only sets monthly_record_id)
-- no longer violate the constraint.
-- ============================================================
alter table budget_categories alter column monthly_budget_id drop not null;
alter table budget_categories alter column amount drop not null;