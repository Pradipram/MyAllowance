# Changelog

All notable changes to My Allowance will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - Unreleased

### Added

- **Income Management System**: Complete separation of Income vs. Expense tracking.
  - **Dual Dashboard Actions**: Added separate Floating Action Buttons (FAB) for "Add Income" (+) and "Add Expense" (-). Income FAB now navigates to the Add Transaction screen in income mode (previously showed a "Coming Soon" alert).
  - **Dual Setup Flow**: Added separate "Set Up Budget" and "Setup Income Source" buttons in the no-budget state with distinct styling and icons.
  - **Income Categories**: Added 6 standard income sources (Salary, Gift, Investment, Refund, Freelance, Other) with custom icons.
  - **Smart UI Components**: Created modular `ShowIncomeCategory` component for standardized selection.
- **Database Architecture**:
  - **New Unified Table**: Created `monthly_records` table as the central hub for monthly financial data (Jan 25, 2026).
    - Single record per user per month with aggregated totals (total_income, total_budget, total_spent)
    - Foreign key relationships from budget_categories and income_sources to monthly_records
    - Performance-optimized with indexes on monthly_record_id columns
    - Row Level Security (RLS) policies for user data isolation
    - Migration script provided for existing users to preserve historical data from old monthly_budgets table
  - **Enhanced RPC Functions**: Comprehensive transaction management with:
    - `get_monthly_record`: Efficient retrieval of complete monthly financial data with nested arrays for budget categories and income sources in a single database call
    - `upsert_monthly_record`: Creates or updates monthly records with budget categories and income sources using improved column naming
    - `delete_monthly_record` _(revised Mar 1, 2026)_: Now explicitly deletes child rows (`transactions`, `budget_categories`, `income_sources`) before deleting the parent `monthly_records` row, handling cases where `ON DELETE CASCADE` is not active on FK constraints
    - `insert_full_transaction_v2` _(revised Mar 1, 2026)_: Consolidated to a single 11-param overload (`p_user_id`, `p_category_id`, `p_income_source_id`, `p_category_name`, `p_description`, `p_date`, `p_month`, `p_year`, `p_type`, `p_payment_mode`, `p_amount`). All total syncs now target `monthly_records` exclusively — expense path updates `total_spent`, income path updates `total_income`. Old 9-param overload (without `p_category_name`/`p_payment_mode`) dropped via migration.
    - `update_full_transaction_v2` _(revised Mar 1, 2026)_: Consolidated to a single 12-param overload. Revert and apply steps now operate on `monthly_records` — removed all references to legacy `monthly_budgets` and `monthly_incomes` tables.
    - `delete_full_transaction` _(revised Mar 1, 2026)_: Consolidated to a single 2-param overload. Reversal of amounts now targets `monthly_records` — removed all references to legacy `monthly_budgets` and `monthly_incomes` tables.
  - **Income Source Tracking**: Individual income sources now maintain running totals that update atomically with transactions
  - **Smart Column Switching**: Update function correctly manages category_id and income_source_id columns based on transaction type
  - **Atomic Transactions**: All RPC functions use consistent logic to route data based on transaction type (income vs expense)
  - **Database Schema Refinements**: Improved clarity and consistency in database column naming (Feb 7, 2026):
    - Renamed `amount` to `budget` in `budget_categories` table for better semantic clarity
    - Renamed `amount` to `earned` in `income_sources` table to distinguish from budget amounts
    - Updated `upsert_monthly_record` RPC function to use new column names
    - SQL migration scripts provided for seamless schema updates
- **Enhanced UI/UX**:
  - **Smart Header**: Added toggle icon in the header to seamlessly switch between transaction modes.
  - **Directional Animations**: Implemented slide animations (Up for Expense, Down for Income) to give users spatial context.
  - **Visual Polish**: Reduced spacing and improved layout hierarchy for a cleaner look.

### Changed

- **Transaction Flow**: The Add Transaction screen now accepts a `type` parameter to pre-launch in the correct mode.
- **Budget Setup Flow**: The set-budget screen now accepts a `for` parameter to distinguish between budget and income source setup modes.
- **Navigation**: Hidden bottom tabs when entering "Add Transaction" via Dashboard FABs for a focused experience.
- **Header Logic**: Toggle icon is now context-aware (hidden during "Edit Mode" to prevent data conflicts).
- **No Budget UI**: Enhanced the no-budget state with dual action buttons for setting up budgets or income sources, including visual styling with icons.
- **`deleteMonthlyBudget` service** (`services/budget.ts`): Signature changed from `deleteMonthlyBudget(budgetId: string)` to `deleteMonthlyBudget(month: number, year: number)`. Now calls the `delete_monthly_record` RPC instead of the legacy `delete_monthly_budget` RPC.
- **`confirmDeleteBudget`** (`set-budget.tsx`): Updated call site to pass `record.month` and `record.year` to match the new `deleteMonthlyBudget` signature.

### Fixed

- **Category Bug**: Resolved "invalid input syntax for UUID" error by standardizing default Income Categories in the database.
- **Delete Budget Error** (`P0001` — "Budget not found or does not belong to user"): `deleteMonthlyBudget` was calling the old `delete_monthly_budget` RPC which checked the `monthly_budgets` table. Fixed by migrating to `delete_monthly_record`.
- **Delete Budget FK Violation** (`23503` — FK violation on `budget_categories_monthly_record_id_fkey`): `delete_monthly_record` RPC assumed `ON DELETE CASCADE` was active. Fixed by explicitly deleting child rows in order before the parent.
- **Total Spent Not Updating on Dashboard**: All three transaction RPCs (`insert`, `update`, `delete`) had a second overload that still wrote to the legacy `monthly_budgets`/`monthly_incomes` tables. Fixed by consolidating to a single overload per function targeting `monthly_records` exclusively.
- **Schema Cache Error** (`PGRST202` — function not found): The live Supabase `insert_full_transaction_v2` was missing `p_category_name` and `p_payment_mode`. Fixed via migration that drops the old 9-param overload and re-creates the correct 11-param version.
- **Missing Column Error** (`42703` — `income_source_id` does not exist): `transactions` table was created without `income_source_id` and with `category_id NOT NULL`. Fixed via migration that adds the column and drops the `NOT NULL` constraint.

### Technical

- **Animation Engine**: Integrated React Native `Animated` API for performant, native-driver transitions.
- **Code Modularity**: Extracted category selection logic into reusable components to reduce code duplication.
- **State Management**: Refactored transaction processing to use unified state for both Income and Expense types.
- **RLS**: Row Level Security added for table transaction.
- **TypeScript Improvements**:
  - Created `IncomeSource` interface for type-safe income source management
  - Added `MonthlyIncome` interface for monthly income aggregation
  - Added `MonthlyRecord` interface representing the unified monthly financial data structure
  - Enhanced `Transaction` type with `income_source_id` field for income tracking
  - Maintained type safety across all transaction types with union type `'income' | 'expense'`
- **Service Layer Enhancements**:
  - Added `getMonthlyRecords` service in `services/monthly_records.ts`: fetches the authenticated user's monthly financial data via the `get_monthly_record` RPC; returns a typed `MonthlyRecord | null` (null when no record exists for the given month/year)
  - Added client-side validation in `insertTransaction` and `updateTransaction` services
  - Validate income transactions require `income_source_id` before RPC call
  - Validate expense transactions require `category_id` before RPC call
  - Conditional ID passing based on transaction type (null for unused IDs)
- **Database Improvements**:
  - Consolidated all three transaction RPCs to single overloads targeting `monthly_records` exclusively (removed legacy `monthly_budgets`/`monthly_incomes` writes)
  - Migrated to `insert_full_transaction_v2` RPC for better income source tracking
  - Upgraded to `update_full_transaction_v2` with income source ID parameter and smart column management
  - Enhanced revert-and-apply pattern to handle income source switching when changing transaction type
  - Improved `delete_full_transaction` to handle income source reversals automatically
  - Added parameter validation in all RPC functions to prevent data integrity issues
  - Enhanced income source updates with amount tracking at source level
  - Improved error messages for debugging and user feedback
  - NULL-safe SQL operations to prevent crashes when IDs are missing
- **Database Migrations Added** (Mar 1, 2026):
  - `migration_add_income_source_to_transactions.sql`: Adds `income_source_id` column to `transactions`; drops `NOT NULL` from `category_id`
  - `migration_drop_old_insert_overload.sql`: Drops old 9-param `insert_full_transaction_v2` overload and deploys the correct 11-param version
  - `migration_fk_cascade.sql`: Fixes FK constraints on `budget_categories` and `income_sources` to use `ON DELETE CASCADE`
- **Code Refactoring** (`set-budget.tsx`): Migrated screen to use the unified `MonthlyRecord` interface
  - State type changed from `MonthlyBudget | null` to `MonthlyRecord | null`
  - `loadMonthData` now calls `getMonthlyRecords` service (via `get_monthly_record` RPC) instead of the legacy `getMonthBudget`; empty-state initialization uses `MonthlyRecord` shape with `budget_categories`, `income_sources`, `total_budget`, `total_income`, `total_spent`
  - All category operations (`removeCategory`, `addCategory`, `updateCategory`, `validateAndSave`, `getTotalBudget`, JSX render) updated to use `record.budget_categories` and the renamed `budget` field (was `amount`)
  - `confirmDeleteBudget` updated to pass `record.month` / `record.year` to the new `deleteMonthlyBudget(month, year)` signature
  - Removed stray template-literal artefact and dead commented-out `useEffect` block

---

## [2.2.0] - 2026-01-04

### Added

- **Full Transaction Control**: Users can now Edit and Delete past transactions.
- **Smart Rebalancing**: Deleting a transaction automatically refunds the budget.
- **Undo Functionality**: Added toast message with Undo action after deletion.

### Fixed

- **Critical Budget Bug**: Fixed issue where editing a budget limit reset the "Spent" amount to zero.

## [2.1.0] - 2025-12-25

### Added

- Initial Release with Expense Tracking.
- Google Auth Integration.
