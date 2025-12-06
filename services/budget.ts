import { MonthlyBudget } from "@/types/budget";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";

const upsertBudgetCategories = async (
  budget: MonthlyBudget,
  budgetId: string
) => {
  // Get existing categories for this budget
  const { data: existingCategories } = await supabase
    .from("budget_categories")
    .select("id, name")
    .eq("monthly_budget_id", budgetId);

  const existingCategoryMap = new Map(
    existingCategories?.map((cat) => [cat.name, cat.id]) || []
  );

  // Separate categories into update and insert
  const categoriesToUpdate: any[] = [];
  const categoriesToInsert: any[] = [];

  budget.categories.forEach((cat) => {
    const existingId = existingCategoryMap.get(cat.name);

    if (existingId) {
      // Existing category - UPDATE
      categoriesToUpdate.push({
        id: existingId,
        monthly_budget_id: budgetId,
        name: cat.name,
        amount: cat.amount,
        spent: cat.spent || 0,
        index: cat.index,
      });
    } else {
      // New category - INSERT (id will be auto-generated)
      categoriesToInsert.push({
        monthly_budget_id: budgetId,
        name: cat.name,
        amount: cat.amount,
        spent: cat.spent || 0,
        index: cat.index,
      });
    }
  });

  // Update existing categories
  if (categoriesToUpdate.length > 0) {
    const { error: updateError } = await supabase
      .from("budget_categories")
      .upsert(categoriesToUpdate, { onConflict: "id" });

    if (updateError) throw updateError;
  }

  // Insert new categories
  if (categoriesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("budget_categories")
      .insert(categoriesToInsert);

    if (insertError) throw insertError;
  }

  // Delete categories that were removed (exist in DB but not in new budget)
  const newCategoryNames = budget.categories.map((cat) => cat.name);
  const categoriesToDelete = existingCategories?.filter(
    (cat) => !newCategoryNames.includes(cat.name)
  );

  if (categoriesToDelete && categoriesToDelete.length > 0) {
    const idsToDelete = categoriesToDelete.map((cat) => cat.id);
    await supabase.from("budget_categories").delete().in("id", idsToDelete);
  }
};

const insertMonthlyBudget = async (budget: MonthlyBudget, user_id: string) => {
  // Insert the budget
  const { data, error } = await supabase
    .from("monthly_budgets")
    .insert({
      month: budget.month,
      year: budget.year,
      total_budget: budget.totalBudget,
      total_spent: budget.totalSpent,
      user_id: user_id,
    })
    .select("id")
    .single();

  if (error) throw error;

  // Insert/update categories
  await upsertBudgetCategories(budget, data.id);

  return { id: data.id };
};

const updateMonthlyBudget = async (budget: MonthlyBudget) => {
  // Update the budget
  // console.log("Updating Monthly Budget:", budget);
  const { error: budgetError } = await supabase
    .from("monthly_budgets")
    .update({
      total_budget: budget.totalBudget,
      total_spent: budget.totalSpent,
      updated_at: new Date(),
    })
    .eq("id", budget.id);

  if (budgetError) throw budgetError;

  // Insert/update categories
  await upsertBudgetCategories(budget, budget.id!);

  return { id: budget.id! };
};

export const saveOrUpdateMonthlyBudget = async (budget: MonthlyBudget) => {
  try {
    // console.log("Saving/Updating Budget:", budget);
    const session = await supabase.auth.getSession();
    const user_id = session.data.session?.user.id;
    if (!user_id) throw new Error("User not authenticated");

    if (budget.id) {
      // Update existing budget
      const res = await updateMonthlyBudget(budget);
      console.log("Update Response:", res);
      return res;
    } else {
      // Insert new budget
      const res = await insertMonthlyBudget(budget, user_id);
      // console.log("Insert Response:", res);
      return res;
    }
  } catch (error) {
    console.error("❌ Error saving or updating budget:", error);
    throw error;
  }
};

export const getMonthBudget = async (month: number, year: number) => {
  const session = await supabase.auth.getSession();
  const user_id = session.data.session?.user.id;

  if (!user_id) {
    Alert.alert("Error", "User not authenticated");
    return null;
  }

  // Fetch the monthly budget
  const { data: budgetData, error: budgetError } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("month", month)
    .eq("year", year)
    .eq("user_id", user_id)
    .maybeSingle();

  if (budgetError) {
    console.error("❌ Error fetching month budget:", budgetError);
    return null;
  }

  if (!budgetData) {
    console.log("ℹ️ No budget found for the selected month.");
    return null;
  }

  // Fetch associated categories separately
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("budget_categories")
    // .select("id, name, amount, spent, created_at")
    .select("*")
    .eq("monthly_budget_id", budgetData.id)
    .order("index", { ascending: true });

  if (categoriesError) {
    console.error("❌ Error fetching budget categories:", categoriesError);
  }
  // console.log("✅ Fetched budget categories:", categoriesData);

  // Transform the data to match MonthlyBudget type
  const monthlyBudget: MonthlyBudget = {
    id: budgetData.id,
    month: budgetData.month,
    year: budgetData.year,
    totalBudget: budgetData.total_budget,
    totalSpent: budgetData.total_spent,
    categories: categoriesData || [],
    // created_at: budgetData.created_at,
  };

  return monthlyBudget;
};

/**
 * Delete a monthly budget and all its associated categories using atomic RPC
 */
export const deleteMonthlyBudget = async (budgetId: string) => {
  try {
    if (budgetId === undefined) {
      throw new Error("Budget ID is required for deletion");
    }

    const session = await supabase.auth.getSession();
    const user_id = session.data.session?.user.id;

    if (!user_id) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase.rpc("delete_monthly_budget", {
      p_budget_id: budgetId,
      p_user_id: user_id,
    });

    if (error) {
      console.error("❌ Error deleting budget:", error);
      throw error;
    }

    console.log("✅ Budget deleted successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error in deleteMonthlyBudget:", error);
    throw error;
  }
};
