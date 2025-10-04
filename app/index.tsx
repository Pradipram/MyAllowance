import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetCategory, Transaction } from "../types/budget";
import { StorageService } from "../utils/storage";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(
    []
  );
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthDataLoading, setIsMonthDataLoading] = useState(false);
  const [hasMonthData, setHasMonthData] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  useEffect(() => {
    if (isSetupComplete) {
      loadMonthData();
    }
  }, [currentDate, isSetupComplete]);

  // Refresh data when screen comes into focus (e.g., returning from edit)
  useFocusEffect(
    useCallback(() => {
      if (isSetupComplete) {
        loadMonthData();
      }
    }, [isSetupComplete, currentDate])
  );

  const checkSetupStatus = async () => {
    try {
      const setupComplete = await StorageService.isSetupComplete();
      setIsSetupComplete(setupComplete);
    } catch (error) {
      console.error("Error checking setup status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMonthData = async () => {
    setIsLoading(true);
    try {
      const month = (currentDate.getMonth() + 1).toString();
      const year = currentDate.getFullYear();

      // Load monthly budget data
      const monthData = await StorageService.getMonthlyBudgetData(month, year);

      // Load monthly transactions
      const transactions = await StorageService.getMonthTransactions(
        month,
        year
      );
      setMonthTransactions(transactions);

      if (monthData && monthData.categories.length > 0) {
        setBudgetCategories(monthData.categories);
        setIsSetupComplete(true);
      } else {
        // Load base categories if no month data exists
        const baseCategories = await StorageService.getBudgetCategories();
        if (baseCategories.length > 0) {
          setBudgetCategories(
            baseCategories.map((cat) => ({ ...cat, spent: 0 }))
          );
          setIsSetupComplete(true);
        } else {
          setIsSetupComplete(false);
        }
      }
    } catch (error) {
      console.error("Error loading month data:", error);
      setIsSetupComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalBudget = () => {
    return budgetCategories.reduce((total, cat) => total + cat.amount, 0);
  };

  const getTotalSpent = () => {
    if (!monthTransactions || monthTransactions.length === 0) {
      return budgetCategories.reduce(
        (total, cat) => total + (cat.spent || 0),
        0
      );
    }
    return monthTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
  };

  const getCategorySpent = (categoryId: string): number => {
    if (!monthTransactions || monthTransactions.length === 0) {
      const category = budgetCategories.find((cat) => cat.id === categoryId);
      return category?.spent || 0;
    }
    return monthTransactions
      .filter((transaction) => transaction.categoryId === categoryId)
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getRemaining = () => {
    return getTotalBudget() - getTotalSpent();
  };

  const getMonthYearString = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    const today = new Date();

    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
      if (
        newDate.getFullYear() < today.getFullYear() ||
        (newDate.getFullYear() === today.getFullYear() &&
          newDate.getMonth() <= today.getMonth())
      ) {
        setCurrentDate(newDate);
      }
    }
  };

  const isFutureMonth = () => {
    const today = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return (
      nextMonth.getFullYear() > today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() &&
        nextMonth.getMonth() > today.getMonth())
    );
  };

  const getProgressPercentage = (spent: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "#ff4444";
    if (percentage >= 75) return "#ff9500";
    if (percentage >= 50) return "#ffcc00";
    return "#007AFF";
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return (
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSetupComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              style={styles.monthArrow}
              onPress={() => changeMonth("prev")}
            >
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text
              style={[
                styles.monthText,
                isCurrentMonth() && styles.currentMonthText,
              ]}
            >
              {getMonthYearString()}
              {isCurrentMonth() && (
                <Text style={styles.currentMonthIndicator}> • Current</Text>
              )}
            </Text>
            <TouchableOpacity
              style={[
                styles.monthArrow,
                isFutureMonth() && styles.disabledArrow,
              ]}
              onPress={() => changeMonth("next")}
              disabled={isFutureMonth()}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={isFutureMonth() ? "#ccc" : "#007AFF"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {isMonthDataLoading ? (
            <View style={styles.monthLoadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.monthLoadingText}>Loading month data...</Text>
            </View>
          ) : !hasMonthData && budgetCategories.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Ionicons name="calendar-outline" size={60} color="#ccc" />
              <Text style={styles.noDataTitle}>No Data Available</Text>
              <Text style={styles.noDataText}>
                No budget data found for {getMonthYearString()}.
                {currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()
                  ? " Start by adding some expenses to track your spending this month."
                  : " This month doesn't have any recorded budget data."}
              </Text>
            </View>
          ) : budgetCategories.length > 0 ? (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Monthly Overview</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Budget</Text>
                    <Text style={styles.summaryAmount}>
                      ₹{getTotalBudget().toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Spent</Text>
                    <Text style={[styles.summaryAmount, styles.spentAmount]}>
                      ₹{getTotalSpent().toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.remainingSection}>
                  <Text style={styles.remainingLabel}>Remaining</Text>
                  <Text
                    style={[
                      styles.remainingAmount,
                      { color: getRemaining() >= 0 ? "#28a745" : "#ff4444" },
                    ]}
                  >
                    ₹{Math.abs(getRemaining()).toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActionsSection}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => {
                    const month = (currentDate.getMonth() + 1).toString();
                    const year = currentDate.getFullYear();
                    router.push(
                      `./expense-history?month=${month}&year=${year}`
                    );
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#007AFF" />
                  <Text style={styles.quickActionText}>Expense History</Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>Budget Categories</Text>
                {budgetCategories.map((category) => {
                  const spent = getCategorySpent(category.id);
                  const percentage = getProgressPercentage(
                    spent,
                    category.amount
                  );
                  const progressColor = getProgressColor(percentage);

                  return (
                    <View key={category.id} style={styles.categoryCard}>
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryAmount}>
                          ₹{spent.toLocaleString()} / ₹
                          {category.amount.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${percentage}%`,
                                backgroundColor: progressColor,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressPercentage}>
                          {Math.round(percentage)}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.quickActionsSection}>
                {isCurrentMonth() ? (
                  <TouchableOpacity
                    style={styles.editBudgetButton}
                    onPress={() => {
                      const month = (currentDate.getMonth() + 1).toString();
                      const year = currentDate.getFullYear().toString();
                      router.push(`/onboarding?month=${month}&year=${year}`);
                    }}
                  >
                    <Ionicons name="settings" size={20} color="#007AFF" />
                    <Text style={styles.editBudgetText}>Edit Budget</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editBudgetDisabled}>
                    <Ionicons name="lock-closed" size={20} color="#999" />
                    <Text style={styles.editBudgetDisabledText}>
                      Budget editing only available for current month
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : null}
        </ScrollView>

        {isCurrentMonth() && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              const month = (currentDate.getMonth() + 1).toString();
              const year = currentDate.getFullYear().toString();
              router.push(`/add-expense?month=${month}&year=${year}`);
            }}
          >
            <Ionicons name="add" size={32} color="#ffffff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.welcomeHeader}>
          <Ionicons name="wallet" size={80} color="#007AFF" />
          <Text style={styles.title}>My Allowance</Text>
          <Text style={styles.subtitle}>
            Track your monthly budget and expenses with ease
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/onboarding")}
          >
            <Text style={styles.primaryButtonText}>Set Up Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/learn-more")}
          >
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  monthArrow: {
    padding: 8,
  },
  disabledArrow: {
    opacity: 0.3,
  },
  monthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginHorizontal: 20,
    minWidth: 120,
    textAlign: "center",
  },
  currentMonthText: {
    color: "#007AFF",
  },
  currentMonthIndicator: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  monthLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  monthLoadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20,
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  spentAmount: {
    color: "#ff9500",
  },
  remainingSection: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  remainingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  remainingAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  categoriesSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    minWidth: 35,
    textAlign: "right",
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  editBudgetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
  },
  editBudgetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 8,
  },
  editBudgetDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  editBudgetDisabledText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginLeft: 8,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeHeader: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  quickActionButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    marginLeft: 12,
  },
});
