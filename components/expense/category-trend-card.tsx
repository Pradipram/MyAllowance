import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
}: CategoryTrendCardProps) {
  if (categories.length === 0) return null;

  const maxTotal =
    trendData?.months.reduce((max, m) => Math.max(max, m.total), 0) || 0;

  const renderBadge = () => {
    if (!trendData) return null;
    const { trend, momChangePercent } = trendData;

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
    if (!trendData) return null;
    const { months } = trendData;

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

    return (
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
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              trendStyles.trendPill,
              selectedCategory === cat && trendStyles.trendPillActive,
            ]}
            onPress={() => onSelectCategory(cat)}
          >
            <Text
              style={[
                trendStyles.trendPillText,
                selectedCategory === cat && trendStyles.trendPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart area */}
      {loading ? (
        <View style={trendStyles.trendLoadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      ) : (
        <>
          {renderChart()}

          {/* Comparison line */}
          {trendData && maxTotal > 0 && (
            <Text style={trendStyles.trendCompare}>
              {formatAmount(trendData.currentMonth)} this month vs{" "}
              {formatAmount(trendData.previousMonth)} last month
            </Text>
          )}
        </>
      )}
    </View>
  );
}
