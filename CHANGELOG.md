# Changelog

All notable changes to My Allowance will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - Unreleased

### Added

- **Income Management System**: Complete separation of Income vs. Expense tracking.
  - **Dual Dashboard Actions**: Added separate Floating Action Buttons (FAB) for "Add Income" (+) and "Add Expense" (-).
  - **Income Categories**: Added 6 standard income sources (Salary, Gift, Investment, Refund, Freelance, Other) with custom icons.
  - **Smart UI Components**: Created modular `ShowIncomeCategory` component for standardized selection.
- **Database Architecture**:
  - **New Table**: Created `monthly_incomes` table with Row Level Security (RLS) to safely store earnings.
  - **Enhanced RPC Functions**: Comprehensive transaction management with:
    - `insert_full_transaction_v2`: Income source ID tracking with mandatory validation, separate update paths for income sources and monthly totals
    - `update_full_transaction`: Revert-and-apply algorithm that undoes old transaction effects before applying new values, ensuring accurate budget and income recalculation
    - `delete_full_transaction`: Intelligent reversal logic that automatically adjusts income sources and monthly totals when removing transactions
  - **Income Source Tracking**: Individual income sources now maintain running totals that update atomically with transactions
  - **Atomic Transactions**: All RPC functions use consistent logic to route data based on transaction type (income vs expense)
- **Enhanced UI/UX**:
  - **Smart Header**: Added toggle icon in the header to seamlessly switch between transaction modes.
  - **Directional Animations**: Implemented slide animations (Up for Expense, Down for Income) to give users spatial context.
  - **Visual Polish**: Reduced spacing and improved layout hierarchy for a cleaner look.

### Changed

- **Transaction Flow**: The Add Transaction screen now accepts a `type` parameter to pre-launch in the correct mode.
- **Navigation**: Hidden bottom tabs when entering "Add Transaction" via Dashboard FABs for a focused experience.
- **Header Logic**: Toggle icon is now context-aware (hidden during "Edit Mode" to prevent data conflicts).

### Fixed

- **Category Bug**: Resolved "invalid input syntax for UUID" error by standardizing default Income Categories in the database.

### Technical

- **Animation Engine**: Integrated React Native `Animated` API for performant, native-driver transitions.
- **Code Modularity**: Extracted category selection logic into reusable components to reduce code duplication.
- **State Management**: Refactored transaction processing to use unified state for both Income and Expense types.
- **RLS**: Row Level Security added for table transaction.
- **Database Improvements**:
  - Migrated to `insert_full_transaction_v2` RPC for better income source tracking
  - Enhanced `update_full_transaction` with revert-and-apply pattern for accurate recalculation
  - Improved `delete_full_transaction` to handle income source reversals automatically
  - Added parameter validation to prevent data integrity issues
  - Enhanced income source updates with amount tracking at source level
  - Improved error messages for debugging and user feedback
  - NULL-safe SQL operations to prevent crashes when IDs are missing

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
