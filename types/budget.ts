export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  spent?: number;
  color?: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
  type: "expense" | "income";
  paymentMode?: string;
}

export interface MonthlyBudget {
  id: string;
  month: string;
  year: number;
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
}
