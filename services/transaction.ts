import { Transaction } from "@/types/types";
import { supabase } from "@/utils/supabase";

export const insertTransaction = async (transaction: Transaction) => {
  console.log("🔔 Inserting transaction:", transaction);

  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  // Validation: Ensure Income transactions have income_source_id
  if (transaction.type === "income" && !transaction.income_source_id) {
    throw new Error("Income Source ID is required for income transactions");
  }

  // Validation: Ensure Expense transactions have category_id
  if (transaction.type === "expense" && !transaction.category_id) {
    throw new Error("Category ID is required for expense transactions");
  }

  // console.log("Inserting transaction", transaction);

  const { data, error } = await supabase.rpc("insert_full_transaction_v2", {
    p_user_id: userId,
    p_category_id:
      transaction.type === "expense" ? transaction.category_id : null,
    p_income_source_id:
      transaction.type === "income" ? transaction.income_source_id : null,
    p_category_name: transaction.category_name,
    p_description: transaction.description || "",
    p_date: transaction.date,
    p_month: transaction.month,
    p_year: transaction.year,
    p_type: transaction.type,
    p_payment_mode: transaction.payment_mode,
    p_amount: transaction.amount,
  });

  if (error) {
    console.error("❌ RPC Error:", error);
    throw error;
  }

  return data;
};

export const getTransactions = async (month: number, year: number) => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .eq("year", year)
    .eq("is_deleted", false)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching transactions:", error);
    throw error;
  }

  // console.log("✅ Transactions fetched:", data?.length || 0);
  return data as Transaction[];
};

export const getTransactionById = async (transactionId: string) => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .single();

  if (error) {
    console.error("❌ Error fetching transaction:", error);
    throw error;
  }

  return data as Transaction;
};

export const updateTransaction = async (transaction: Transaction) => {
  // console.log("🔔 Updating transaction:", transaction);

  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  if (!transaction.id) throw new Error("Transaction ID is required for update");

  // Validation: Ensure Income transactions have income_source_id
  if (transaction.type === "income" && !transaction.income_source_id) {
    throw new Error("Income Source ID is required for income transactions");
  }

  // Validation: Ensure Expense transactions have category_id
  if (transaction.type === "expense" && !transaction.category_id) {
    throw new Error("Category ID is required for expense transactions");
  }

  const { data, error } = await supabase.rpc("update_full_transaction_v2", {
    p_transaction_id: transaction.id,
    p_user_id: userId,
    p_category_id:
      transaction.type === "expense" ? transaction.category_id : null,
    p_income_source_id:
      transaction.type === "income" ? transaction.income_source_id : null,
    p_category_name: transaction.category_name,
    p_description: transaction.description || "",
    p_date: transaction.date,
    p_month: transaction.month,
    p_year: transaction.year,
    p_type: transaction.type,
    p_payment_mode: transaction.payment_mode,
    p_amount: transaction.amount,
  });

  if (error) {
    console.error("❌ RPC Update Error:", error);
    throw error;
  }

  return data;
};

export const deleteTransaction = async (transactionId: string) => {
  // console.log("🔔 Deleting transaction:", transactionId);

  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase.rpc("delete_full_transaction", {
    p_transaction_id: transactionId,
    p_user_id: userId,
  });

  if (error) {
    console.error("❌ RPC Delete Error:", error);
    throw error;
  }

  return data;
};
