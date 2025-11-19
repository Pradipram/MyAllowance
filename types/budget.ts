export interface BudgetCategory {
  id?: string;
  name: string;
  amount: number;
  spent?: number;
}

// export interface Transaction {
//   id: string;
//   categoryId: string;
//   amount: number;
//   description: string;
//   date: Date;
//   type: "expense" | "income";
//   paymentMode: string;
// }

export interface Transaction {
  id?: string;
  userId: string;

  categoryId: string;
  categoryName: string;

  amount: number;
  description: string;

  date: Date;
  month: number;
  year: number;

  type: "expense" | "income";
  paymentMode: string;

  attachmentUrl?: string;

  createdAt: Date;
  updatedAt: Date;

  isDeleted: boolean;
  deletedAt?: Date;
}

export interface MonthlyBudget {
  id?: string;
  month: number;
  year: number;
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
}
