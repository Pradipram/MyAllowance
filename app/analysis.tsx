import { styles } from "@/assets/styles/index.style";
import CategoryTrendCard from "@/components/expense/category-trend-card";
import Header from "@/components/header/header";
import IncomeTrendCard from "@/components/income/income-trend-card";
import SavingsTrendCard from "@/components/savings/savings-trend-card";
import {
  AnalysisTrendBundle,
  getAnalysisTrendData,
} from "@/services/analysis-trend";
import { getMonthYearStringFromNumbers } from "@/utils/utility";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalysisScreen() {
  const { month, year } = useLocalSearchParams<{
    month?: string;
    year?: string;
  }>();

  const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
  const selectedYear = year ? parseInt(year) : new Date().getFullYear();

  const [bundle, setBundle] = useState<AnalysisTrendBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Selected pill states ──
  const [selectedTrendCategory, setSelectedTrendCategory] =
    useState<string>("");
  const [selectedTrendSource, setSelectedTrendSource] = useState<string>("");

  // ── Single fetch for all trend data ──
  const loadAnalysisData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAnalysisTrendData(selectedMonth, selectedYear);
      setBundle(data);
    } catch (error) {
      console.error("Error loading analysis data:", error);
      setBundle(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      loadAnalysisData();
    }, [loadAnalysisData]),
  );

  // ── Auto-select first category/source when bundle loads ──
  useEffect(() => {
    if (!bundle) return;
    if (
      bundle.expenseCategoryNames.length > 0 &&
      !bundle.expenseCategoryNames.includes(selectedTrendCategory)
    ) {
      setSelectedTrendCategory(bundle.expenseCategoryNames[0]);
    }
  }, [bundle, selectedTrendCategory]);

  useEffect(() => {
    if (!bundle) return;
    if (
      bundle.incomeSourceNames.length > 0 &&
      !bundle.incomeSourceNames.includes(selectedTrendSource)
    ) {
      setSelectedTrendSource(bundle.incomeSourceNames[0]);
    }
  }, [bundle, selectedTrendSource]);

  // ── Derive trend data for selected category (instant, no fetch) ──
  const categoryTrendData = useMemo(() => {
    if (!bundle || !selectedTrendCategory) return null;
    return bundle.categoryTrends[selectedTrendCategory] ?? null;
  }, [bundle, selectedTrendCategory]);

  const categoryTotalTrendData = useMemo(() => {
    if (!bundle) return null;
    return bundle.categoryTrends["Total"] ?? null;
  }, [bundle]);

  const incomeTrendData = useMemo(() => {
    if (!bundle || !selectedTrendSource) return null;
    return bundle.incomeTrends[selectedTrendSource] ?? null;
  }, [bundle, selectedTrendSource]);

  const incomeTotalTrendData = useMemo(() => {
    if (!bundle) return null;
    return bundle.incomeTrends["Total"] ?? null;
  }, [bundle]);

  const monthYearLabel = getMonthYearStringFromNumbers(
    selectedMonth,
    selectedYear,
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header heading="Analysis" subheading={monthYearLabel} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasExpenses = (bundle?.expenseCategoryNames.length ?? 0) > 0;
  const hasIncome = (bundle?.incomeSourceNames.length ?? 0) > 0;
  const hasData = bundle !== null && (hasExpenses || hasIncome);

  return (
    <SafeAreaView style={styles.container}>
      <Header heading="Analysis" subheading={monthYearLabel} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {!hasData ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="analytics-outline" size={48} color="#999" />
            <Text style={styles.noDataTitle}>No Data</Text>
            <Text style={styles.noDataText}>
              No transactions found for this month to analyse.
            </Text>
          </View>
        ) : (
          <>
            {/* Savings Trends (overall financial health) */}
            <SavingsTrendCard
              trendData={bundle!.savingsTrend}
              loading={false}
            />

            {/* Category Spending Trends */}
            {hasExpenses && (
              <CategoryTrendCard
                categories={bundle!.expenseCategoryNames}
                selectedCategory={selectedTrendCategory}
                onSelectCategory={setSelectedTrendCategory}
                trendData={categoryTrendData}
                loading={false}
                totalTrendData={categoryTotalTrendData}
                totalLoading={false}
              />
            )}

            {/* Income Trends */}
            {hasIncome && (
              <IncomeTrendCard
                sources={bundle!.incomeSourceNames}
                selectedSource={selectedTrendSource}
                onSelectSource={setSelectedTrendSource}
                trendData={incomeTrendData}
                loading={false}
                totalTrendData={incomeTotalTrendData}
                totalLoading={false}
              />
            )}

            {/* Bottom spacing for comfortable scrolling */}
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
