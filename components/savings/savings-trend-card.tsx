import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SavingsTrendData } from "@/services/savings-trend";
import { savingsTrendStyles } from "@/assets/styles/index.style";

interface SavingsTrendCardProps {
  trendData: SavingsTrendData | null;
  loading: boolean;
}

type SavingsViewMode = "net" | "rate" | "income" | "expense";

const VIEW_OPTIONS: { key: SavingsViewMode; label: string }[] = [
  { key: "net", label: "Net Savings" },
  { key: "rate", label: "Savings Rate" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expenses" },
];

const formatAmount = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)}k`;
  return `₹${abs.toLocaleString()}`;
};

export default function SavingsTrendCard({
  trendData,
  loading,
}: SavingsTrendCardProps) {
  const [viewMode, setViewMode] = useState<SavingsViewMode>("net");

  if (!trendData && !loading) return null;

  const renderBadge = () => {
    if (!trendData) return null;
    const { currentMonth, previousMonth, trend, momNetDiff } = trendData;

    if (viewMode === "net") {
      if (momNetDiff === 0 || trend === "flat") {
        return (
          <View style={[savingsTrendStyles.trendBadge, savingsTrendStyles.trendBadgeFlat]}>
            <Text style={savingsTrendStyles.trendBadgeTextFlat}>— Flat</Text>
          </View>
        );
      }

      const isUp = trend === "up";
      return (
        <View
          style={[
            savingsTrendStyles.trendBadge,
            isUp ? savingsTrendStyles.trendBadgeUp : savingsTrendStyles.trendBadgeDown,
          ]}
        >
          <Text
            style={
              isUp
                ? savingsTrendStyles.trendBadgeTextUp
                : savingsTrendStyles.trendBadgeTextDown
            }
          >
            {isUp ? "↑" : "↓"} {formatAmount(momNetDiff)}
          </Text>
        </View>
      );
    }

    if (viewMode === "rate") {
      const rateDiff = currentMonth.savingsRate - previousMonth.savingsRate;
      if (Math.abs(rateDiff) < 0.5) {
        return (
          <View style={[savingsTrendStyles.trendBadge, savingsTrendStyles.trendBadgeFlat]}>
            <Text style={savingsTrendStyles.trendBadgeTextFlat}>— Flat</Text>
          </View>
        );
      }
      const isUp = rateDiff > 0;
      return (
        <View
          style={[
            savingsTrendStyles.trendBadge,
            isUp ? savingsTrendStyles.trendBadgeUp : savingsTrendStyles.trendBadgeDown,
          ]}
        >
          <Text
            style={
              isUp
                ? savingsTrendStyles.trendBadgeTextUp
                : savingsTrendStyles.trendBadgeTextDown
            }
          >
            {isUp ? "↑" : "↓"} {Math.abs(rateDiff).toFixed(0)}%
          </Text>
        </View>
      );
    }

    if (viewMode === "income") {
      const diff = currentMonth.income - previousMonth.income;
      if (diff === 0) {
        return (
          <View style={[savingsTrendStyles.trendBadge, savingsTrendStyles.trendBadgeFlat]}>
            <Text style={savingsTrendStyles.trendBadgeTextFlat}>— Flat</Text>
          </View>
        );
      }
      const isUp = diff > 0;
      return (
        <View
          style={[
            savingsTrendStyles.trendBadge,
            isUp ? savingsTrendStyles.trendBadgeUp : savingsTrendStyles.trendBadgeDown,
          ]}
        >
          <Text
            style={
              isUp
                ? savingsTrendStyles.trendBadgeTextUp
                : savingsTrendStyles.trendBadgeTextDown
            }
          >
            {isUp ? "↑" : "↓"} {previousMonth.income > 0 ? `${Math.abs((diff / previousMonth.income) * 100).toFixed(0)}%` : formatAmount(diff)}
          </Text>
        </View>
      );
    }

    // expense view
    const expDiff = currentMonth.expense - previousMonth.expense;
    if (expDiff === 0) {
      return (
        <View style={[savingsTrendStyles.trendBadge, savingsTrendStyles.trendBadgeFlat]}>
          <Text style={savingsTrendStyles.trendBadgeTextFlat}>— Flat</Text>
        </View>
      );
    }
    const isUp = expDiff > 0;
    return (
      <View
        style={[
          savingsTrendStyles.trendBadge,
          isUp ? savingsTrendStyles.trendBadgeDown : savingsTrendStyles.trendBadgeUp,
        ]}
      >
        <Text
          style={
            isUp
              ? savingsTrendStyles.trendBadgeTextDown
              : savingsTrendStyles.trendBadgeTextUp
          }
        >
          {isUp ? "↑" : "↓"} {previousMonth.expense > 0 ? `${Math.abs((expDiff / previousMonth.expense) * 100).toFixed(0)}%` : formatAmount(expDiff)}
        </Text>
      </View>
    );
  };

  const renderChart = () => {
    if (!trendData) return null;
    const { months } = trendData;

    const hasData = months.some((m) => m.income > 0 || m.expense > 0);
    if (!hasData) {
      return (
        <View style={savingsTrendStyles.trendEmptyState}>
          <Ionicons name="bar-chart-outline" size={32} color="#ccc" />
          <Text style={savingsTrendStyles.trendEmptyText}>
            No financial data for the last 6 months
          </Text>
        </View>
      );
    }

    if (viewMode === "net") {
      const maxAbsNet = months.reduce((max, m) => Math.max(max, Math.abs(m.net)), 0);
      const average = trendData.averageNet;
      const avgPct = maxAbsNet > 0 ? (Math.abs(average) / maxAbsNet) * 100 : 0;
      const bottomOffset = (avgPct / 100) * 160;
      const isAvgDeficit = average < 0;

      return (
        <View style={savingsTrendStyles.trendChartWrapper}>
          <View style={savingsTrendStyles.trendChartContainer}>
            {months.map((m, i) => {
              const heightPct = maxAbsNet > 0 ? (Math.abs(m.net) / maxAbsNet) * 100 : 0;
              const isCurrentMonth = i === months.length - 1;
              const isDeficit = m.net < 0;
              const isSurplus = m.net > 0;

              let fillColor = "#10b981";
              if (isDeficit) {
                fillColor = isCurrentMonth ? "#ef4444" : "#fca5a5";
              } else if (isSurplus) {
                fillColor = isCurrentMonth ? "#10b981" : "#a7f3d0";
              } else {
                fillColor = "#cbd5e1";
              }

              return (
                <View key={`${m.year}-${m.month}`} style={savingsTrendStyles.trendBarWrapper}>
                  {/* Amount label */}
                  <Text
                    style={[
                      savingsTrendStyles.trendBarAmount,
                      isSurplus && savingsTrendStyles.trendBarAmountSurplus,
                      isDeficit && savingsTrendStyles.trendBarAmountDeficit,
                      isCurrentMonth && savingsTrendStyles.trendBarAmountCurrent,
                    ]}
                    numberOfLines={1}
                  >
                    {m.net === 0
                      ? "₹0"
                      : `${isDeficit ? "-" : "+"}${formatAmount(m.net)}`}
                  </Text>

                  {/* Bar */}
                  <View
                    style={[
                      savingsTrendStyles.trendBar,
                      isDeficit && savingsTrendStyles.trendBarDeficit,
                    ]}
                  >
                    <View
                      style={[
                        savingsTrendStyles.trendBarFill,
                        {
                          height: `${Math.max(heightPct, 2)}%`,
                          backgroundColor: fillColor,
                        },
                      ]}
                    />
                  </View>

                  {/* Month label */}
                  <Text
                    style={[
                      savingsTrendStyles.trendBarLabel,
                      isCurrentMonth && savingsTrendStyles.trendBarLabelCurrent,
                    ]}
                  >
                    {m.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Average reference line */}
          {average !== 0 && (
            <>
              <View
                style={[
                  savingsTrendStyles.trendAvgLine,
                  isAvgDeficit && savingsTrendStyles.trendAvgLineDeficit,
                  { bottom: bottomOffset },
                ]}
              />
              <View
                style={[
                  savingsTrendStyles.trendAvgLabel,
                  isAvgDeficit && savingsTrendStyles.trendAvgLabelDeficit,
                  { bottom: bottomOffset + 2 },
                ]}
              >
                <Text style={savingsTrendStyles.trendAvgLabelText}>
                  avg {average > 0 ? "+" : "-"}{formatAmount(average)}
                </Text>
              </View>
            </>
          )}
        </View>
      );
    }

    if (viewMode === "rate") {
      const maxRate = months.reduce((max, m) => Math.max(max, Math.abs(m.savingsRate)), 10);
      const average = trendData.averageSavingsRate;
      const avgPct = maxRate > 0 ? (Math.abs(average) / maxRate) * 100 : 0;
      const bottomOffset = (avgPct / 100) * 160;
      const isAvgDeficit = average < 0;

      return (
        <View style={savingsTrendStyles.trendChartWrapper}>
          <View style={savingsTrendStyles.trendChartContainer}>
            {months.map((m, i) => {
              const heightPct = maxRate > 0 ? (Math.abs(m.savingsRate) / maxRate) * 100 : 0;
              const isCurrentMonth = i === months.length - 1;
              const isNegative = m.savingsRate < 0;
              const isPositive = m.savingsRate > 0;

              let fillColor = "#10b981";
              if (isNegative) {
                fillColor = isCurrentMonth ? "#ef4444" : "#fca5a5";
              } else if (isPositive) {
                fillColor = isCurrentMonth ? "#10b981" : "#a7f3d0";
              } else {
                fillColor = "#cbd5e1";
              }

              return (
                <View key={`${m.year}-${m.month}`} style={savingsTrendStyles.trendBarWrapper}>
                  <Text
                    style={[
                      savingsTrendStyles.trendBarAmount,
                      isPositive && savingsTrendStyles.trendBarAmountSurplus,
                      isNegative && savingsTrendStyles.trendBarAmountDeficit,
                      isCurrentMonth && savingsTrendStyles.trendBarAmountCurrent,
                    ]}
                    numberOfLines={1}
                  >
                    {m.savingsRate.toFixed(0)}%
                  </Text>

                  <View
                    style={[
                      savingsTrendStyles.trendBar,
                      isNegative && savingsTrendStyles.trendBarDeficit,
                    ]}
                  >
                    <View
                      style={[
                        savingsTrendStyles.trendBarFill,
                        {
                          height: `${Math.max(heightPct, 2)}%`,
                          backgroundColor: fillColor,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      savingsTrendStyles.trendBarLabel,
                      isCurrentMonth && savingsTrendStyles.trendBarLabelCurrent,
                    ]}
                  >
                    {m.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Average reference line */}
          {average !== 0 && (
            <>
              <View
                style={[
                  savingsTrendStyles.trendAvgLine,
                  isAvgDeficit && savingsTrendStyles.trendAvgLineDeficit,
                  { bottom: bottomOffset },
                ]}
              />
              <View
                style={[
                  savingsTrendStyles.trendAvgLabel,
                  isAvgDeficit && savingsTrendStyles.trendAvgLabelDeficit,
                  { bottom: bottomOffset + 2 },
                ]}
              >
                <Text style={savingsTrendStyles.trendAvgLabelText}>
                  avg {average.toFixed(1)}%
                </Text>
              </View>
            </>
          )}
        </View>
      );
    }

    if (viewMode === "income") {
      const maxIncome = months.reduce((max, m) => Math.max(max, m.income), 0);
      const average =
        months.length > 0
          ? months.reduce((s, m) => s + m.income, 0) / months.length
          : 0;
      const avgPct = maxIncome > 0 ? (average / maxIncome) * 100 : 0;
      const bottomOffset = (avgPct / 100) * 160;

      return (
        <View style={savingsTrendStyles.trendChartWrapper}>
          <View style={savingsTrendStyles.trendChartContainer}>
            {months.map((m, i) => {
              const heightPct = maxIncome > 0 ? (m.income / maxIncome) * 100 : 0;
              const isCurrentMonth = i === months.length - 1;

              return (
                <View key={`${m.year}-${m.month}`} style={savingsTrendStyles.trendBarWrapper}>
                  <Text
                    style={[
                      savingsTrendStyles.trendBarAmount,
                      isCurrentMonth && { color: "#28a745", fontWeight: "700" },
                    ]}
                    numberOfLines={1}
                  >
                    {m.income > 0 ? formatAmount(m.income) : "–"}
                  </Text>

                  <View style={[savingsTrendStyles.trendBar, { backgroundColor: "#f0f8f2" }]}>
                    <View
                      style={[
                        savingsTrendStyles.trendBarFill,
                        {
                          height: `${Math.max(heightPct, 2)}%`,
                          backgroundColor: isCurrentMonth ? "#28a745" : "#a3e4b8",
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      savingsTrendStyles.trendBarLabel,
                      isCurrentMonth && { color: "#28a745", fontWeight: "700" },
                    ]}
                  >
                    {m.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {average > 0 && (
            <>
              <View
                style={[
                  savingsTrendStyles.trendAvgLine,
                  { backgroundColor: "#28a745", bottom: bottomOffset },
                ]}
              />
              <View
                style={[
                  savingsTrendStyles.trendAvgLabel,
                  { backgroundColor: "#28a745", bottom: bottomOffset + 2 },
                ]}
              >
                <Text style={savingsTrendStyles.trendAvgLabelText}>
                  avg {formatAmount(average)}
                </Text>
              </View>
            </>
          )}
        </View>
      );
    }

    const maxExpense = months.reduce((max, m) => Math.max(max, m.expense), 0);
    const average =
      months.length > 0
        ? months.reduce((s, m) => s + m.expense, 0) / months.length
        : 0;
    const avgPct = maxExpense > 0 ? (average / maxExpense) * 100 : 0;
    const bottomOffset = (avgPct / 100) * 160;

    return (
      <View style={savingsTrendStyles.trendChartWrapper}>
        <View style={savingsTrendStyles.trendChartContainer}>
          {months.map((m, i) => {
            const heightPct = maxExpense > 0 ? (m.expense / maxExpense) * 100 : 0;
            const isCurrentMonth = i === months.length - 1;

            return (
              <View key={`${m.year}-${m.month}`} style={savingsTrendStyles.trendBarWrapper}>
                <Text
                  style={[
                    savingsTrendStyles.trendBarAmount,
                    isCurrentMonth && { color: "#007AFF", fontWeight: "700" },
                  ]}
                  numberOfLines={1}
                >
                  {m.expense > 0 ? formatAmount(m.expense) : "–"}
                </Text>

                <View style={[savingsTrendStyles.trendBar, { backgroundColor: "#f0f4f8" }]}>
                  <View
                    style={[
                      savingsTrendStyles.trendBarFill,
                      {
                        height: `${Math.max(heightPct, 2)}%`,
                        backgroundColor: isCurrentMonth ? "#007AFF" : "#B0D4FF",
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    savingsTrendStyles.trendBarLabel,
                    isCurrentMonth && { color: "#007AFF", fontWeight: "700" },
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            );
          })}
        </View>

        {average > 0 && (
          <>
            <View
              style={[
                savingsTrendStyles.trendAvgLine,
                { backgroundColor: "#007AFF", bottom: bottomOffset },
              ]}
            />
            <View
              style={[
                savingsTrendStyles.trendAvgLabel,
                { backgroundColor: "#007AFF", bottom: bottomOffset + 2 },
              ]}
            >
              <Text style={savingsTrendStyles.trendAvgLabelText}>
                avg {formatAmount(average)}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderComparisonAndAverage = () => {
    if (!trendData) return null;
    const { currentMonth, previousMonth, averageNet, averageSavingsRate, months } = trendData;

    if (viewMode === "net") {
      const currLabel = currentMonth.net >= 0 ? `${formatAmount(currentMonth.net)} Surplus` : `${formatAmount(currentMonth.net)} Deficit`;
      const prevLabel = previousMonth.net >= 0 ? `${formatAmount(previousMonth.net)} Surplus` : `${formatAmount(previousMonth.net)} Deficit`;

      return (
        <>
          <Text style={savingsTrendStyles.trendCompare}>
            {currLabel} this month vs {prevLabel} last month
          </Text>
          <View style={savingsTrendStyles.trendAvgStat}>
            <Text style={savingsTrendStyles.trendAvgStatLabel}>6-mo avg:</Text>
            <Text
              style={[
                savingsTrendStyles.trendAvgStatText,
                averageNet < 0 && savingsTrendStyles.trendAvgStatTextDeficit,
              ]}
            >
              {averageNet >= 0 ? "+" : "-"}{formatAmount(averageNet)}/mo ({averageNet >= 0 ? "Surplus" : "Deficit"})
            </Text>
          </View>
        </>
      );
    }

    if (viewMode === "rate") {
      return (
        <>
          <Text style={savingsTrendStyles.trendCompare}>
            {currentMonth.savingsRate.toFixed(1)}% savings rate this month vs {previousMonth.savingsRate.toFixed(1)}% last month
          </Text>
          <View style={savingsTrendStyles.trendAvgStat}>
            <Text style={savingsTrendStyles.trendAvgStatLabel}>6-mo avg rate:</Text>
            <Text
              style={[
                savingsTrendStyles.trendAvgStatText,
                averageSavingsRate < 0 && savingsTrendStyles.trendAvgStatTextDeficit,
              ]}
            >
              {averageSavingsRate.toFixed(1)}%
            </Text>
          </View>
        </>
      );
    }

    if (viewMode === "income") {
      const avgIncome = months.length > 0 ? months.reduce((s, m) => s + m.income, 0) / months.length : 0;
      return (
        <>
          <Text style={savingsTrendStyles.trendCompare}>
            {formatAmount(currentMonth.income)} this month vs {formatAmount(previousMonth.income)} last month
          </Text>
          <View style={savingsTrendStyles.trendAvgStat}>
            <Text style={savingsTrendStyles.trendAvgStatLabel}>6-mo avg income:</Text>
            <Text style={[savingsTrendStyles.trendAvgStatText, { color: "#28a745" }]}>
              {formatAmount(avgIncome)}/mo
            </Text>
          </View>
        </>
      );
    }

    // viewMode === "expense"
    const avgExpense = months.length > 0 ? months.reduce((s, m) => s + m.expense, 0) / months.length : 0;
    return (
      <>
        <Text style={savingsTrendStyles.trendCompare}>
          {formatAmount(currentMonth.expense)} this month vs {formatAmount(previousMonth.expense)} last month
        </Text>
        <View style={savingsTrendStyles.trendAvgStat}>
          <Text style={savingsTrendStyles.trendAvgStatLabel}>6-mo avg spend:</Text>
          <Text style={[savingsTrendStyles.trendAvgStatText, { color: "#007AFF" }]}>
            {formatAmount(avgExpense)}/mo
          </Text>
        </View>
      </>
    );
  };

  return (
    <View style={savingsTrendStyles.trendCard}>
      {/* Header */}
      <View style={savingsTrendStyles.trendHeader}>
        <Text style={savingsTrendStyles.trendTitle}>Savings Trends</Text>
        {renderBadge()}
      </View>

      {/* Option pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={savingsTrendStyles.trendPillScroll}
        contentContainerStyle={savingsTrendStyles.trendPillContent}
      >
        {VIEW_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              savingsTrendStyles.trendPill,
              viewMode === opt.key && savingsTrendStyles.trendPillActive,
            ]}
            onPress={() => setViewMode(opt.key)}
          >
            <Text
              style={[
                savingsTrendStyles.trendPillText,
                viewMode === opt.key && savingsTrendStyles.trendPillTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart area */}
      {loading ? (
        <View style={savingsTrendStyles.trendLoadingContainer}>
          <ActivityIndicator size="small" color="#10b981" />
        </View>
      ) : (
        <>
          {renderChart()}
          {renderComparisonAndAverage()}
        </>
      )}
    </View>
  );
}
