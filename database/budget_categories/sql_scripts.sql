7 Feb 2026

update budget_categories set budget = amount;
-- 1. Add 'budget' to budget_categories (Nullable for now to avoid locking)
alter table budget_categories add column budget numeric;