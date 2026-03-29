import { IncomeSource, MonthlyRecord } from "@/types/types";
import { supabase } from "@/utils/supabase";

export const getMonthlyRecords = async (
  month: number,
  year: number,
): Promise<MonthlyRecord | null> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase.rpc("get_monthly_record", {
    p_user_id: userId,
    p_month: month,
    p_year: year,
  });

  if (error) {
    console.error("❌ RPC Error:", error);
    throw new Error(error.message);
  }
  // console.log(
  //   "✅ Monthly record fetched for month:",
  //   month,
  //   "year:",
  //   year,
  //   "data:",
  //   data,
  // );

  return (data as MonthlyRecord) ?? null;
};

export const saveMonthlyBudgetCategories = async (
  month: number,
  year: number,
  budgetCategories: {
    id?: string;
    name: string;
    budget: number;
    index: number;
  }[],
  totalBudget: number,
): Promise<MonthlyRecord> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  // Filter out empty IDs to avoid UUID parsing errors
  const cleanedCategories = budgetCategories.map((cat) => ({
    ...cat,
    id: cat.id && cat.id.trim() !== "" ? cat.id : null,
  }));

  const { data, error } = await supabase.rpc("upsert_monthly_record", {
    p_user_id: userId,
    p_month: month,
    p_year: year,
    p_total_budget: totalBudget,
    p_budget_categories: cleanedCategories,
    // Income fields intentionally omitted — COALESCE in SQL preserves existing values
    p_total_income: null,
    p_income_sources: null,
  });

  if (error) {
    console.error("❌ RPC Error:", error);
    throw new Error(error.message);
  }

  // console.log("✅ Monthly record saved for month:", month, "year:", year);
  return data as MonthlyRecord;
};

export const saveMonthlyIncomeSources = async (
  month: number,
  year: number,
  // incomeSources: { id?: string; name: string; type: "active" | "passive" }[],
  incomeSources: IncomeSource[],
): Promise<MonthlyRecord> => {
  // console.log("Saving income source:", incomeSources);
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  // Filter out empty IDs to avoid UUID parsing errors
  const cleanedSources = incomeSources.map((src) => ({
    ...src,
    id: src.id && src.id.trim() !== "" ? src.id : null,
  }));
  // console.log("Cleaned income sources for saving:", cleanedSources);

  const { data, error } = await supabase.rpc("upsert_monthly_record", {
    p_user_id: userId,
    p_month: month,
    p_year: year,
    p_total_budget: null,
    p_budget_categories: null,
    p_total_income: 0, // Total income will be recalculated in the database
    p_income_sources: cleanedSources,
  });

  if (error) {
    console.error("❌ RPC Error:", error);
    throw new Error(error.message);
  }

  console.log(
    "✅ Monthly income sources saved for month:",
    month,
    "year:",
    year,
  );
  return data as MonthlyRecord;
};
