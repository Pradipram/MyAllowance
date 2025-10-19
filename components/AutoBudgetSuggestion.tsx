import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BudgetCategory } from "../types/budget";

interface BudgetSuggestionData {
  category: BudgetCategory;
  averageSpent: number;
  suggestedBudget: number;
}

interface AutoBudgetSuggestionProps {
  visible: boolean;
  suggestions: BudgetSuggestionData[];
  onApplyAll: () => void;
  onCustomize: () => void;
  onClose: () => void;
}

export default function AutoBudgetSuggestion({
  visible,
  suggestions,
  onApplyAll,
  onCustomize,
  onClose,
}: AutoBudgetSuggestionProps) {
  const [autoApplyNext, setAutoApplyNext] = useState(false);

  const getTotalSuggested = () => {
    return suggestions.reduce((total, item) => total + item.suggestedBudget, 0);
  };

  const getTotalAverage = () => {
    return suggestions.reduce((total, item) => total + item.averageSpent, 0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auto Budget Suggestion</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <Ionicons name="bulb-outline" size={32} color="#007AFF" />
            <Text style={styles.infoTitle}>Smart Budget Analysis</Text>
            <Text style={styles.infoText}>
              We've calculated your next month's budget based on your spending
              patterns from the last 3 months.
            </Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Average Monthly Spending</Text>
              <Text style={styles.summaryAmount}>
                ₹{getTotalAverage().toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Suggested Budget</Text>
              <Text style={[styles.summaryAmount, styles.suggestedAmount]}>
                ₹{getTotalSuggested().toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Category-wise Breakdown */}
          <View style={styles.tableSection}>
            <Text style={styles.tableTitle}>Category-wise Breakdown</Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.categoryColumn]}>
                Category
              </Text>
              <Text style={[styles.tableHeaderText, styles.amountColumn]}>
                Avg Spent
              </Text>
              <Text style={[styles.tableHeaderText, styles.amountColumn]}>
                Suggested
              </Text>
            </View>

            {/* Table Rows */}
            {suggestions.map((item, index) => (
              <View
                key={item.category.id}
                style={[
                  styles.tableRow,
                  index === suggestions.length - 1 && styles.lastRow,
                ]}
              >
                <View style={styles.categoryColumn}>
                  <Text style={styles.categoryName}>{item.category.name}</Text>
                </View>
                <View style={styles.amountColumn}>
                  <Text style={styles.averageAmount}>
                    ₹{item.averageSpent.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.amountColumn}>
                  <Text
                    style={[
                      styles.suggestedAmount,
                      item.suggestedBudget > item.averageSpent &&
                        styles.increasedAmount,
                    ]}
                  >
                    ₹{item.suggestedBudget.toLocaleString()}
                  </Text>
                  {item.suggestedBudget > item.averageSpent && (
                    <Text style={styles.increaseIndicator}>
                      +
                      {Math.round(
                        ((item.suggestedBudget - item.averageSpent) /
                          item.averageSpent) *
                          100
                      )}
                      %
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Auto-apply Option */}
          <TouchableOpacity
            style={styles.checkboxSection}
            onPress={() => setAutoApplyNext(!autoApplyNext)}
          >
            <View
              style={[
                styles.checkbox,
                autoApplyNext && styles.checkboxSelected,
              ]}
            >
              {autoApplyNext && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              Apply suggested budget automatically next month
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.customizeButton}
            onPress={onCustomize}
          >
            <Text style={styles.customizeButtonText}>Customize Manually</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={onApplyAll}>
            <Text style={styles.applyButtonText}>Apply All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  summarySection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  suggestedAmount: {
    color: "#007AFF",
  },
  tableSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  categoryColumn: {
    flex: 2,
    justifyContent: "center",
  },
  amountColumn: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  averageAmount: {
    fontSize: 16,
    color: "#666",
  },
  increasedAmount: {
    fontWeight: "600",
  },
  increaseIndicator: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "600",
    marginTop: 2,
  },
  checkboxSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkboxText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  actionSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  customizeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  customizeButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
