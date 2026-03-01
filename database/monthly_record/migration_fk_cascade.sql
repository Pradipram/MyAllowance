-- Migration: Fix FK constraints on budget_categories and income_sources
-- to use ON DELETE CASCADE so deleting a monthly_record auto-wipes children.
-- Run this ONCE in the Supabase SQL Editor.

-- budget_categories
alter table public.budget_categories
  drop constraint if exists budget_categories_monthly_record_id_fkey;

alter table public.budget_categories
  add constraint budget_categories_monthly_record_id_fkey
  foreign key (monthly_record_id)
  references monthly_records(id)
  on delete cascade;

-- income_sources (fix if same issue exists)
alter table public.income_sources
  drop constraint if exists income_sources_monthly_record_id_fkey;

alter table public.income_sources
  add constraint income_sources_monthly_record_id_fkey
  foreign key (monthly_record_id)
  references monthly_records(id)
  on delete cascade;
