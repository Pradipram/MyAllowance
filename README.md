# My Allowance 💰

A comprehensive React Native budget tracking app built with Expo and Supabase that helps users manage their monthly expenses, track spending across different categories, and maintain detailed expense history with real-time financial insights.

## 📱 Features

### 🎯 Core Functionality

- **User Authentication**: Secure email/password login and Google OAuth integration
- **Monthly Budget Management**: Set up and edit budget categories with custom amounts
- **Month-Specific Tracking**: Independent budget data for each month with seamless navigation
- **Expense Tracking**: Add expenses with detailed information and payment mode tracking
- **Receipt Upload**: Attach screenshots or photos of receipts to expenses
- **Expense History**: Comprehensive transaction history with filtering and chronological sorting
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
- **Category Selection**: Choose from predefined budget categories with visual indicators
- **Income Categories**: Salary, Gift, Investment, Refund, Freelance, and Other with custom icons
- **Seamless Mode Switching**: Smooth animated transitions between Income and Expense modes with header toggle
- **Payment Mode Tracking**: Cash, Card, UPI, Net Banking, and Other options with icons
- **Date Selection**: Smart date picker with "Today"/"Yesterday" shortcuts
- **Description Support**: Optional detailed descriptions for expenses and income
- **Screenshot Attachments**: Upload receipt photos for expense verification
- **Transaction Storage**: Automatic transaction recording in Supabase with ACID compliance
- **Type-Based Processing**: Intelligent RPC functions handle Income vs Expense logic separately
- **Edit Transactions**: Modify existing transaction details (amount, category, date, payment mode)
- **Delete Transactions**: Remove transactions with confirmation dialog and automatic budget recalculation
- **Real-Time Updates**: Automatic adjustment of spent amounts and income when editing or deleting

### 📊 Expense History & Analytics

- **Comprehensive Transaction List**: View all expenses in chronological order
- **Category Filtering**: Filter expenses by specific categories or view all
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
- **Current Month Indicator**: Clear visual indication of which month is current
- **Real-Time Updates**: Live calculation from actual transaction data
- **Consistent Totals**: Unified spending calculations across all screens

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

   - `database/rpc/transaction/insert/insert_full_transaction_v2.sql` - Handles income and expense transactions with enhanced validation
   - `database/rpc/transaction/update/update_full_transactin_v2.sql` - Updates transactions with income source tracking
   - `database/rpc/transaction/delete/delete_full_transaction.sql` - Deletes transactions with income source reversal
   - `database/delete_monthly_budget.sql` - Manages budget and income deletion

   **Database Schema:**
   - `monthly_budgets` table: Stores expense budgets with categories
   - `monthly_incomes` table: Stores monthly income data separately (UUID primary key, RLS policies)
   - `income_sources` table: Tracks individual income sources with amounts
   - `transactions` table: Records all income and expense transactions with type and source fields
   
   **RPC Functions:**
   - `insert_full_transaction_v2`: Processes income/expense with income source tracking and validation
   - `update_full_transaction_v2`: Updates transactions with revert-and-apply logic and income source switching
   - `delete_full_transaction`: Removes transactions and reverses income source and monthly total adjustments

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
- **Navigation**: Expo Router (file-based routing) with dynamic headers
- **UI Components**: React Native core components + Ionicons for visual consistency
- **Date Handling**: @react-native-community/datetimepicker for precise date selection
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Development**: ESLint for code quality and consistency

## 🚀 Future Enhancements

### Planned Features

- **📊 Advanced Analytics Dashboard**: Detailed spending trends, insights, and financial health metrics
- **📈 Interactive Charts & Graphs**: Visual spending analysis with customizable time periods
- **🔔 Smart Notifications**: Budget alerts, spending reminders, and milestone notifications
- **☁️ Cloud Sync & Backup**: Secure data backup and multi-device synchronization
- **💡 AI-Powered Insights**: Machine learning-based budget recommendations and spending analysis
- **📱 Home Screen Widgets**: Quick budget overview and expense entry widgets
- **🏷️ Advanced Categorization**: Custom tags, subcategories, and smart auto-categorization
- **🎯 Goal Setting**: Savings goals, budget targets, and achievement tracking
- **📤 Export & Reporting**: PDF reports, CSV exports, and financial summaries
- **💵 Advanced Income Analytics**: Income tracking with source breakdown and trends

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

- **Backend**: Supabase PostgreSQL with 5 main tables (budgets, incomes, income_sources, transactions, auth)
- **Lines of Code**: 4,000+ lines of TypeScript/TSX
- **Screens**: 8 fully-featured screens with authentication
- **Components**: 28+ reusable UI components
- **Database Functions**: 3 PostgreSQL RPC functions with enhanced income source validation and atomic operations
- **Features**: 35+ major features implemented
- **Authentication**: Email/password + Google OAuth
- **Income Management**: Full income tracking with 6 predefined categories and source-level tracking

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Backend powered by [Supabase](https://supabase.com)
- Icons from [Ionicons](https://ionic.io/ionicons)
- Date picker from [@react-native-community](https://github.com/react-native-datetimepicker/datetimepicker)
- TypeScript for type safety and developer experience

---

**Happy Budgeting! 💰📱✨**

_Transform your financial habits with intelligent budget tracking powered by Supabase._
