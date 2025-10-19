import AsyncStorage from "@react-native-async-storage/async-storage";
import { BudgetCategory, MonthlyBudget, Transaction } from "../types/budget";

const STORAGE_KEYS = {
  BUDGET_CATEGORIES: "budget_categories",
  MONTHLY_BUDGETS: "monthly_budgets",
  CURRENT_BUDGET: "current_budget",
  TRANSACTIONS: "transactions",
  USER_SETUP_COMPLETE: "user_setup_complete",
};

export const StorageService = {
  // Budget Categories
  async saveBudgetCategories(categories: BudgetCategory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BUDGET_CATEGORIES,
        JSON.stringify(categories)
      );
    } catch (error) {
      console.error("Error saving budget categories:", error);
      throw error;
    }
  },

  async getBudgetCategories(): Promise<BudgetCategory[]> {
    try {
      const categories = await AsyncStorage.getItem(
        STORAGE_KEYS.BUDGET_CATEGORIES
      );
      return categories ? JSON.parse(categories) : [];
    } catch (error) {
      console.error("Error getting budget categories:", error);
      return [];
    }
  },

  // Setup completion
  async setSetupComplete(complete: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SETUP_COMPLETE,
        JSON.stringify(complete)
      );
    } catch (error) {
      console.error("Error setting setup complete:", error);
      throw error;
    }
  },

  async isSetupComplete(): Promise<boolean> {
    try {
      const complete = await AsyncStorage.getItem(
        STORAGE_KEYS.USER_SETUP_COMPLETE
      );
      return complete ? JSON.parse(complete) : false;
    } catch (error) {
      console.error("Error checking setup complete:", error);
      return false;
    }
  },

  // Monthly Budget
  async saveMonthlyBudget(budget: MonthlyBudget): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_BUDGET,
        JSON.stringify(budget)
      );
    } catch (error) {
      console.error("Error saving monthly budget:", error);
      throw error;
    }
  },

  async getCurrentMonthlyBudget(): Promise<MonthlyBudget | null> {
    try {
      const budget = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_BUDGET);
      return budget ? JSON.parse(budget) : null;
    } catch (error) {
      console.error("Error getting current monthly budget:", error);
      return null;
    }
  },

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  },

  // Month-specific budget data
  async getMonthlyBudgetData(
    month: string,
    year: number
  ): Promise<MonthlyBudget | null> {
    try {
      const key = `monthly_budget_${year}_${month.padStart(2, "0")}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting monthly budget data:", error);
      return null;
    }
  },

  async saveMonthlyBudgetData(monthlyBudget: MonthlyBudget): Promise<void> {
    try {
      const key = `monthly_budget_${
        monthlyBudget.year
      }_${monthlyBudget.month.padStart(2, "0")}`;
      await AsyncStorage.setItem(key, JSON.stringify(monthlyBudget));
    } catch (error) {
      console.error("Error saving monthly budget data:", error);
      throw error;
    }
  },

  async getAllMonthlyBudgets(): Promise<MonthlyBudget[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const monthlyBudgetKeys = keys.filter((key) =>
        key.startsWith("monthly_budget_")
      );
      const monthlyBudgets = await AsyncStorage.multiGet(monthlyBudgetKeys);

      return monthlyBudgets
        .map(([key, value]) => (value ? JSON.parse(value) : null))
        .filter((budget) => budget !== null);
    } catch (error) {
      console.error("Error getting all monthly budgets:", error);
      return [];
    }
  },

  // Transaction Management
  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      const today = new Date();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear();
      const key = `transactions_${year}_${month}`;

      // Get existing transactions for this month
      const existingTransactions = await this.getMonthTransactions(month, year);

      // Add new transaction
      const updatedTransactions = [...existingTransactions, transaction];

      await AsyncStorage.setItem(key, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error("Error saving transaction:", error);
      throw error;
    }
  },

  async getMonthTransactions(
    month: string,
    year: number
  ): Promise<Transaction[]> {
    try {
      const key = `transactions_${year}_${month.padStart(2, "0")}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const transactions = JSON.parse(data);
        // Convert date strings back to Date objects
        return transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting month transactions:", error);
      return [];
    }
  },

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const transactionKeys = keys.filter((key) =>
        key.startsWith("transactions_")
      );
      const allTransactions = await AsyncStorage.multiGet(transactionKeys);

      const transactions = allTransactions
        .map(([key, value]) => (value ? JSON.parse(value) : []))
        .flat()
        .map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));

      return transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("Error getting all transactions:", error);
      return [];
    }
  },

  async deleteTransaction(
    transactionId: string,
    month: string,
    year: number
  ): Promise<void> {
    try {
      const key = `transactions_${year}_${month.padStart(2, "0")}`;
      const transactions = await this.getMonthTransactions(month, year);
      const updatedTransactions = transactions.filter(
        (t) => t.id !== transactionId
      );

      await AsyncStorage.setItem(key, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },

  // Auto Budget Suggestion Functions
  async getLastThreeMonthsSpending(
    currentYear: number,
    currentMonth: number
  ): Promise<{ [categoryId: string]: number[] }> {
    try {
      const monthlySpending: { [categoryId: string]: number[] } = {};

      // Get last 3 months
      const months = [];
      for (let i = 1; i <= 3; i++) {
        let month = currentMonth - i;
        let year = currentYear;

        if (month <= 0) {
          month += 12;
          year -= 1;
        }

        months.push({ month: month.toString().padStart(2, "0"), year });
      }

      // Collect spending data for each month
      for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
        const { month, year } = months[monthIndex];
        const transactions = await this.getMonthTransactions(month, year);

        // Calculate total spending per category for this month
        const monthCategoryTotals: { [categoryId: string]: number } = {};

        transactions.forEach((transaction) => {
          if (!monthCategoryTotals[transaction.categoryId]) {
            monthCategoryTotals[transaction.categoryId] = 0;
          }
          monthCategoryTotals[transaction.categoryId] += transaction.amount;
        });

        // Add monthly totals to the spending history
        Object.keys(monthCategoryTotals).forEach((categoryId) => {
          if (!monthlySpending[categoryId]) {
            monthlySpending[categoryId] = [];
          }
          monthlySpending[categoryId].push(monthCategoryTotals[categoryId]);
        });
      }

      return monthlySpending;
    } catch (error) {
      console.error("Error getting last three months spending:", error);
      return {};
    }
  },

  async generateBudgetSuggestions(
    currentYear: number,
    currentMonth: number
  ): Promise<BudgetCategory[]> {
    try {
      // Get base categories (template)
      const baseCategories = await this.getBudgetCategories();
      if (baseCategories.length === 0) {
        return [];
      }

      // Get spending patterns from last 3 months
      const monthlySpending = await this.getLastThreeMonthsSpending(
        currentYear,
        currentMonth
      );

      const suggestions: BudgetCategory[] = baseCategories.map((category) => {
        const spendingHistory = monthlySpending[category.id] || [];

        let suggestedAmount = category.amount; // Default to current amount

        if (spendingHistory.length > 0) {
          // Calculate average spending
          const averageSpending =
            spendingHistory.reduce((sum, amount) => sum + amount, 0) /
            spendingHistory.length;

          // Add 10% buffer to average spending, but minimum of current budget
          suggestedAmount = Math.max(
            Math.round(averageSpending * 1.1),
            category.amount
          );
        }

        return {
          ...category,
          amount: suggestedAmount,
          spent: 0, // Reset spent amount for new month
        };
      });

      return suggestions;
    } catch (error) {
      console.error("Error generating budget suggestions:", error);
      return [];
    }
  },

  async shouldShowAutoSuggestion(
    currentYear: number,
    currentMonth: number
  ): Promise<boolean> {
    try {
      // Check if user has historical data (at least 2 months)
      const monthlySpending = await this.getLastThreeMonthsSpending(
        currentYear,
        currentMonth
      );
      const categoriesWithHistory = Object.keys(monthlySpending).filter(
        (categoryId) => monthlySpending[categoryId].length >= 2
      );

      return categoriesWithHistory.length > 0;
    } catch (error) {
      console.error("Error checking auto suggestion eligibility:", error);
      return false;
    }
  },
};
