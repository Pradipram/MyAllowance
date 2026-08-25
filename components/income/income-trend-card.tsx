import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
  totalTrendData: IncomeTrendData | null;
  totalLoading: boolean;
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
  totalTrendData,
  totalLoading,
}: IncomeTrendCardProps) {
  if (sources.length === 0) return null;

  const [showTotal, setShowTotal] = useState(false);

  // Active dataset: total view or per-source view
  const activeData = showTotal ? totalTrendData : trendData;
  const isLoading = showTotal ? totalLoading : loading;

  const maxTotal =
    activeData?.months.reduce((max, m) => Math.max(max, m.total), 0) || 0;

  const renderBadge = () => {
    if (!activeData) return null;
    const { trend, momChangePercent } = activeData;

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
    if (!activeData) return null;
    const { months } = activeData;

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

    // Compute 6-month average (all months included)
    const average =
      months.length > 0
        ? months.reduce((s, m) => s + m.total, 0) / months.length
        : 0;

    const avgPct = maxTotal > 0 ? (average / maxTotal) * 100 : 0;
    const bottomOffset = (avgPct / 100) * 160;

    return (
      <View style={incomeTrendStyles.trendChartWrapper}>
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

        {/* Average reference line */}
        {average > 0 && (
          <>
            <View
              style={[
                incomeTrendStyles.trendAvgLine,
                { bottom: bottomOffset },
              ]}
            />
            <View
              style={[
                incomeTrendStyles.trendAvgLabel,
                { bottom: bottomOffset + 2 },
              ]}
            >
              <Text style={incomeTrendStyles.trendAvgLabelText}>
                avg {formatAmount(average)}
              </Text>
            </View>
          </>
        )}
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
        {/* Total pill — always first */}
        <TouchableOpacity
          style={[
            incomeTrendStyles.trendPill,
            showTotal && incomeTrendStyles.trendPillActive,
          ]}
          onPress={() => setShowTotal(true)}
        >
          <Text
            style={[
              incomeTrendStyles.trendPillText,
              showTotal && incomeTrendStyles.trendPillTextActive,
            ]}
          >
            Total
          </Text>
        </TouchableOpacity>

        {sources.map((src) => (
          <TouchableOpacity
            key={src}
            style={[
              incomeTrendStyles.trendPill,
              !showTotal && selectedSource === src && incomeTrendStyles.trendPillActive,
            ]}
            onPress={() => {
              setShowTotal(false);
              onSelectSource(src);
            }}
          >
            <Text
              style={[
                incomeTrendStyles.trendPillText,
                !showTotal && selectedSource === src && incomeTrendStyles.trendPillTextActive,
              ]}
            >
              {src}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart area */}
      {isLoading ? (
        <View style={incomeTrendStyles.trendLoadingContainer}>
          <ActivityIndicator size="small" color="#28a745" />
        </View>
      ) : (
        <>
          {renderChart()}

          {/* Comparison line */}
          {activeData && maxTotal > 0 && (
            <>
              <Text style={incomeTrendStyles.trendCompare}>
                {formatAmount(activeData.currentMonth)} this month vs{" "}
                {formatAmount(activeData.previousMonth)} last month
              </Text>
              {/* 6-month average stat */}
              <View style={incomeTrendStyles.trendAvgStat}>
                <Text style={incomeTrendStyles.trendAvgStatLabel}>6-mo avg:</Text>
                <Text style={incomeTrendStyles.trendAvgStatText}>
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
