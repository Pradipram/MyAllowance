# Changelog

All notable changes to My Allowance will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.4.0] - 2026-08-25

### Added
- **Asset & Portfolio Tracking**: Full investment portfolio management feature allowing users to track stocks, mutual funds, and other assets with invested amount vs. current value tracking.
  - **Portfolio Types** (`types/portfolio.ts`, `types/types.ts`): `Asset` and `PortfolioSummary` TypeScript interfaces for individual holdings and aggregate portfolio data.
  - **Portfolio Service** (`services/portfolio.ts`): Three RPC-backed service functions — `fetchPortfolioSummary()`, `addAsset()`, and `updateValuation()` — all returning the standard `{ success, data, error }` response pattern with auth checks and error handling.
  - **Portfolio Header Component** (`components/portfolio/portfolio-header.tsx`): Hero card displaying Total Portfolio Value with a green/red pill badge showing absolute and percentage delta.
  - **Asset Card Component** (`components/portfolio/asset-card.tsx`): Reusable card showing asset name, type, current value, and color-coded percentage return (green for gains, red for losses).
  - **Update Valuation Sheet** (`components/portfolio/update-valuation-sheet.tsx`): Bottom-sheet modal triggered by tapping an asset card, allowing quick inline valuation updates with previous value display, decimal-pad input, and automatic portfolio refresh on save.
  - **Add Asset Screen** (`app/add-asset.tsx`): Dedicated form screen with inputs for asset name, type selector (Equity/Mutual Fund/Other), invested amount, and current value. Includes a "Same as invested" helper, form validation, and navigation back on success.
  - **Portfolio Tab Screen** (`app/(tabs)/portfolio.tsx`): Full portfolio dashboard with `FlatList` rendering of asset cards, `PortfolioHeader` as list header, pull-to-refresh, empty state, `useFocusEffect` for auto-refresh on tab focus, and a FAB navigating to the Add Asset screen.
- **Bottom Tab Navigation**: Restructured the app to use a two-tab bottom navigation bar, replacing the previous standalone home screen.
  - **Cashflow Tab**: Home screen (monthly transactions, summary, categories) moved into `app/(tabs)/index.tsx` with a cash icon.
  - **Portfolio Tab**: Asset tracking dashboard at `app/(tabs)/portfolio.tsx` with a pie-chart icon.
  - **Tab Layout** (`app/(tabs)/_layout.tsx`): Configured both tabs with active/inactive tint colors and clean white tab bar styling.

### Changed
- **App Navigation Architecture**: Moved `app/index.tsx` into `app/(tabs)/index.tsx` and updated `app/_layout.tsx` to use the `(tabs)` group as the entry point, enabling the bottom tab bar across the main screens.
- **Home Tab Renamed**: Changed the first tab label from "MyAllowance" (app name) to "Cashflow" to better describe its transaction-tracking purpose.
- **Status Bar Visibility Fix**: Updated `StatusBar` in root layout from `style="auto"` to `style="dark"` with `translucent={true}` and `backgroundColor="transparent"`, ensuring Android system icons (battery, time, signal) are visible with `edgeToEdgeEnabled`.

### Database
- **New Supabase RPCs**: `get_portfolio_summary(p_user_id)`, `insert_new_asset(p_user_id, p_name, p_asset_type, p_invested_amount, p_current_value)`, `update_asset_valuation(p_asset_id, p_new_value)`.

---

## [4.3.2] - 2026-08-17

### Added
- **Dedicated Analysis Page** (`app/analysis.tsx`): New full-screen page titled "Analysis" that houses all three MoM trend cards — Savings Trends, Category Spending Trends, and Income Trends — with a back-navigation header and month/year subheading. The page independently loads transactions and all trend data based on `month` and `year` query params, keeping the dashboard lightweight.

### Changed
- **Trending-Up Icon → Navigate to Analysis**: The `trending-up-outline` icon in the Monthly Summary card now navigates to `/analysis?month=X&year=Y` instead of scrolling to an inline trend section. The icon is shown whenever transactions exist for the current month.
- **Dashboard Simplified** (`app/index.tsx`): Removed all trend-related state, imports, effects, and card rendering (~250 lines). The home page now focuses on: Monthly Summary → History → Categories.
- **`MonthlySummaryCard` Simplified** (`components/monthly-summary/monthly-summary-card.tsx`): Removed scroll ref dependencies (`categoryTrendRef`, `scrollViewRef`, `scrollOffsetRef`) and replaced with simple `selectedMonth`/`selectedYear` props and a `hasTransactions` flag. The icon handler now calls `router.push` instead of `scrollTo`.

### Fixed
- **6-Month Average Now Includes Zero Months**: All trend average calculations across Category Trends, Income Trends, and Savings Trends now divide by the full 6-month window instead of only counting months with non-zero values. This gives a more accurate true average that reflects months with no activity. Affected files: `category-trend-card.tsx`, `income-trend-card.tsx`, `savings-trend-card.tsx` (4 locations), and `savings-trend.ts` (`averageNet`, `averageSavingsRate`).

---

## [4.3.1] - 2026-08-14

### Added

- **6-Month Average on Category Trends**: The Category Trends bar chart now computes and displays a 6-month rolling average (excluding zero-spend months). A semi-transparent blue reference line is overlaid on the chart at the correct proportional height, accompanied by a floating `avg ₹X` badge. A `6-mo avg: ₹X/mo` stat row also appears below the current-vs-previous comparison line.
- **6-Month Average on Income Trends**: The Income Trends chart receives the same treatment with a green (`#28a745`) average reference line, badge, and `6-mo avg: ₹X/mo` stat row.
- **Scroll-to-Trends Icon on Monthly Summary**: A `trending-up` icon button is now displayed at the right edge of the "Monthly Summary" card header. Tapping it smoothly scrolls the dashboard down to the Category Trends card. The icon is only shown when at least one expense category exists. Implemented using `measureInWindow` + a scroll-offset ref for accurate positioning.
- **Total Trend View — Category Trends**: A "Total" pill is now pinned as the first item in the Category Trends pill scroll bar. Selecting it switches the chart to show aggregated total expenses across all categories for the 6-month window, including the average line, avg badge, comparison text, and 6-mo avg stat.
- **Total Trend View — Income Trends**: Same "Total" pill added to the Income Trends card, showing aggregated total income across all sources for the 6-month window.
- **MoM Savings Trends (Surplus/Deficit)**: New "Savings Trends" card on the dashboard providing 6-month historical tracking for net savings and financial health. Includes 4 interactive view modes via horizontal pills:
  - **Net Savings**: Monthly surplus (`+₹...`, emerald green `#10b981`) and deficit (`-₹...`, coral red `#ef4444`) bars, dual-colored 6-month average line, and month-over-month comparison.
  - **Savings Rate**: Monthly savings rate percentage (`(net / income) * 100`) with average rate overlay and comparison metrics.
  - **Income & Expenses**: Dedicated 6-month historical total income and expense comparison views.
- **Savings Trend Service** (`services/savings-trend.ts`): Fetches all transactions in a single 6-month window query and computes monthly net savings, savings rate, MoM trend direction, and average stats.
- **`getCategoryTotalTrendData`** (`services/category-trend.ts`): New service function that fetches all expense transactions over the 6-month window without a category filter, returning aggregated monthly totals and MoM trend data.
- **`getIncomeTotalTrendData`** (`services/income-trend.ts`): New service function that fetches all income transactions over the 6-month window without a source filter, returning aggregated monthly totals and MoM trend data.

### Changed

- **Trend Chart Container**: Both `CategoryTrendCard` and `IncomeTrendCard` now wrap their bar chart in a `trendChartWrapper` (`position: relative`) to support the absolute-positioned average line overlay, with `marginBottom` moved from the inner container to the wrapper.
- **`trendStyles` / `incomeTrendStyles` / `savingsTrendStyles`** (`assets/styles/index.style.js`): Added `trendChartWrapper`, `trendAvgLine`, `trendAvgLabel`, `trendAvgLabelText`, `trendAvgStat`, `trendAvgStatText`, `trendAvgStatLabel` to trend style objects, along with the full `savingsTrendStyles` suite.
- **`summaryStyles`** (`assets/styles/index.style.js`): Added `summaryTitleRow` (row layout with `position: relative`) and `summaryTrendIcon` (absolute right-aligned) to support the new icon button without shifting the centred title.
- **`CategoryTrendCard`**: Added `totalTrendData` / `totalLoading` props and internal `showTotal` state. Active dataset (`activeData`) switches between `totalTrendData` and `trendData` based on the selected pill; all chart rendering, badge, comparison text, and average stat use `activeData`. Selecting a category pill resets `showTotal` to `false`.
- **`IncomeTrendCard`**: Same structural change as `CategoryTrendCard`, using green theming. `totalTrendData` / `totalLoading` props added; internal `showTotal` state drives active dataset.
- **Dashboard Trend Layout** (`app/index.tsx`): Positioned `SavingsTrendCard` directly below `IncomeTrendCard` with proper bottom spacing for Floating Action Buttons.

---

## [4.3.0] - 2026-08-14

### Added

- **MoM Category Spending Trends**: New "Category Trends" card on the dashboard showing a 6-month bar chart for each expense category. Users can switch between categories via horizontal pill selectors. Includes a MoM change badge (↑/↓/Flat) and a current-vs-previous month comparison line.
- **MoM Income Trends**: New "Income Trends" card on the dashboard showing a 6-month bar chart for each income source. Uses green-themed styling (`#28a745`) to visually distinguish from the blue expense trends. Includes the same pill selector, MoM badge, and comparison features.
- **Income Trend Service** (`services/income-trend.ts`): Fetches income transactions over a 6-month rolling window from Supabase, grouped by income source, and computes MoM change percentage and trend direction.
- **Category Trend Service** (`services/category-trend.ts`): Fetches expense transactions over a 6-month rolling window from Supabase, grouped by category, and computes MoM change percentage and trend direction.

---

## [4.2.0] - 2026-08-07

### Changed

- **Category Insights Dropdown**: Replaced the segmented toggle next to "Categories" with an extensible dropdown picker. Users can now switch between "Spend Share" and "Income Impact" views, with room to add more metrics in the future.
- **Colored Card Fill**: Category cards now show the percentage visually as a colored background fill on the card itself, replacing the separate progress bar row. The fill color uses the same severity scale as budget progress bars (Blue → Yellow → Orange → Red) via `getProgressColor`.
- **Income History Tab**: The History page now has an Expenses/Income tab bar. The Income tab shows income transactions with a green color scheme, its own summary totals, and tab-specific empty states. The category filter only appears on the Expenses tab.

---

## [4.1.0] - 2026-06-01

### Added

- **Category Spending Insights on Dashboard**: Each expense category card now displays two visual progress bars:
  - **Spend Share**: Percentage of total expenses this category represents (blue bar)
  - **Income Impact**: Percentage of total income consumed by this category, with color-coded alerts — green (≤25%), orange (25–50%), red (>50%)

### Changed

- **Decimal Amount Input**: The amount field now accepts floating-point values (e.g., ₹12.50) when adding or editing expenses and income. Keyboard type changed from `numeric` to `decimal-pad`, with regex validation to allow only valid decimal patterns.
- **Expense History Filtering**: The Expense History page now shows only expenses, excluding income transactions from the list, totals, and transaction count.

### Fixed

- **Category Deep-Link from Dashboard**: Tapping a category card on the dashboard now correctly pre-selects that category in the Expense History filter. Previously, it always opened with "All" selected due to a `categoryName` vs `categoryId` param mismatch.

---

## [4.0.0] - 2026-05-03

### Added

- **Global Income Source Management**: Added `fetchIncomeSources` and `addIncomeSource` to allow adding new income sources directly into the `income_sources` table and caching them seamlessly via `services/income-source.ts`.
- **Unified Category Bottom Sheet**: Refactored `CategoryBottomSheet` to be used for both "expenses" and "incomes" based on a `type` prop, adapting titles, services, and behavior appropriately.
- **Dynamic Category Form**: Refactored `AddNewCategoryForm` to adapt its interface for either "Category" or "Income Source" additions based on a `type` prop.

### Changed

- **Income Category Loading** (`components/income/show-income-category.tsx` was removed/replaced):
  - Replaced hardcoded discrete UI paths with the reusable `CategoryBottomSheet` allowing consistent, database-driven loading of monthly income sources.
- **Add Transaction Wiring** (`app/add-transaction.tsx`):
  - Updated selection flow to persist the selected source using the new unified Bottom Sheet.
  - Selected month/year fetch optimizations implemented via global fetches.
  - Added `income_source_id` vs `category_id` reset logic when switching between the income and expense tabs to prevent data contamination.
- **Code Optimizations & Refinements**:
  - Removed outdated debug codes (`console.log`) throughout `services/`, `utils/`, `app/`, and `components/`.
  - Removed unused functions like `saveMonthlyBudgetCategories` and `saveMonthlyIncomeSources` from `services/monthly_records.ts` as they were obsoleted by individual insertions.
  - Cleaned out obsolete comment blocks, commented-out JSX structures, and unused variable assignments from `app/expense-history.tsx`, `app/auth/callback.tsx`, and `components/header/index-header.tsx`.
  - Removed stale mapping structures from `types/types.ts`.

### Fixed

- **Income Save Flow** (`app/add-transaction.tsx`):
  - Income transactions now submit reliably through the same save path as expenses via `insertTransaction` mapping `income_source_id` directly.
- **Validation Rules** (`app/add-transaction.tsx`):
  - Added type-aware validation: expense inherently requires `category_id`, income requires `income_source_id`.
- **RPC Column Discrepancy**:
  - Addressed crashes by stripping non-existent `total_budget` fields from the database RPC calls and relying on dynamically derived structures or valid fields.

## [3.1.0] - 29 March 2026

### Added

- **Income Source Selection Modal** (`components/modal/income-source-name-modal.tsx`):
  - Predefined income source options: Salary, Freelance, Investment, Gift, Refund, Other
  - Dynamic custom input field when "Other" is selected
  - Integrated dropdown selector into Set Income Source flow
- **Enhanced Dashboard UI**:
  - Separate "Edit Income Source" button with green styling (#28a745)
  - Color-differentiated action buttons: Blue (#007AFF) for Budget, Green (#28a745) for Income
  - Improved visual hierarchy and button spacing
- **Income Source Management**:
  - Delete all income sources with confirmation dialog
  - Loading modal feedback during deletion operations
  - Atomic deletion capability via `saveMonthlyIncomeSources` with empty array

### Changed

- **Set Income Source Component** (`components/income/set-income-source.tsx`):
  - Replaced `TextInput` with dropdown selector for income source name selection
  - Integrated `IncomeSourceNameModal` for streamlined selection flow
  - Implemented single modal instance pattern for improved state management
  - Added comprehensive delete functionality with user confirmation
- **Navigation**:
  - Monthly setup route now accepts `view` parameter (`budget` or `income`) to distinguish editing context
  - Dashboard buttons pass appropriate view parameter for targeted navigation
- **Service Layer**:
  - Removed legacy `services/budget.ts` (consolidated into `monthly_records.ts`)
  - Migrated budget deletion to use unified `delete_monthly_record` RPC

## [3.0.0] - 1 March 2026

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
