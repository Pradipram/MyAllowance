// import { Transaction } from "@/types/budget";
// import { supabase } from "@/utils/supabase";

import { Transaction } from "@/types/budget";
import { supabase } from "@/utils/supabase";

// /**
//  * Update the spent amount for a budget category
//  */
// const updateCategorySpent = async (
//   categoryId: string,
//   amount: number
// ): Promise<void> => {
//   const { data: categoryData, error: categoryError } = await supabase
//     .from("budget_categories")
//     .select("spent")
//     .eq("id", categoryId)
//     .single();

//   if (categoryError) {
//     console.error("❌ Error fetching category:", categoryError);
//     throw categoryError;
//   }

//   const newSpent = (categoryData.spent || 0) + amount;
//   const { error: updateError } = await supabase
//     .from("budget_categories")
//     .update({ spent: newSpent })
//     .eq("id", categoryId);

//   if (updateError) {
//     console.error("❌ Error updating category spent:", updateError);
//     throw updateError;
//   }

//   console.log("✅ Category spent updated:", newSpent);
// };

// /**
//  * Update the total spent amount for a monthly budget
//  */
// const updateMonthlyBudgetSpent = async (
//   userId: string,
//   month: number,
//   year: number,
//   amount: number
// ): Promise<void> => {
//   const { data: budgetData, error: budgetError } = await supabase
//     .from("monthly_budgets")
//     .select("id, total_spent")
//     .eq("month", month)
//     .eq("year", year)
//     .eq("user_id", userId)
//     .single();

//   if (budgetError) {
//     console.error("❌ Error fetching monthly budget:", budgetError);
//     throw budgetError;
//   }

//   const newTotalSpent = (budgetData.total_spent || 0) + amount;
//   const { error: updateError } = await supabase
//     .from("monthly_budgets")
//     .update({ total_spent: newTotalSpent })
//     .eq("id", budgetData.id);

//   if (updateError) {
//     console.error("❌ Error updating total spent:", updateError);
//     throw updateError;
//   }

//   console.log("✅ Monthly budget total spent updated:", newTotalSpent);
// };

// /**
//  * Insert a new transaction and update related budget tables
//  */
// export const insertTransaction = async (
//   transaction: Partial<Transaction>
// ): Promise<any> => {
//   const session = await supabase.auth.getSession();
//   const user_id = session.data.session?.user.id;
//   if (!user_id) throw new Error("User not authenticated");

//   // Validate required fields
//   if (!transaction.categoryId || !transaction.amount) {
//     throw new Error("Category and amount are required");
//   }

//   try {
//     // Insert transaction
//     const { data, error } = await supabase
//       .from("transactions")
//       .insert({
//         user_id: user_id,
//         category_id: transaction.categoryId,
//         category_name: transaction.categoryName,
//         description: transaction.description || "",
//         date: transaction.date,
//         month: transaction.month,
//         year: transaction.year,
//         type: transaction.type || "expense",
//         payment_mode: transaction.paymentMode,
//         amount: transaction.amount,
//         is_deleted: false,
//       })
//       .select()
//       .single();

//     if (error) throw error;

//     console.log("✅ Transaction inserted:", data);

//     // Update category spent amount
//     await updateCategorySpent(transaction.categoryId, transaction.amount);

//     // Update monthly budget total spent
//     await updateMonthlyBudgetSpent(
//       user_id,
//       transaction.month!,
//       transaction.year!,
//       transaction.amount
//     );

//     return data;
//   } catch (error) {
//     console.error("❌ Error in insertTransaction:", error);
//     throw error;
//   }
// };

export const insertTransaction = async (transaction: Transaction) => {
  // console.log("🔔 Inserting transaction:", transaction);

  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase.rpc("insert_full_transaction", {
    p_user_id: userId,
    p_category_id: transaction.category_id,
    p_category_name: transaction.category_name,
    p_description: transaction.description || "",
    p_date: transaction.date,
    p_month: transaction.month,
    p_year: transaction.year,
    p_type: transaction.type || "expense",
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

  console.log("✅ Transactions fetched:", data?.length || 0);
  return data as Transaction[];
};
