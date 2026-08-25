import { supabase } from "@/utils/supabase";

// ── Types ────────────────────────────────────────────────────────────

export interface MonthlySavings {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number; // surplus > 0, deficit < 0
  savingsRate: number; // percentage
  label: string; // e.g. "Mar"
}

export interface SavingsTrendData {
  months: MonthlySavings[]; // 6 entries, oldest → newest
  currentMonth: MonthlySavings;
  previousMonth: MonthlySavings;
  momChangePercent: number | null; // null when previous = 0 or diff sign
  momNetDiff: number; // currentMonth.net - previousMonth.net
  trend: "up" | "down" | "flat";
  averageNet: number;
  averageSavingsRate: number;
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
 * Fetches all income and expense transactions over a 6-month window,
 * computes monthly surplus / deficit (net) and savings rates, and returns
 * full savings trend analysis data.
 */
export const getSavingsTrendData = async (
  selectedMonth: number,
  selectedYear: number,
): Promise<SavingsTrendData> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const window = getSixMonthWindow(selectedMonth, selectedYear);

  // Build OR filter for each (month, year) pair in the window
  const monthYearFilters = window
    .map((w) => `and(month.eq.${w.month},year.eq.${w.year})`)
    .join(",");

  const { data, error } = await supabase
    .from("transactions")
    .select("month, year, amount, type")
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .or(monthYearFilters);

  if (error) {
    console.error("❌ Error fetching savings trend:", error);
    throw error;
  }

  // Sum income and expenses per month
  const incomeMap: Record<string, number> = {};
  const expenseMap: Record<string, number> = {};

  (data || []).forEach((row: any) => {
    const key = `${row.year}-${row.month}`;
    const amount = Number(row.amount) || 0;
    if (row.type === "income") {
      incomeMap[key] = (incomeMap[key] || 0) + amount;
    } else if (row.type === "expense") {
      expenseMap[key] = (expenseMap[key] || 0) + amount;
    }
  });

  // Build the 6-entry array
  const months: MonthlySavings[] = window.map((w) => {
    const key = `${w.year}-${w.month}`;
    const income = incomeMap[key] || 0;
    const expense = expenseMap[key] || 0;
    const net = income - expense;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    return {
      month: w.month,
      year: w.year,
      income,
      expense,
      net,
      savingsRate,
      label: MONTH_LABELS[w.month - 1],
    };
  });

  const currentMonth = months[5];
  const previousMonth = months[4];
  const momNetDiff = currentMonth.net - previousMonth.net;

  let momChangePercent: number | null = null;
  let trend: "up" | "down" | "flat" = "flat";

  if (previousMonth.net !== 0) {
    momChangePercent = (momNetDiff / Math.abs(previousMonth.net)) * 100;
    if (momNetDiff > 0) trend = "up";
    else if (momNetDiff < 0) trend = "down";
    else trend = "flat";
  } else if (currentMonth.net !== 0) {
    trend = currentMonth.net > 0 ? "up" : "down";
    momChangePercent = null;
  }

  // Calculate average net and average savings rate over all 6 months
  const averageNet =
    months.length > 0
      ? months.reduce((sum, m) => sum + m.net, 0) / months.length
      : 0;

  const averageSavingsRate =
    months.length > 0
      ? months.reduce((sum, m) => sum + m.savingsRate, 0) / months.length
      : 0;

  return {
    months,
    currentMonth,
    previousMonth,
    momChangePercent,
    momNetDiff,
    trend,
    averageNet,
    averageSavingsRate,
  };
};
