export interface BudgetCategory {
  id?: string;
  name: string;
  budget: number;
  index: number;
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
  name: string;
  income_type: IncomeSourceType;
  earned: number;
}

export enum IncomeSourceFields {
  NAME = "name",
  TYPE = "income_type",
}

export interface MonthlyRecord {
  id: string;
  user_id: string;
  month: number;
  year: number;

  total_income: number;
  income_sources: IncomeSource[];

  total_budget: number;
  total_spent: number;
  budget_categories: BudgetCategory[];

  created_at?: string;
  updated_at?: string;
}

export interface Asset {
  asset_id: string;
  name: string;
  asset_type: string;
  invested_amount: number;
  current_value: number;
  absolute_delta: number;
  percentage_delta: number;
  updated_at: string;
}

export interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  absolute_delta: number;
  percentage_delta: number;
  assets: Asset[];
}

