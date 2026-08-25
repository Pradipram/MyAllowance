import { styles } from "@/assets/styles/index.style";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MonthlySummaryCardProps {
  selectedMonth: number;
  selectedYear: number;
  getTotalIncome: () => number;
  getTotalSpent: () => number;
  getNet: () => number;
  hasTransactions: boolean;
}

const MonthlySummaryCard: FC<MonthlySummaryCardProps> = ({
  selectedMonth,
  selectedYear,
  getTotalIncome,
  getTotalSpent,
  getNet,
  hasTransactions,
}) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTitleRow}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        {hasTransactions && (
          <TouchableOpacity
            style={styles.summaryTrendIcon}
            activeOpacity={0.7}
            onPress={() => {
              router.push(
                `/analysis?month=${selectedMonth}&year=${selectedYear}`,
              );
            }}
          >
            <Ionicons name="trending-up-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* 2-Item First Row */}
      <View style={styles.summaryGrid}>
        {/* Total Income */}
        <View style={styles.gridItem}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryAmount, styles.incomeAmount]}>
            ₹{getTotalIncome().toLocaleString()}
          </Text>
        </View>

        {/* Overall Spent */}
        <View style={styles.gridItem}>
          <Text style={styles.summaryLabel}>Overall Spent</Text>
          <Text style={[styles.summaryAmount, styles.spentAmount]}>
            ₹{getTotalSpent().toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Net Surplus/Deficit - Second Row */}
      <View style={styles.netSection}>
        <Text style={styles.summaryLabel}>
          {getNet() >= 0 ? "Surplus" : "Deficit"}
        </Text>
        <Text
          style={[
            styles.netAmount,
            {
              color: getNet() >= 0 ? "#28a745" : "#ff4444",
            },
          ]}
        >
          ₹{Math.abs(getNet()).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

export default MonthlySummaryCard;
