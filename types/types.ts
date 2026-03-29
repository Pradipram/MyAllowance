export interface BudgetCategory {
  id?: string;
  name: string;
  budget: number;
  index: number; // for ordering
  spent?: number;
}

export interface Transaction {
  id?: string;
  user_id: string;

  category_id?: string;
  income_source_id?: string;
  category_name: string;

  amount: number;
  description: string;

  date: Date;
  month: number;
  year: number;

  type: "expense" | "income";
  payment_mode: string;

  attachment_url?: string;

  created_at: Date;
  updated_at: Date;

  is_deleted: boolean;
  deleted_at?: Date;
}

export enum IncomeSourceType {
  ACTIVE = "active",
  PASSIVE = "passive",
}

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string; // e.g. "Salary", "Dividends"
  income_type: IncomeSourceType;
  earned: number; // Total accumulated for this month
}

export enum IncomeSourceFields {
  NAME = "name",
  TYPE = "income_type",
}

export interface MonthlyRecord {
  id: string; // The single ID for "Feb 2026"
  user_id: string;
  month: number;
  year: number;

  // 💰 The "Money In" Section
  total_income: number;
  income_sources: IncomeSource[]; // The array of Salary, Dividends, etc.

  // 💸 The "Money Out" Section
  total_budget: number;
  total_spent: number;
  budget_categories: BudgetCategory[]; // The array of Food, Rent, etc.

  // ⚙️ Metadata
  created_at?: string;
  updated_at?: string;
}
