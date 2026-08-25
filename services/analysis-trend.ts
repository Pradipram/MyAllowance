import { supabase } from "@/utils/supabase";
import { CategoryTrendData, MonthlySpend } from "./category-trend";
import { IncomeTrendData, MonthlyIncome } from "./income-trend";
import { MonthlySavings, SavingsTrendData } from "./savings-trend";

// ── Types ────────────────────────────────────────────────────────────

/** Lightweight row shape for the single fetch query */
interface RawTxRow {
  category_name: string;
  month: number;
  year: number;
  amount: number;
  type: "income" | "expense";
}

/** Everything the Analysis page needs, computed from one query */
export interface AnalysisTrendBundle {
  /** Current-month transactions for deriving category/source names */
  expenseCategoryNames: string[];
  incomeSourceNames: string[];

  /** Savings trend (all income + expense) */
  savingsTrend: SavingsTrendData;

  /** Expense trends keyed by category name + "Total" */
  categoryTrends: Record<string, CategoryTrendData>;

  /** Income trends keyed by source name + "Total" */
  incomeTrends: Record<string, IncomeTrendData>;
}

// ── Helpers ──────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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

/** Compute MoM change and trend direction */
const computeMom = (
  current: number,
  previous: number,
): { momChangePercent: number | null; trend: "up" | "down" | "flat" } => {
  if (previous > 0) {
    const pct = ((current - previous) / previous) * 100;
    const trend = pct > 1 ? "up" : pct < -1 ? "down" : "flat";
    return { momChangePercent: pct, trend };
  }
  if (current > 0) return { momChangePercent: null, trend: "up" };
  return { momChangePercent: null, trend: "flat" };
};

// ── Core Service ─────────────────────────────────────────────────────

/**
 * Single Supabase query to fetch ALL transactions for a 6-month window.
 * All trend data (category, income, savings) is computed client-side
 * from this one result set.
 */
export const getAnalysisTrendData = async (
  selectedMonth: number,
  selectedYear: number,
): Promise<AnalysisTrendBundle> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error("User not authenticated");

  const window = getSixMonthWindow(selectedMonth, selectedYear);

  // Single query — all transactions in the 6-month window
  const monthYearFilters = window
    .map((w) => `and(month.eq.${w.month},year.eq.${w.year})`)
    .join(",");

  const { data, error } = await supabase
    .from("transactions")
    .select("category_name, month, year, amount, type")
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .or(monthYearFilters);

  if (error) {
    console.error("❌ Error fetching analysis data:", error);
    throw error;
  }

  const rows: RawTxRow[] = (data || []) as RawTxRow[];

  // ── Derive current-month category/source names ─────────────────
  const currentM = window[5];
  const expenseCatSet = new Set<string>();
  const incomeSourceSet = new Set<string>();
  rows.forEach((r) => {
    if (r.month === currentM.month && r.year === currentM.year) {
      if (r.type === "expense") expenseCatSet.add(r.category_name);
      else if (r.type === "income") incomeSourceSet.add(r.category_name);
    }
  });
  const expenseCategoryNames = Array.from(expenseCatSet).sort();
  const incomeSourceNames = Array.from(incomeSourceSet).sort();

  // ── Build per-type, per-category sum maps ──────────────────────
  // expenseSums[categoryName]["year-month"] = total
  const expenseSums: Record<string, Record<string, number>> = {};
  const expenseTotals: Record<string, number> = {};
  const incomeSums: Record<string, Record<string, number>> = {};
  const incomeTotals: Record<string, number> = {};
  // For savings: overall income/expense per month
  const savingsIncomeMap: Record<string, number> = {};
  const savingsExpenseMap: Record<string, number> = {};

  rows.forEach((r) => {
    const key = `${r.year}-${r.month}`;
    const amt = Number(r.amount) || 0;

    if (r.type === "expense") {
      if (!expenseSums[r.category_name]) expenseSums[r.category_name] = {};
      expenseSums[r.category_name][key] =
        (expenseSums[r.category_name][key] || 0) + amt;
      expenseTotals[key] = (expenseTotals[key] || 0) + amt;
      savingsExpenseMap[key] = (savingsExpenseMap[key] || 0) + amt;
    } else if (r.type === "income") {
      if (!incomeSums[r.category_name]) incomeSums[r.category_name] = {};
      incomeSums[r.category_name][key] =
        (incomeSums[r.category_name][key] || 0) + amt;
      incomeTotals[key] = (incomeTotals[key] || 0) + amt;
      savingsIncomeMap[key] = (savingsIncomeMap[key] || 0) + amt;
    }
  });

  // ── Helper: build CategoryTrendData from a sumMap ──────────────
  const buildCategoryTrend = (
    categoryName: string,
    sumMap: Record<string, number>,
  ): CategoryTrendData => {
    const months: MonthlySpend[] = window.map((w) => ({
      month: w.month,
      year: w.year,
      total: sumMap[`${w.year}-${w.month}`] || 0,
      label: MONTH_LABELS[w.month - 1],
    }));
    const cur = months[5].total;
    const prev = months[4].total;
    const { momChangePercent, trend } = computeMom(cur, prev);
    return {
      categoryName,
      months,
      currentMonth: cur,
      previousMonth: prev,
      momChangePercent,
      trend,
    };
  };

  // ── Helper: build IncomeTrendData from a sumMap ─────────────────
  const buildIncomeTrend = (
    sourceName: string,
    sumMap: Record<string, number>,
  ): IncomeTrendData => {
    const months: MonthlyIncome[] = window.map((w) => ({
      month: w.month,
      year: w.year,
      total: sumMap[`${w.year}-${w.month}`] || 0,
      label: MONTH_LABELS[w.month - 1],
    }));
    const cur = months[5].total;
    const prev = months[4].total;
    const { momChangePercent, trend } = computeMom(cur, prev);
    return {
      sourceName,
      months,
      currentMonth: cur,
      previousMonth: prev,
      momChangePercent,
      trend,
    };
  };

  // ── Compute all category trends ────────────────────────────────
  const categoryTrends: Record<string, CategoryTrendData> = {};
  // Per-category
  for (const catName of Object.keys(expenseSums)) {
    categoryTrends[catName] = buildCategoryTrend(catName, expenseSums[catName]);
  }
  // Total
  categoryTrends["Total"] = buildCategoryTrend("Total", expenseTotals);

  // ── Compute all income trends ──────────────────────────────────
  const incomeTrends: Record<string, IncomeTrendData> = {};
  // Per-source
  for (const srcName of Object.keys(incomeSums)) {
    incomeTrends[srcName] = buildIncomeTrend(srcName, incomeSums[srcName]);
  }
  // Total
  incomeTrends["Total"] = buildIncomeTrend("Total", incomeTotals);

  // ── Compute savings trend ──────────────────────────────────────
  const savingsMonths: MonthlySavings[] = window.map((w) => {
    const key = `${w.year}-${w.month}`;
    const income = savingsIncomeMap[key] || 0;
    const expense = savingsExpenseMap[key] || 0;
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

  const currentSavings = savingsMonths[5];
  const previousSavings = savingsMonths[4];
  const momNetDiff = currentSavings.net - previousSavings.net;

  let savingsMomPercent: number | null = null;
  let savingsTrend: "up" | "down" | "flat" = "flat";
  if (previousSavings.net !== 0) {
    savingsMomPercent =
      (momNetDiff / Math.abs(previousSavings.net)) * 100;
    if (momNetDiff > 0) savingsTrend = "up";
    else if (momNetDiff < 0) savingsTrend = "down";
  } else if (currentSavings.net !== 0) {
    savingsTrend = currentSavings.net > 0 ? "up" : "down";
  }

  const averageNet =
    savingsMonths.length > 0
      ? savingsMonths.reduce((s, m) => s + m.net, 0) / savingsMonths.length
      : 0;
  const averageSavingsRate =
    savingsMonths.length > 0
      ? savingsMonths.reduce((s, m) => s + m.savingsRate, 0) /
        savingsMonths.length
      : 0;

  const savingsTrendData: SavingsTrendData = {
    months: savingsMonths,
    currentMonth: currentSavings,
    previousMonth: previousSavings,
    momChangePercent: savingsMomPercent,
    momNetDiff,
    trend: savingsTrend,
    averageNet,
    averageSavingsRate,
  };

  return {
    expenseCategoryNames,
    incomeSourceNames,
    savingsTrend: savingsTrendData,
    categoryTrends,
    incomeTrends,
  };
};
