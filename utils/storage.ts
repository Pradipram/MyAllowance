import AsyncStorage from "@react-native-async-storage/async-storage";
import { BudgetCategory, MonthlyBudget } from "../types/budget";

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
};
