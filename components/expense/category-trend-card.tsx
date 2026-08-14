import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryTrendData } from "@/services/category-trend";
import { trendStyles } from "@/assets/styles/index.style";

interface CategoryTrendCardProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (name: string) => void;
  trendData: CategoryTrendData | null;
  loading: boolean;
  totalTrendData: CategoryTrendData | null;
  totalLoading: boolean;
}

const formatAmount = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount.toLocaleString()}`;
};

export default function CategoryTrendCard({
  categories,
  selectedCategory,
  onSelectCategory,
  trendData,
  loading,
  totalTrendData,
  totalLoading,
}: CategoryTrendCardProps) {
  if (categories.length === 0) return null;

  const [showTotal, setShowTotal] = useState(false);

  // Active dataset: total view or per-category view
  const activeData = showTotal ? totalTrendData : trendData;
  const isLoading = showTotal ? totalLoading : loading;

  const maxTotal =
    activeData?.months.reduce((max, m) => Math.max(max, m.total), 0) || 0;

  const renderBadge = () => {
    if (!activeData) return null;
    const { trend, momChangePercent } = activeData;

    if (momChangePercent === null && trend === "up") {
      return (
        <View style={[trendStyles.trendBadge, trendStyles.trendBadgeUp]}>
          <Text style={trendStyles.trendBadgeTextUp}>New ↑</Text>
        </View>
      );
    }

    if (trend === "flat" || momChangePercent === null) {
      return (
        <View style={[trendStyles.trendBadge, trendStyles.trendBadgeFlat]}>
          <Text style={trendStyles.trendBadgeTextFlat}>— Flat</Text>
        </View>
      );
    }

    const isUp = trend === "up";
    return (
      <View
        style={[
          trendStyles.trendBadge,
          isUp ? trendStyles.trendBadgeUp : trendStyles.trendBadgeDown,
        ]}
      >
        <Text
          style={
            isUp
              ? trendStyles.trendBadgeTextUp
              : trendStyles.trendBadgeTextDown
          }
        >
          {isUp ? "↑" : "↓"} {Math.abs(momChangePercent).toFixed(0)}%
        </Text>
      </View>
    );
  };

  const renderChart = () => {
    if (!activeData) return null;
    const { months } = activeData;

    if (maxTotal === 0) {
      return (
        <View style={trendStyles.trendEmptyState}>
          <Ionicons name="bar-chart-outline" size={32} color="#ccc" />
          <Text style={trendStyles.trendEmptyText}>
            No expense data for the last 6 months
          </Text>
        </View>
      );
    }

    // Compute 6-month average (only non-zero months)
    const nonZeroMonths = months.filter((m) => m.total > 0);
    const average =
      nonZeroMonths.length > 0
        ? nonZeroMonths.reduce((s, m) => s + m.total, 0) / nonZeroMonths.length
        : 0;

    const avgPct = maxTotal > 0 ? (average / maxTotal) * 100 : 0;
    const bottomOffset = (avgPct / 100) * 160;

    return (
      <View style={trendStyles.trendChartWrapper}>
        <View style={trendStyles.trendChartContainer}>
          {months.map((m, i) => {
            const heightPct = maxTotal > 0 ? (m.total / maxTotal) * 100 : 0;
            const isCurrentMonth = i === months.length - 1;

            return (
              <View key={`${m.year}-${m.month}`} style={trendStyles.trendBarWrapper}>
                {/* Amount label */}
                <Text
                  style={[
                    trendStyles.trendBarAmount,
                    isCurrentMonth && trendStyles.trendBarAmountCurrent,
                  ]}
                  numberOfLines={1}
                >
                  {m.total > 0 ? formatAmount(m.total) : "–"}
                </Text>

                {/* Bar */}
                <View style={trendStyles.trendBar}>
                  <View
                    style={[
                      trendStyles.trendBarFill,
                      {
                        height: `${Math.max(heightPct, 2)}%`,
                        backgroundColor: isCurrentMonth ? "#007AFF" : "#B0D4FF",
                      },
                    ]}
                  />
                </View>

                {/* Month label */}
                <Text
                  style={[
                    trendStyles.trendBarLabel,
                    isCurrentMonth && trendStyles.trendBarLabelCurrent,
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Average reference line */}
        {average > 0 && (
          <>
            <View
              style={[
                trendStyles.trendAvgLine,
                { bottom: bottomOffset },
              ]}
            />
            <View
              style={[
                trendStyles.trendAvgLabel,
                { bottom: bottomOffset + 2 },
              ]}
            >
              <Text style={trendStyles.trendAvgLabelText}>
                avg {formatAmount(average)}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={trendStyles.trendCard}>
      {/* Header */}
      <View style={trendStyles.trendHeader}>
        <Text style={trendStyles.trendTitle}>Category Trends</Text>
        {renderBadge()}
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={trendStyles.trendPillScroll}
        contentContainerStyle={trendStyles.trendPillContent}
      >
        {/* Total pill — always first */}
        <TouchableOpacity
          style={[
            trendStyles.trendPill,
            showTotal && trendStyles.trendPillActive,
          ]}
          onPress={() => setShowTotal(true)}
        >
          <Text
            style={[
              trendStyles.trendPillText,
              showTotal && trendStyles.trendPillTextActive,
            ]}
          >
            Total
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              trendStyles.trendPill,
              !showTotal && selectedCategory === cat && trendStyles.trendPillActive,
            ]}
            onPress={() => {
              setShowTotal(false);
              onSelectCategory(cat);
            }}
          >
            <Text
              style={[
                trendStyles.trendPillText,
                !showTotal && selectedCategory === cat && trendStyles.trendPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart area */}
      {isLoading ? (
        <View style={trendStyles.trendLoadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      ) : (
        <>
          {renderChart()}

          {/* Comparison line */}
          {activeData && maxTotal > 0 && (
            <>
              <Text style={trendStyles.trendCompare}>
                {formatAmount(activeData.currentMonth)} this month vs{" "}
                {formatAmount(activeData.previousMonth)} last month
              </Text>
              {/* 6-month average stat */}
              <View style={trendStyles.trendAvgStat}>
                <Text style={trendStyles.trendAvgStatLabel}>6-mo avg:</Text>
                <Text style={trendStyles.trendAvgStatText}>
                  {formatAmount(
                    activeData.months.filter((m) => m.total > 0).length > 0
                      ? activeData.months.filter((m) => m.total > 0).reduce((s, m) => s + m.total, 0) /
                          activeData.months.filter((m) => m.total > 0).length
                      : 0
                  )}
                  /mo
                </Text>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}
