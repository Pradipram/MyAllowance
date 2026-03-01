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