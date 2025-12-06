export interface BudgetCategory {
  id?: string;
  name: string;
  amount: number;
  index: number; // for ordering
  spent?: number;
}

export interface Transaction {
  id?: string;
  user_id: string;

  category_id: string;
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

export interface MonthlyBudget {
  id?: string;
  month: number;
  year: number;
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
}
