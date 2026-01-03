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
- **Category Selection**: Choose from predefined budget categories with visual indicators
- **Payment Mode Tracking**: Cash, Card, UPI, Net Banking, and Other options with icons
- **Date Selection**: Smart date picker with "Today"/"Yesterday" shortcuts
- **Description Support**: Optional detailed descriptions for expenses
- **Screenshot Attachments**: Upload receipt photos for expense verification
- **Transaction Storage**: Automatic transaction recording in Supabase with ACID compliance
- **Edit Transactions**: Modify existing expense details (amount, category, date, payment mode)
- **Delete Transactions**: Remove transactions with confirmation dialog and automatic budget recalculation
- **Real-Time Budget Updates**: Automatic adjustment of spent amounts when editing or deleting

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

   - `database/insert_transaction_atomic.sql`
   - `database/delete_monthly_budget.sql`

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
- **💰 Income & Revenue Tracking**: Complete financial picture with income management
- **🎯 Goal Setting**: Savings goals, budget targets, and achievement tracking
- **📤 Export & Reporting**: PDF reports, CSV exports, and financial summaries

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

- **Backend**: Supabase PostgreSQL with 3 main tables + Auth
- **Lines of Code**: 3,500+ lines of TypeScript/TSX
- **Screens**: 7 fully-featured screens with authentication
- **Components**: 25+ reusable UI components
- **Database Functions**: 2 PostgreSQL RPC functions
- **Features**: 30+ major features implemented
- **Authentication**: Email/password + Google OAuth

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Backend powered by [Supabase](https://supabase.com)
- Icons from [Ionicons](https://ionic.io/ionicons)
- Date picker from [@react-native-community](https://github.com/react-native-datetimepicker/datetimepicker)
- TypeScript for type safety and developer experience

---

**Happy Budgeting! 💰📱✨**

_Transform your financial habits with intelligent budget tracking powered by Supabase._
