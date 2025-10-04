# My Allowance 💰

A comprehensive React Native budget tracking app built with Expo that helps users manage their monthly expenses, track spending across different categories, and maintain detailed expense history with real-time financial insights.

## 📱 Features

### 🎯 Core Functionality

- **Monthly Budget Management**: Set up and edit budget categories with custom amounts
- **Month-Specific Tracking**: Independent budget data for each month with seamless navigation
- **Expense Tracking**: Add expenses with detailed information and payment mode tracking
- **Expense History**: Comprehensive transaction history with filtering and chronological sorting
- **Progress Visualization**: Real-time progress bars with color-coded spending alerts
- **Smart Navigation**: Month-by-month navigation with future month restrictions

### 💳 Advanced Expense Management

- **Quick Expense Entry**: Streamlined form for fast expense logging
- **Category Selection**: Choose from predefined budget categories with visual indicators
- **Payment Mode Tracking**: Cash, Card, UPI, Net Banking, and Other options with icons
- **Date Selection**: Smart date picker with "Today"/"Yesterday" shortcuts
- **Description Support**: Optional detailed descriptions for expenses
- **Transaction Storage**: Automatic transaction recording for detailed history tracking

### 📊 Expense History & Analytics

- **Comprehensive Transaction List**: View all expenses in chronological order
- **Category Filtering**: Filter expenses by specific categories or view all
- **Monthly Summary**: Total expenses and transaction count for selected month
- **Smart Date Display**: Intelligent date formatting (Today, Yesterday, specific dates)
- **Payment Mode Indicators**: Visual icons showing how each expense was paid
- **Cross-Month Navigation**: Seamlessly view history for any month

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

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Scan QR code with Expo Go app (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 📁 Project Structure

```
MyAllowance/
├── app/                    # Main application screens
│   ├── index.tsx          # Dashboard with month navigation and quick actions
│   ├── onboarding.tsx     # Budget setup and editing with month context
│   ├── add-expense.tsx    # Expense entry form with payment mode tracking
│   ├── expense-history.tsx # Comprehensive expense history with filtering
│   ├── learn-more.tsx     # App information and comprehensive guide
│   └── _layout.tsx        # Root layout configuration
├── types/                 # TypeScript type definitions
│   └── budget.ts          # Budget, Transaction, MonthlyBudget interfaces
├── utils/                 # Utility functions and services
│   └── storage.ts         # Complete AsyncStorage service with transaction management
├── assets/                # Static assets (images, icons)
└── README.md              # This comprehensive documentation
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript for enhanced development experience
- **Navigation**: Expo Router (file-based routing) with dynamic headers
- **Storage**: AsyncStorage for local data persistence and transaction storage
- **UI Components**: React Native core components + Ionicons for visual consistency
- **Date Handling**: @react-native-community/datetimepicker for precise date selection
- **Development**: ESLint for code quality and consistency

## 💾 Enhanced Data Storage

### Storage Architecture

```
AsyncStorage Keys:
├── budget_categories           # Base budget template categories
├── user_setup_complete        # Onboarding completion flag
├── monthly_budget_YYYY_MM     # Month-specific budget data
│   ├── 2025_10               # October 2025 budget data
│   ├── 2025_11               # November 2025 budget data
│   └── ...                   # Other months with independent data
├── transactions_YYYY_MM       # Month-specific transaction records
│   ├── 2025_10               # October 2025 transactions
│   ├── 2025_11               # November 2025 transactions
│   └── ...                   # Complete transaction history
```

### Advanced Data Models

- **BudgetCategory**: Category name, amount, spent amount, visual indicators
- **Transaction**: Complete expense details with ID, payment mode, date, description
- **MonthlyBudget**: Complete month data with categories, totals, and metadata
- **PaymentMode**: Structured payment method tracking with icons and validation

## 🎨 User Interface

### Design Principles

- **Minimal & Clean**: Focus on essential features
- **Intuitive Navigation**: Clear visual hierarchy
- **Context Awareness**: UI adapts based on current state
- **Progressive Disclosure**: Information revealed as needed

### Color Scheme

- **Primary Blue**: #007AFF (buttons, accents)
- **Success Green**: #28a745 (positive balances)
- **Warning Orange**: #ff9500 (moderate spending)
- **Alert Red**: #ff4444 (overspending)
- **Neutral Gray**: Various shades for text and backgrounds

## 📱 App Screens

### 1. Dashboard (index.tsx)

- **Monthly Budget Overview**: Complete budget visualization with progress bars
- **Month Navigation**: Seamless navigation between months with current month highlighting
- **Quick Actions**: Direct access to expense history and budget editing
- **Smart Controls**: Context-aware buttons (Edit Budget, Add Expense) based on current month
- **Real-Time Calculations**: Live spending totals calculated from actual transactions
- **Visual Progress Indicators**: Color-coded spending alerts and remaining balance display

### 2. Expense History (expense-history.tsx)

- **Comprehensive Transaction List**: Chronological display of all expenses with details
- **Advanced Filtering**: Filter by category or view all transactions
- **Monthly Summary Card**: Total expenses and transaction count for selected period
- **Smart Date Display**: Intelligent formatting (Today, Yesterday, specific dates)
- **Payment Mode Indicators**: Visual icons showing payment method for each transaction
- **Month-Specific Data**: Loads transactions for the selected month from dashboard
- **Clean Navigation**: Dynamic header showing current month context

### 3. Onboarding & Budget Setup (onboarding.tsx)

- **Initial Budget Setup**: Comprehensive budget creation for new users
- **Month-Specific Editing**: Edit budgets with proper month context and restrictions
- **Category Management**: Add, remove, and edit budget categories with validation
- **Access Control**: Current month editing restrictions with clear user feedback
- **Smart Validation**: Ensures data integrity and prevents invalid configurations

### 4. Add Expense (add-expense.tsx)

- **Streamlined Entry**: Fast expense logging with intuitive form design
- **Category Selection**: Visual category chips with clear selection indicators
- **Payment Mode Grid**: Icon-based payment method selection with comprehensive options
- **Smart Date Picker**: Default to current date with easy selection options
- **Transaction Recording**: Automatic storage of complete transaction details
- **Current Month Validation**: Prevents adding expenses to non-current months

### 5. Learn More (learn-more.tsx)

- **Comprehensive Guide**: Complete app features explanation and usage instructions
- **Getting Started Tutorial**: Step-by-step guidance for new users
- **Feature Highlights**: Detailed explanation of key functionality and benefits
- **Best Practices**: Tips for effective budget management and expense tracking

## 🔧 Advanced Features Implementation

### Month-Specific Data Management

```typescript
// Each month maintains completely independent budget and transaction data
const monthData = await StorageService.getMonthlyBudgetData(month, year);
const transactions = await StorageService.getMonthTransactions(month, year);
```

### Enhanced Access Control Logic

```typescript
// Comprehensive current month validation with UI feedback
const isCurrentMonth = () => {
  return (
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear()
  );
};
```

### Real-Time Progress Visualization

```typescript
// Color-coded progress based on spending percentage with smooth transitions
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "#ff4444"; // Red - Critical
  if (percentage >= 75) return "#ff9500"; // Orange - Warning  
  if (percentage >= 50) return "#ffcc00"; // Yellow - Caution
  return "#007AFF"; // Blue - Safe
};
```

### Transaction Management System

```typescript
// Complete transaction lifecycle with automatic storage
const transaction: Transaction = {
  id: Date.now().toString(),
  categoryId: selectedCategory,
  amount: expenseAmount,
  description: description.trim() || "No description",
  date: selectedDate,
  type: "expense",
  paymentMode: selectedPaymentMode,
};

// Dual storage: Update budget categories AND save transaction
await StorageService.saveMonthlyBudgetData(updatedMonthData);
await StorageService.saveTransaction(transaction);
```

### Consistent Calculation Engine

```typescript
// Unified spending calculations across all screens
const getTotalSpent = () => {
  // Priority: Use actual transactions if available, fallback to budget data
  if (monthTransactions && monthTransactions.length > 0) {
    return monthTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  }
  return budgetCategories.reduce((total, cat) => total + (cat.spent || 0), 0);
};
```

### Smart Navigation with Parameter Passing

```typescript
// Context-aware navigation with month/year parameters
router.push(`./expense-history?month=${month}&year=${year}`);
```

## 🚀 Recent Enhancements & Updates

### ✅ Completed Features

- **🔄 Logic Consistency Fix**: Total spent calculations now perfectly synchronized between dashboard and expense history
- **📊 Advanced Expense History**: Complete transaction tracking with filtering, sorting, and detailed view
- **🎨 UI Improvements**: Removed duplicate headers, streamlined navigation, enhanced visual design
- **💾 Enhanced Storage**: Comprehensive transaction storage system with month-specific organization
- **🔧 Real-Time Updates**: Live data refresh when navigating between screens
- **📱 Dynamic Headers**: Context-aware screen titles showing current month information
- **⚡ Performance Optimization**: Efficient data loading and state management

### 🎯 Key Improvements Made

1. **Data Integrity**: Ensured all spending calculations use actual transaction data
2. **User Experience**: Eliminated duplicate UI elements and improved navigation flow
3. **Transaction Tracking**: Complete expense history with comprehensive filtering options
4. **Month Synchronization**: Consistent month context across all screens
5. **Visual Polish**: Clean, professional interface with proper spacing and typography

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

- **Lines of Code**: 2,500+ lines of TypeScript/TSX
- **Screens**: 5 fully-featured screens with advanced functionality  
- **Components**: 20+ reusable UI components
- **Storage Keys**: 10+ different data storage patterns
- **Features**: 25+ major features implemented and tested

---

**Happy Budgeting! 💰📱✨**

*Transform your financial habits with intelligent budget tracking and expense management.*
