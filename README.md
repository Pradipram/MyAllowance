# My Allowance 💰

A comprehensive React Native budget tracking and investment portfolio app built with Expo and Supabase that helps users manage monthly expenses, track spending across categories, monitor investment portfolios, and maintain detailed financial history with real-time insights.

## 📱 Features

### 🎯 Core Functionality

- **User Authentication**: Secure email/password login and Google OAuth integration
- **Monthly Budget Management**: Set up and edit budget categories with custom amounts
- **Month-Specific Tracking**: Independent budget data for each month with seamless navigation
- **Expense Tracking**: Add expenses with detailed information and payment mode tracking
- **Decimal Amount Support**: Enter precise amounts with floating-point values (e.g., ₹12.50) using a decimal-friendly keyboard
- **Receipt Upload**: Attach screenshots or photos of receipts to expenses
- **Expense History**: Comprehensive transaction history with filtering and chronological sorting
- **Analysis Page**: Dedicated analysis screen with Savings, Category Spending, and Income trend charts accessible via the trending-up icon on the dashboard
- **Bottom Tab Navigation**: Two-tab layout — **Cashflow** (transactions & budgets) and **Portfolio** (asset tracking) — for seamless switching between financial views
- **Progress Visualization**: Real-time progress bars with color-coded spending alerts
- **Smart Navigation**: Month-by-month navigation with future month restrictions

### 🔐 Authentication & Security

- **Email/Password Authentication**: Secure user registration and login via Supabase
- **Google OAuth**: One-tap sign-in with Google account
- **Session Persistence**: Stay logged in across app restarts
- **Password Reset**: Email-based password recovery flow
- **Protected Routes**: Automatic redirect to login for unauthenticated users

### 💳 Advanced Expense Management

- **Quick Expense Entry**: Streamlined form for fast expense logging
- **Dual-Mode Entry**: Separate icons for adding income (+) and expenses (-) from dashboard
- **Dual Setup Flow**: Separate "Set Up Budget" and "Setup Income Source" buttons for first-time configuration
- **Income Source Selection**: Income sources are loaded from the current month's setup data in Supabase
- **Category Selection**: Choose from predefined budget categories or dynamic income sources using a robust `CategoryBottomSheet` adapted universally for both environments.
- **Global Income Source Management**: Added `fetchIncomeSources` and `addIncomeSource` to allow adding new income sources directly into the `income_sources` table and caching them seamlessly via `services/income-source.ts`.
- **Unified Category Bottom Sheet**: Refactored `CategoryBottomSheet` to be used for both "expenses" and "incomes" based on a `type` prop, adapting titles, services, and behavior appropriately.
- **Transactions & Architecture Enhancements v4.0.0**: Stripped out legacy functions formatting `console.log` codes and unused files, adapting `CategoryBottomSheet` dynamically, creating a single highly-optimized source of truth for both incomes and expenses.
- **Seamless Mode Switching**: Smooth animated transitions between Income and Expense modes with header toggle
- **Payment Mode Tracking**: Cash, Card, UPI, Net Banking, and Other options with icons
- **Date Selection**: Smart date picker with "Today"/"Yesterday" shortcuts
- **Description Support**: Optional detailed descriptions for expenses and income
- **Screenshot Attachments**: Upload receipt photos for expense verification
- **Transaction Storage**: Automatic transaction recording in Supabase with ACID compliance
- **Type-Based Processing**: Intelligent RPC functions handle Income vs Expense logic separately
- **Income Transaction Saving**: Income entries are now saved through the same add transaction flow as expenses
- **Edit Transactions**: Modify existing transaction details (amount, category, date, payment mode)
- **Delete Transactions**: Remove transactions with confirmation dialog and automatic budget recalculation
- **Delete Income Sources**: Bulk delete all income sources for a month with confirmation
- **Real-Time Updates**: Automatic adjustment of spent amounts and income when editing or deleting

### 📊 History & Analytics

- **Comprehensive Transaction List**: View all expenses and income in chronological order
- **Tabbed View**: Switch between Expenses and Income tabs to view transactions by type
- **Category Filtering**: Filter expenses by specific categories or view all
- **Category Deep-Link**: Tap any category on the dashboard to jump directly to its filtered history
- **Monthly Summary**: Total expenses and transaction count for selected month
- **Smart Date Display**: Intelligent date formatting (Today, Yesterday, specific dates)
- **Payment Mode Indicators**: Visual icons showing how each expense was paid
- **Cross-Month Navigation**: Seamlessly view history for any month
- **Transaction Management**: Edit or delete any transaction directly from the list
- **Loading Indicators**: Visual feedback during transaction deletion
- **Auto-Refresh**: Dashboard updates automatically after transaction changes

### 🔒 Enhanced Access Control

- **Current Month Restriction**: Budget editing only allowed for current month
- **Historical Data Protection**: Past month data remains unchanged
- **Future Month Prevention**: Cannot set budgets or add expenses for future months
- **Smart UI**: Context-aware buttons and navigation based on selected month
- **Data Consistency**: Synchronized calculations between dashboard and expense history

### 📊 Visual Insights & Analytics

- **Progress Bars**: Color-coded spending visualization (Blue → Yellow → Orange → Red)
- **Monthly Overview**: Total budget, spent amount, and remaining balance
- **Category Breakdown**: Individual category progress and spending details
- **Spend Share Insight**: Each category shows its percentage contribution to total expenses via a colored card background fill
- **Income Impact Insight**: Each category shows how much of your total income it consumes via a colored card background fill, with severity-based coloring (Blue → Yellow → Orange → Red)
- **Category View Dropdown**: Extensible dropdown picker next to "Categories" to switch between Spend Share, Income Impact, and future metric views
- **MoM Category Spending Trends**: 6-month bar chart per expense category with pill selector, MoM change badge (↑/↓/Flat), and current-vs-previous month comparison
- **MoM Income Trends**: 6-month bar chart per income source with green-themed styling, pill selector, MoM badge, and comparison line
- **MoM Savings Trends (Surplus / Deficit)**: 6-month financial health tracking with 4 view modes (Net Savings, Savings Rate, Income, Expenses), surplus/deficit color coding (Green `#10b981` / Red `#ef4444`), MoM improvement badges, average reference lines, and comparison summaries
- **6-Month Average Line on Trends**: Category, Income, and Savings trend charts display proportional average reference lines (including zero-activity months) overlaid on the bars, floating `avg` badges, and `6-mo avg` summary stats
- **Analysis Page Shortcut**: A `trending-up` icon in the Monthly Summary card header navigates to the dedicated Analysis page for the selected month
- **Total Trend View**: A "Total" pill pinned at the start of both Category Trends and Income Trends pill scroll bars for viewing aggregate historical performance across all categories or income sources
- **Current Month Indicator**: Clear visual indication of which month is current
- **Dashboard Action Buttons**: Separate "Edit Budget" (Blue) and "Edit Income Source" (Green) buttons for streamlined access
- **Quick Navigation**: Direct access to budget and income management from dashboard
- **Real-Time Updates**: Live calculation from actual transaction data
- **Consistent Totals**: Unified spending calculations across all screens

### 📈 Portfolio & Asset Tracking

- **Portfolio Dashboard**: Dedicated tab showing total portfolio value with absolute and percentage return delta, color-coded (green for gains, red for losses)
- **Asset Management**: Track individual holdings across Equity, Mutual Funds, and other asset types with invested amount vs. current market value
- **Add Asset Flow**: Dedicated form screen with name, type selector, invested amount, and current value inputs with decimal-pad keyboard and form validation
- **Quick Valuation Updates**: Tap any asset card to open a bottom-sheet modal for rapid market value updates without leaving the portfolio view
- **Auto-Refresh on Focus**: Portfolio data refreshes automatically when navigating back to the tab
- **Pull-to-Refresh**: Swipe down on the portfolio list to manually refresh all asset data
- **Clean Empty State**: Friendly onboarding message when no assets have been added yet
- **Floating Action Button**: Quick access to Add Asset screen from the portfolio dashboard

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- React Native development environment
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Pradipram/MyAllowance.git
   cd MyAllowance
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Supabase**

   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**

   Run the SQL migration files in your Supabase SQL Editor:
   - `database/monthly_record/create_table.sql` - Creates the central monthly_records table and links budget categories and income sources
   - `database/monthly_record/monthly_record_rls.sql` - Applies Row Level Security policies for monthly records
   - `database/monthly_record/data_migration_from_old.sql` - **[Existing Users Only]** Migrates data from old monthly_budgets table to new monthly_records structure
   - `database/monthly_record/migration_fk_cascade.sql` - **[Mar 1, 2026]** Fixes FK constraints on `budget_categories` and `income_sources` to use `ON DELETE CASCADE`
   - `database/budget_categories/sql_scripts.sql` - **[Schema Update]** Adds `budget` column to budget_categories table (Feb 7, 2026)
   - `database/income_source/sql_scripts.sql` - **[Schema Update]** Renames `amount` to `earned` in income_sources table (Feb 7, 2026)
   - `database/rpc/get_monthly_records.sql` - Retrieves complete monthly financial data with nested budget categories and income sources
   - `database/rpc/monthly_record/upsert_monthly_record.sql` - Creates/updates monthly records with improved column naming
   - `database/rpc/monthly_record/delete_monthly_record.sql` - Deletes monthly records with explicit child-row cleanup (transactions → budget_categories → income_sources) before parent deletion
   - `database/rpc/transaction/insert/migration_add_income_source_to_transactions.sql` - **[Mar 1, 2026]** Adds `income_source_id` column and makes `category_id` nullable on the `transactions` table
   - `database/rpc/transaction/insert/migration_drop_old_insert_overload.sql` - **[Mar 1, 2026]** Drops the old 9-param `insert_full_transaction_v2` overload and deploys the correct 11-param version
   - `database/rpc/transaction/insert/insert_full_transaction_v2.sql` - Handles income and expense transactions; writes totals exclusively to `monthly_records`
   - `database/rpc/transaction/update/update_full_transactin_v2.sql` - Updates transactions with revert-and-apply logic against `monthly_records`
   - `database/rpc/transaction/delete/delete_full_transaction.sql` - Deletes transactions and reverses totals in `monthly_records`

   **Database Schema:**
   - `monthly_records` table: Central table storing monthly financial summaries with total income, budget, and spent aggregates (One record per user per month)
   - `budget_categories` table: Stores expense budget categories with `budget` column (renamed from `amount` for clarity) and references to monthly_records
   - `income_sources` table: Tracks individual income sources with `earned` column (renamed from `amount` for semantic accuracy), linked to monthly_records
   - `transactions` table: Records all income and expense transactions with type and source fields

   **RPC Functions:**
   - `get_monthly_record`: Retrieves complete monthly financial data with nested budget categories and income sources in a single query
   - `upsert_monthly_record`: Creates or updates monthly records with budget categories and income sources using improved column naming (`budget` and `earned`)
   - `delete_monthly_record`: Deletes monthly records with automatic cascading removal of all budget categories, income sources, and associated transactions
   - `insert_full_transaction_v2`: Processes income/expense with income source tracking and validation
   - `update_full_transaction_v2`: Updates transactions with revert-and-apply logic and income source switching
   - `delete_full_transaction`: Removes transactions and reverses income source and monthly total adjustments

   **⚠️ Important for Existing Users:**
   If you're upgrading from a previous version with the old `monthly_budgets` table structure, run the `data_migration_from_old.sql` script **after** creating the new `monthly_records` table. This will:
   - Migrate all existing budget data to the new unified structure
   - Preserve your historical budget and spending information
   - Link existing budget categories to the new monthly_records
   - Initialize income tracking (set to 0 for migrated data)

5. **Configure Google OAuth (Optional)**
   - Set up OAuth credentials in Google Cloud Console
   - Add redirect URIs in Supabase Auth settings
   - Configure OAuth provider in Supabase dashboard

6. **Start the development server**

   ```bash
   npx expo start
   ```

7. **Run on device/emulator**
   - Scan QR code with Expo Go app (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript for enhanced development experience
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Navigation**: Expo Router (file-based routing) with bottom tab navigation and dynamic headers
- **UI Components**: React Native core components + Ionicons for visual consistency
- **Date Handling**: @react-native-community/datetimepicker for precise date selection
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Development**: ESLint for code quality and consistency

## 🚀 Future Enhancements

### Planned Features

- ~~**📊 Advanced Analytics Dashboard**: Detailed spending trends, insights, and financial health metrics~~ ✅ Delivered in v4.3.0
- ~~**📈 Portfolio & Asset Tracking**: Investment portfolio management with real-time valuation tracking~~ ✅ Delivered in v4.4.0
- **📈 Interactive Charts & Graphs**: Visual spending analysis with customizable time periods
- **🔔 Smart Notifications**: Budget alerts, spending reminders, and milestone notifications
- **☁️ Cloud Sync & Backup**: Secure data backup and multi-device synchronization
- **💡 AI-Powered Insights**: Machine learning-based budget recommendations and spending analysis
- **📱 Home Screen Widgets**: Quick budget overview and expense entry widgets
- **🏷️ Advanced Categorization**: Custom tags, subcategories, and smart auto-categorization
- **🎯 Goal Setting**: Savings goals, budget targets, and achievement tracking
- **📤 Export & Reporting**: PDF reports, CSV exports, and financial summaries
- ~~**💵 Advanced Income Analytics**: Income tracking with source breakdown and trends~~ ✅ Delivered in v4.3.0

### Technical Roadmap

- **🔐 Enhanced Security**: Biometric authentication and data encryption
- **🌐 Web Dashboard**: Companion web application for desktop management
- **🔄 Real-Time Sync**: Live data synchronization across all devices
- **📊 Advanced Analytics Engine**: Complex financial calculations and predictions
- **� Theme Customization**: Multiple color schemes and personalization options

## 💡 Usage Tips & Best Practices

### Getting Started

1. **Initial Setup**: Create 5-8 essential budget categories (Food, Transport, Entertainment, etc.)
2. **Start Simple**: Begin with round numbers and adjust based on actual spending patterns
3. **Daily Tracking**: Add expenses immediately to maintain accurate records
4. **Weekly Reviews**: Check progress weekly to stay on track with budgets

### Effective Budget Management

- **Set Realistic Budgets**: Base amounts on historical spending data, not wishful thinking
- **Use Payment Mode Tracking**: Understand your spending patterns across different payment methods
- **Regular Category Review**: Adjust categories monthly based on lifestyle changes
- **Monitor Progress Colors**: Take action when categories turn orange (75%+ spent)

### Pro Tips

- **Month-End Analysis**: Review expense history before setting next month's budget
- **Category Balancing**: Move unused budget from one category to another mid-month
- **Emergency Buffer**: Always include a 10-15% buffer in your total budget
- **Consistent Tracking**: Use descriptive expense descriptions for better analysis
- **Fix Mistakes Quickly**: Use the edit feature to correct transaction errors immediately
- **Regular Cleanup**: Remove duplicate or erroneous transactions to maintain data accuracy and integrity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Pradipram**

- GitHub: [@Pradipram](https://github.com/Pradipram)
- Project: [MyAllowance](https://github.com/Pradipram/MyAllowance)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev) for cross-platform excellence
- Icons provided by [Ionicons](https://ionic.io/ionicons) for consistent visual language
- Date picker from [@react-native-community](https://github.com/react-native-datetimepicker/datetimepicker) for precise date handling
- TypeScript for enhanced developer experience and code reliability

## 📊 Development Stats

- **Backend**: Supabase PostgreSQL with 8 main tables (monthly_records, budget_categories, income_sources, transactions, assets, asset_valuations, auth, and related tables)
- **Lines of Code**: 5,000+ lines of TypeScript/TSX
- **Screens**: 10 fully-featured screens with authentication
- **Components**: 31+ reusable UI components
- **Database Functions**: 7 PostgreSQL RPC functions (get_monthly_record, insert/update/delete transactions, get_portfolio_summary, insert_new_asset, update_asset_valuation) with enhanced validation and atomic operations
- **Features**: 50+ major features implemented
- **Authentication**: Email/password + Google OAuth
- **Income Management**: Full income tracking with database-driven monthly income sources and source-level tracking
- **Portfolio Management**: Investment tracking with asset types, valuation history, and portfolio-level aggregations
- **Unified Data Model**: Centralized monthly_records table linking budgets, income sources, and transactions

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Backend powered by [Supabase](https://supabase.com)
- Icons from [Ionicons](https://ionic.io/ionicons)
- Date picker from [@react-native-community](https://github.com/react-native-datetimepicker/datetimepicker)
- TypeScript for type safety and developer experience

---

**Happy Budgeting! 💰📱✨**

_Transform your financial habits with intelligent budget tracking powered by Supabase._
