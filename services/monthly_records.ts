import { MonthlyRecord } from "@/types/types";
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
  console.log(
    "✅ Monthly record fetched for month:",
    month,
    "year:",
    year,
    "data:",
    data,
  );

  return (data as MonthlyRecord) ?? null;
};

export const saveMonthlyRecord = async (
  month: number,
  year: number,
  budgetCategories: { id?: string; name: string; budget: number; index: number }[],
  totalBudget: number,
): Promise<MonthlyRecord> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase.rpc("upsert_monthly_record", {
    p_user_id: userId,
    p_month: month,
    p_year: year,
    p_total_budget: totalBudget,
    p_budget_categories: budgetCategories,
    // Income fields intentionally omitted — COALESCE in SQL preserves existing values
    p_total_income: null,
    p_income_sources: null,
  });

  if (error) {
    console.error("❌ RPC Error:", error);
    throw new Error(error.message);
  }

  console.log("✅ Monthly record saved for month:", month, "year:", year);
  return data as MonthlyRecord;
};
