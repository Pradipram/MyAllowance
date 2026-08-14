import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IncomeTrendData } from "@/services/income-trend";
import { incomeTrendStyles } from "@/assets/styles/index.style";

interface IncomeTrendCardProps {
  sources: string[];
  selectedSource: string;
  onSelectSource: (name: string) => void;
  trendData: IncomeTrendData | null;
  loading: boolean;
}

const formatAmount = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount.toLocaleString()}`;
};

export default function IncomeTrendCard({
  sources,
  selectedSource,
  onSelectSource,
  trendData,
  loading,
}: IncomeTrendCardProps) {
  if (sources.length === 0) return null;

  const maxTotal =
    trendData?.months.reduce((max, m) => Math.max(max, m.total), 0) || 0;

  const renderBadge = () => {
    if (!trendData) return null;
    const { trend, momChangePercent } = trendData;

    if (momChangePercent === null && trend === "up") {
      return (
        <View style={[incomeTrendStyles.trendBadge, incomeTrendStyles.trendBadgeUp]}>
          <Text style={incomeTrendStyles.trendBadgeTextUp}>New ↑</Text>
        </View>
      );
    }

    if (trend === "flat" || momChangePercent === null) {
      return (
        <View style={[incomeTrendStyles.trendBadge, incomeTrendStyles.trendBadgeFlat]}>
          <Text style={incomeTrendStyles.trendBadgeTextFlat}>— Flat</Text>
        </View>
      );
    }

    const isUp = trend === "up";
    return (
      <View
        style={[
          incomeTrendStyles.trendBadge,
          isUp ? incomeTrendStyles.trendBadgeUp : incomeTrendStyles.trendBadgeDown,
        ]}
      >
        <Text
          style={
            isUp
              ? incomeTrendStyles.trendBadgeTextUp
              : incomeTrendStyles.trendBadgeTextDown
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
        <View style={incomeTrendStyles.trendEmptyState}>
          <Ionicons name="bar-chart-outline" size={32} color="#ccc" />
          <Text style={incomeTrendStyles.trendEmptyText}>
            No income data for the last 6 months
          </Text>
        </View>
      );
    }

    return (
      <View style={incomeTrendStyles.trendChartContainer}>
        {months.map((m, i) => {
          const heightPct = maxTotal > 0 ? (m.total / maxTotal) * 100 : 0;
          const isCurrentMonth = i === months.length - 1;

          return (
            <View key={`${m.year}-${m.month}`} style={incomeTrendStyles.trendBarWrapper}>
              {/* Amount label */}
              <Text
                style={[
                  incomeTrendStyles.trendBarAmount,
                  isCurrentMonth && incomeTrendStyles.trendBarAmountCurrent,
                ]}
                numberOfLines={1}
              >
                {m.total > 0 ? formatAmount(m.total) : "–"}
              </Text>

              {/* Bar */}
              <View style={incomeTrendStyles.trendBar}>
                <View
                  style={[
                    incomeTrendStyles.trendBarFill,
                    {
                      height: `${Math.max(heightPct, 2)}%`,
                      backgroundColor: isCurrentMonth ? "#28a745" : "#a3e4b8",
                    },
                  ]}
                />
              </View>

              {/* Month label */}
              <Text
                style={[
                  incomeTrendStyles.trendBarLabel,
                  isCurrentMonth && incomeTrendStyles.trendBarLabelCurrent,
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
    <View style={incomeTrendStyles.trendCard}>
      {/* Header */}
      <View style={incomeTrendStyles.trendHeader}>
        <Text style={incomeTrendStyles.trendTitle}>Income Trends</Text>
        {renderBadge()}
      </View>

      {/* Source pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={incomeTrendStyles.trendPillScroll}
        contentContainerStyle={incomeTrendStyles.trendPillContent}
      >
        {sources.map((src) => (
          <TouchableOpacity
            key={src}
            style={[
              incomeTrendStyles.trendPill,
              selectedSource === src && incomeTrendStyles.trendPillActive,
            ]}
            onPress={() => onSelectSource(src)}
          >
            <Text
              style={[
                incomeTrendStyles.trendPillText,
                selectedSource === src && incomeTrendStyles.trendPillTextActive,
              ]}
            >
              {src}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart area */}
      {loading ? (
        <View style={incomeTrendStyles.trendLoadingContainer}>
          <ActivityIndicator size="small" color="#28a745" />
        </View>
      ) : (
        <>
          {renderChart()}

          {/* Comparison line */}
          {trendData && maxTotal > 0 && (
            <Text style={incomeTrendStyles.trendCompare}>
              {formatAmount(trendData.currentMonth)} this month vs{" "}
              {formatAmount(trendData.previousMonth)} last month
            </Text>
          )}
        </>
      )}
    </View>
  );
}
