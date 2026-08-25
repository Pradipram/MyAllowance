import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PortfolioSummary } from "@/types/types";

interface PortfolioHeaderProps {
  summary: PortfolioSummary;
}

export default function PortfolioHeader({ summary }: PortfolioHeaderProps) {
  const isPositive = (summary?.absolute_delta ?? 0) >= 0;
  const absDelta = Math.abs(summary?.absolute_delta ?? 0);
  const formattedValue = (summary?.total_current_value ?? 0).toLocaleString();
  const formattedAbsDelta = absDelta.toLocaleString();
  const formattedPctDelta = `${isPositive ? "+" : ""}${(summary?.percentage_delta ?? 0).toFixed(2)}%`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Portfolio Value</Text>
      <Text style={styles.totalValue}>₹{formattedValue}</Text>

      <View
        style={[
          styles.pill,
          isPositive ? styles.pillPositive : styles.pillNegative,
        ]}
      >
        <Text style={styles.pillText}>
          {isPositive ? "+" : "-"}₹{formattedAbsDelta} ({formattedPctDelta})
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "center",
  },
  pillPositive: {
    backgroundColor: "#28a745",
  },
  pillNegative: {
    backgroundColor: "#dc3545",
  },
  pillText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
