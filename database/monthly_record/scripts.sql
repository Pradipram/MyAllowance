-- 1 May 2026
ALTER TABLE monthly_records
  DROP COLUMN IF EXISTS total_budget CASCADE;

DROP TABLE IF EXISTS monthly_budgets CASCADE;