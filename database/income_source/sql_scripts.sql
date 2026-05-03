-- 1 May 2026
ALTER TABLE income_sources
  DROP COLUMN IF EXISTS earned CASCADE,
  DROP COLUMN IF EXISTS monthly_record_id CASCADE;

-- 7 Feb 2026
alter table income_sources 
rename column amount to earned;