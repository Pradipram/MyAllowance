import { supabase } from "@/utils/supabase";

// ── Types ────────────────────────────────────────────────────────────

export interface MonthlyIncome {
  month: number;
  year: number;
  total: number;
  label: string; // e.g. "Mar"
}

export interface IncomeTrendData {
  sourceName: string;
  months: MonthlyIncome[]; // 6 entries, oldest → newest
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
 * Fetches income transactions over a 6-month window and returns trend
 * data for the requested income source.
 */
export const getIncomeTrendData = async (
  selectedMonth: number,
  selectedYear: number,
  sourceName: string,
): Promise<IncomeTrendData> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const window = getSixMonthWindow(selectedMonth, selectedYear);

  // Build OR filter for each (month, year) pair in the window.
  const monthYearFilters = window
    .map((w) => `and(month.eq.${w.month},year.eq.${w.year})`)
    .join(",");

  const { data, error } = await supabase
    .from("transactions")
    .select("category_name, month, year, amount")
    .eq("user_id", userId)
    .eq("type", "income")
    .eq("is_deleted", false)
    .eq("category_name", sourceName)
    .or(monthYearFilters);

  if (error) {
    console.error("❌ Error fetching income trend:", error);
    throw error;
  }

  // Group by month/year and sum amounts
  const sumMap: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const key = `${row.year}-${row.month}`;
    sumMap[key] = (sumMap[key] || 0) + row.amount;
  });

  // Build the 6-entry array
  const months: MonthlyIncome[] = window.map((w) => ({
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
    // Previous was 0, current is non-zero → new income
    trend = "up";
    momChangePercent = null;
  }

  return {
    sourceName,
    months,
    currentMonth: currentMonthTotal,
    previousMonth: previousMonthTotal,
    trend,
    momChangePercent,
  };
};

/**
 * Fetches ALL income transactions over a 6-month window (across every
 * source) and returns aggregated monthly totals for comparison.
 */
export const getIncomeTotalTrendData = async (
  selectedMonth: number,
  selectedYear: number,
): Promise<IncomeTrendData> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const window = getSixMonthWindow(selectedMonth, selectedYear);

  const monthYearFilters = window
    .map((w) => `and(month.eq.${w.month},year.eq.${w.year})`)
    .join(",");

  const { data, error } = await supabase
    .from("transactions")
    .select("month, year, amount")
    .eq("user_id", userId)
    .eq("type", "income")
    .eq("is_deleted", false)
    .or(monthYearFilters);

  if (error) {
    console.error("❌ Error fetching total income trend:", error);
    throw error;
  }

  const sumMap: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const key = `${row.year}-${row.month}`;
    sumMap[key] = (sumMap[key] || 0) + row.amount;
  });

  const months: MonthlyIncome[] = window.map((w) => ({
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
    trend = "up";
    momChangePercent = null;
  }

  return {
    sourceName: "Total",
    months,
    currentMonth: currentMonthTotal,
    previousMonth: previousMonthTotal,
    trend,
    momChangePercent,
  };
};
