-- Migration: Add income_source_id to transactions & make category_id nullable
-- Run this in the Supabase SQL Editor before using insert_full_transaction_v2

-- 1. Make category_id nullable (income transactions don't belong to a budget category)
alter table public.transactions
  alter column category_id drop not null;

-- 2. Add income_source_id column (nullable; only set for income transactions)
alter table public.transactions
  add column if not exists income_source_id uuid references income_sources(id) on delete set null;
