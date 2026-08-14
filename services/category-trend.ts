import { supabase } from "@/utils/supabase";

// ── Types ────────────────────────────────────────────────────────────

export interface MonthlySpend {
  month: number;
  year: number;
  total: number;
  label: string; // e.g. "Mar"
}

export interface CategoryTrendData {
  categoryName: string;
  months: MonthlySpend[]; // 6 entries, oldest → newest
  currentMonth: number;
  previousMonth: number;
  momChangePercent: number | null; // null when previous = 0
  trend: "up" | "down" | "flat";
}

// ── Helpers ──────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Returns an array of { month, year } for the 6-month window ending at
 * the given month/year (inclusive), ordered oldest → newest.
 */
const getSixMonthWindow = (
  endMonth: number,
  endYear: number,
): { month: number; year: number }[] => {
  const window: { month: number; year: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = endMonth - i;
    let y = endYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    window.push({ month: m, year: y });
  }
  return window;
};

// ── Service ──────────────────────────────────────────────────────────

/**
 * Fetches expense transactions over a 6-month window and returns trend
 * data for the requested category.
 */
export const getCategoryTrendData = async (
  selectedMonth: number,
  selectedYear: number,
  categoryName: string,
): Promise<CategoryTrendData> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const window = getSixMonthWindow(selectedMonth, selectedYear);
  const startMonth = window[0];
  const endMonth = window[window.length - 1];

  // Build a date range for the query. We use the composite (year, month)
  // filter to stay aligned with how transactions store month/year.
  // Build OR filter for each (month, year) pair in the window.
  const monthYearFilters = window
    .map((w) => `and(month.eq.${w.month},year.eq.${w.year})`)
    .join(",");

  const { data, error } = await supabase
    .from("transactions")
    .select("category_name, month, year, amount")
    .eq("user_id", userId)
    .eq("type", "expense")
    .eq("is_deleted", false)
    .eq("category_name", categoryName)
    .or(monthYearFilters);

  if (error) {
    console.error("❌ Error fetching category trend:", error);
    throw error;
  }

  // Group by month/year and sum amounts
  const sumMap: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const key = `${row.year}-${row.month}`;
    sumMap[key] = (sumMap[key] || 0) + row.amount;
  });

  // Build the 6-entry array
  const months: MonthlySpend[] = window.map((w) => ({
    month: w.month,
    year: w.year,
    total: sumMap[`${w.year}-${w.month}`] || 0,
    label: MONTH_LABELS[w.month - 1],
  }));

  const currentMonthTotal = months[5].total;
  const previousMonthTotal = months[4].total;

  let momChangePercent: number | null = null;
  let trend: "up" | "down" | "flat" = "flat";

  if (previousMonthTotal > 0) {
    momChangePercent =
      ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    if (momChangePercent > 1) trend = "up";
    else if (momChangePercent < -1) trend = "down";
    else trend = "flat";
  } else if (currentMonthTotal > 0) {
    // Previous was 0, current is non-zero → new spending
    trend = "up";
    momChangePercent = null;
  }

  return {
    categoryName,
    months,
    currentMonth: currentMonthTotal,
    previousMonth: previousMonthTotal,
    trend,
    momChangePercent,
  };
};
