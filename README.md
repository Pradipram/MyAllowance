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

## 📁 Project Structure

```
MyAllowance/
├── app/                       # Main application screens
│   ├── _layout.tsx           # Root layout with auth state management
│   ├── index.tsx             # Dashboard with budget overview
│   ├── login.tsx             # Authentication screen (email & OAuth)
│   ├── signup.tsx            # User registration screen
│   ├── set-budget.tsx        # Budget setup and editing
│   ├── add-expense.tsx       # Expense entry with receipt upload
│   ├── expense-history.tsx   # Transaction history viewer
│   └── learn-more.tsx        # App information and guide
├── services/                  # Business logic and API calls
│   ├── budget.ts             # Budget CRUD operations
│   └── transaction.ts        # Transaction management
├── components/                # Reusable UI components
│   ├── expense/
│   │   └── show-category.tsx # Category selector component
│   ├── header/
│   │   └── header.tsx        # Custom header component
│   └── modal/
│       └── month-selector.tsx # Month picker modal
├── database/                  # SQL migration files
│   ├── insert_transaction_atomic.sql
│   └── delete_monthly_budget.sql
├── types/                     # TypeScript type definitions
│   └── budget.ts             # Budget, Transaction interfaces
├── utils/                     # Utility functions
│   ├── supabase.ts           # Supabase client configuration
│   └── storage.ts            # AsyncStorage helpers
├── assets/                    # Static assets (images, styles)
│   ├── images/
│   └── styles/
└── README.md                  # This comprehensive documentation
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript for enhanced development experience
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Navigation**: Expo Router (file-based routing) with dynamic headers
- **UI Components**: React Native core components + Ionicons for visual consistency
- **Date Handling**: @react-native-community/datetimepicker for precise date selection
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Development**: ESLint for code quality and consistency

## 💾 Database Architecture

### Supabase Tables

```
Database Schema:
├── users (managed by Supabase Auth)
│
├── monthly_budgets
│   ├── id (UUID, primary key)
│   ├── user_id (UUID, foreign key → users)
│   ├── month (INTEGER)
│   ├── year (INTEGER)
│   ├── total_budget (NUMERIC)
│   ├── total_spent (NUMERIC)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
│
├── budget_categories
│   ├── id (UUID, primary key)
│   ├── monthly_budget_id (UUID, foreign key → monthly_budgets)
│   ├── name (TEXT)
│   ├── amount (NUMERIC)
│   ├── spent (NUMERIC)
│   └── created_at (TIMESTAMP)
│
└── transactions
    ├── id (UUID, primary key)
    ├── user_id (UUID, foreign key → users)
    ├── category_id (UUID, foreign key → budget_categories)
    ├── category_name (TEXT)
    ├── amount (NUMERIC)
    ├── description (TEXT)
    ├── date (TIMESTAMP)
    ├── month (INTEGER)
    ├── year (INTEGER)
    ├── type (TEXT: 'expense' | 'income')
    ├── payment_mode (TEXT)
    ├── attachment_url (TEXT, optional)
    ├── is_deleted (BOOLEAN)
    ├── created_at (TIMESTAMP)
    └── updated_at (TIMESTAMP)
```

### ACID-Compliant Operations

- **Atomic Transactions**: PostgreSQL functions ensure all-or-nothing operations
- **Consistency**: Foreign key constraints maintain data integrity
- **Isolation**: Concurrent transactions handled with proper locking
- **Durability**: Changes committed to disk only after successful completion

### PostgreSQL Functions (RPC)

```sql
1. insert_full_transaction(...)
   - Inserts transaction
   - Updates category spent amount
   - Updates monthly budget total_spent
   - All operations atomic

2. delete_monthly_budget(...)
   - Verifies budget ownership
   - Deletes associated categories
   - Deletes budget record
   - Cascading deletion with rollback support
```

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

### 1. Authentication (login.tsx, signup.tsx)

- **Email/Password Login**: Secure authentication with Supabase
- **Google OAuth**: One-tap sign-in integration
- **Registration**: User account creation with validation
- **Password Reset**: Email-based recovery flow
- **Session Management**: Persistent authentication across app restarts

### 2. Dashboard (index.tsx)

- **Monthly Budget Overview**: Complete budget visualization with progress bars
- **Month Navigation**: Seamless navigation between months with current month highlighting
- **Quick Actions**: Direct access to expense history and budget editing
- **Smart Controls**: Context-aware buttons (Edit Budget, Add Expense) based on current month
- **Real-Time Calculations**: Live spending totals from Supabase transactions
- **Visual Progress Indicators**: Color-coded spending alerts and remaining balance display

### 3. Set Budget (set-budget.tsx)

- **Budget Creation**: Set up monthly budgets with custom categories
- **Category Management**: Add, edit, or remove budget categories
- **Month-Specific Editing**: Edit budgets with proper month context
- **Access Control**: Current month editing restrictions with feedback
- **Smart Validation**: Ensures data integrity and prevents invalid configurations
- **Budget Deletion**: Remove entire monthly budgets with confirmation

### 4. Add Expense (add-expense.tsx)

- **Streamlined Entry**: Fast expense logging with intuitive form
- **Category Selection**: Visual category chips from your budget
- **Payment Mode Grid**: Icon-based payment method selection
- **Smart Date Picker**: Default to current date with easy selection
- **Receipt Upload**: Attach screenshots or photos (UI ready)
- **ACID Transactions**: Atomic database operations ensuring data consistency

### 5. Expense History (expense-history.tsx)

- **Transaction List**: Chronological display of all expenses
- **Category Filtering**: Filter by category or view all
- **Monthly Summary**: Total expenses and transaction count
- **Smart Date Display**: Intelligent formatting (Today, Yesterday)
- **Payment Mode Indicators**: Visual icons for each transaction
- **Month-Specific Data**: Loads transactions from selected month

## 🔧 Key Implementation Details

### Authentication Flow

```typescript
// Supabase authentication with session persistence
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Google OAuth integration
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
});

// Session persistence across app restarts
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    setUser(session.user);
  } else {
    router.replace("/login");
  }
});
```

### ACID Transaction Management

```typescript
// Atomic transaction insertion with RPC
const { data, error } = await supabase.rpc("insert_full_transaction", {
  p_user_id: userId,
  p_category_id: transaction.categoryId,
  p_amount: transaction.amount,
  // ... other parameters
});

// PostgreSQL function ensures:
// 1. Insert transaction
// 2. Update category spent
// 3. Update monthly total_spent
// All operations succeed or all rollback
```

### Budget Management

```typescript
// Separate insert/update logic for data integrity
if (budget.id) {
  // Update existing budget
  await updateMonthlyBudget(budget);
} else {
  // Insert new budget
  await insertMonthlyBudget(budget, user_id);
}

// Category upsert with proper ID preservation
await upsertBudgetCategories(budget, budgetId);
```

### Data Fetching with Supabase

```typescript
// Fetch monthly budget with categories
const { data: budgetData } = await supabase
  .from("monthly_budgets")
  .select("*")
  .eq("month", month)
  .eq("year", year)
  .eq("user_id", user_id)
  .maybeSingle();

const { data: categoriesData } = await supabase
  .from("budget_categories")
  .select("*")
  .eq("monthly_budget_id", budgetData.id);
```

## 🚀 Recent Enhancements & Updates

### ✅ Completed Features

- **🔐 Full Authentication System**: Email/password and Google OAuth with Supabase
- **☁️ Cloud Database Migration**: Migrated from AsyncStorage to Supabase PostgreSQL
- **⚡ ACID Compliance**: Atomic transactions ensuring data consistency
- **🎨 Receipt Upload UI**: Screenshot attachment interface (backend pending)
- **🗑️ Budget Deletion**: Atomic deletion with cascading category removal
- **📊 Real-Time Sync**: Live data updates across all screens
- **🔄 Session Persistence**: Stay logged in across app restarts
- **💾 PostgreSQL Functions**: RPC for complex database operations

### 🎯 Key Improvements Made

1. **Authentication**: Complete user management with OAuth support
2. **Data Integrity**: ACID-compliant transactions prevent data corruption
3. **Scalability**: Cloud database supports unlimited users and data
4. **Security**: Row-level security policies protect user data
5. **Performance**: Optimized queries with proper indexing
6. **Code Quality**: Refactored with separate service layers

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
