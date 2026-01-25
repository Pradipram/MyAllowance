# Changelog

All notable changes to My Allowance will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - Unreleased

### Added

- **Income Management System**: Complete separation of Income vs. Expense tracking.
  - **Dual Dashboard Actions**: Added separate Floating Action Buttons (FAB) for "Add Income" (+) and "Add Expense" (-).
  - **Dual Setup Flow**: Added separate "Set Up Budget" and "Setup Income Source" buttons in the no-budget state with distinct styling and icons.
  - **Income Categories**: Added 6 standard income sources (Salary, Gift, Investment, Refund, Freelance, Other) with custom icons.
  - **Smart UI Components**: Created modular `ShowIncomeCategory` component for standardized selection.
- **Database Architecture**:
  - **New Unified Table**: Created `monthly_records` table as the central hub for monthly financial data (Jan 25, 2026).
    - Single record per user per month with aggregated totals (total_income, total_budget, total_spent)
    - Foreign key relationships from budget_categories and income_sources to monthly_records
    - Performance-optimized with indexes on monthly_record_id columns
    - Row Level Security (RLS) policies for user data isolation
  - **Enhanced RPC Functions**: Comprehensive transaction management with:
    - `insert_full_transaction_v2`: Income source ID tracking with mandatory validation, separate update paths for income sources and monthly totals
    - `update_full_transaction_v2`: Revert-and-apply algorithm with income source switching capability, ensuring accurate budget and income recalculation across category/source changes
    - `delete_full_transaction`: Intelligent reversal logic that automatically adjusts income sources and monthly totals when removing transactions
  - **Income Source Tracking**: Individual income sources now maintain running totals that update atomically with transactions
  - **Smart Column Switching**: Update function correctly manages category_id and income_source_id columns based on transaction type
  - **Atomic Transactions**: All RPC functions use consistent logic to route data based on transaction type (income vs expense)
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

### Fixed

- **Category Bug**: Resolved "invalid input syntax for UUID" error by standardizing default Income Categories in the database.

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
  - Added client-side validation in `insertTransaction` and `updateTransaction` services
  - Validate income transactions require `income_source_id` before RPC call
  - Validate expense transactions require `category_id` before RPC call
  - Conditional ID passing based on transaction type (null for unused IDs)
- **Database Improvements**:
  - Migrated to `insert_full_transaction_v2` RPC for better income source tracking
  - Upgraded to `update_full_transaction_v2` with income source ID parameter and smart column management
  - Enhanced revert-and-apply pattern to handle income source switching when changing transaction type
  - Improved `delete_full_transaction` to handle income source reversals automatically
  - Added parameter validation in all RPC functions to prevent data integrity issues
  - Enhanced income source updates with amount tracking at source level
  - Improved error messages for debugging and user feedback
  - NULL-safe SQL operations to prevent crashes when IDs are missing
  - Upsert logic for monthly income totals to handle edge cases gracefully

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
