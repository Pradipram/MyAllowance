// import logo from "@/assets/images/logo.png";
import { styles } from "@/assets/styles/index.style";
import NoBudgetSet from "@/components/noBudgetSet";
import { getMonthYearString } from "@/utils/utility";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMonthDataLoading, setIsMonthDataLoading] = useState(false);
  const [hasMonthData, setHasMonthData] = useState(false);
  const [showAutoBudgetPrompt, setShowAutoBudgetPrompt] = useState(false);

  useEffect(() => {
    loadMonthData();
  }, []);

  useEffect(() => {
    loadMonthData();
  }, [selectedDate]);

  // Refresh data when screen comes into focus (e.g., returning from edit)
  useFocusEffect(
    useCallback(() => {
      loadMonthData();
      // Check for auto budget suggestions after a brief delay
      setTimeout(() => {
        checkForAutoBudgetSuggestion();
      }, 1000);
    }, [selectedDate])
  );

  const loadMonthData = async () => {
    setIsLoading(true);
    try {
      const month = (selectedDate.getMonth() + 1).toString();
      const year = selectedDate.getFullYear();

      // Check global setup status first
      const globalSetupComplete = await StorageService.isSetupComplete();
      const baseCategories = await StorageService.getBudgetCategories();

      // If no base categories exist, setup is definitely not complete
      const actualSetupComplete =
        globalSetupComplete && baseCategories.length > 0;

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
        setHasMonthData(true);
        setIsSetupComplete(actualSetupComplete);
      } else {
        setHasMonthData(false);

        // For current month or future months, load base categories as template
        // For past months, show zero budgets (no inheritance from template)
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const isCurrentOrFutureMonth =
          year > currentYear ||
          (year === currentYear && parseInt(month) >= currentMonth);

        if (isCurrentOrFutureMonth) {
          // Load base categories if no month data exists for current/future months
          if (actualSetupComplete) {
            setBudgetCategories(
              baseCategories.map((cat) => ({ ...cat, spent: 0 }))
            );
            setIsSetupComplete(true);
          } else {
            setBudgetCategories([]);
            setIsSetupComplete(false);
          }
        } else {
          // For past months with no data, show empty state but keep global setup status
          setBudgetCategories([]);
          setIsSetupComplete(actualSetupComplete);
        }
      }
    } catch (error) {
      console.error("Error loading month data:", error);
      setHasMonthData(false);
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

  const checkForAutoBudgetSuggestion = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const shouldShow = await StorageService.shouldShowAutoSuggestion(
        currentYear,
        currentMonth
      );

      if (shouldShow && isSetupComplete && budgetCategories.length === 0) {
        // Show prompt only if user has setup complete but no current month budget
        Alert.alert(
          "Smart Budget Available! 🎯",
          "We can suggest your budget based on your past spending patterns. Would you like to see our recommendations?",
          [
            { text: "Maybe Later", style: "cancel" },
            {
              text: "Show Suggestions",
              onPress: () => {
                router.push("/set-budget?autoSuggest=true");
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error checking for auto budget suggestion:", error);
    }
  };

  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    const today = new Date();

    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
      setSelectedDate(newDate);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
      setSelectedDate(newDate);
      if (isFutureThreeMonth()) {
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
      }
    }
  };

  const isFutureThreeMonth = () => {
    const today = new Date();
    // const selectedDate = new Date(selectedDate);

    // Calculate the date 3 months from now
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 2);
    // console.log("Three Months Later:", threeMonthsLater);

    // Allow only future months within 3 months range
    // return selectedDate > today && selectedDate <= threeMonthsLater;
    return selectedDate > threeMonthsLater;
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
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const isEditableMonth = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Check if the displayed month is within the next 3 months
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentYear, currentMonth - 1 + i, 1);
      const monthNum = date.getMonth() + 1;
      const yearNum = date.getFullYear();

      if (
        selectedDate.getMonth() + 1 === monthNum &&
        selectedDate.getFullYear() === yearNum
      ) {
        return true;
      }
    }

    return false;
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

  // if (isSetupComplete || 1) {
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
            {getMonthYearString(selectedDate)}
            {isCurrentMonth() && (
              <Text style={styles.currentMonthIndicator}> • Current</Text>
            )}
          </Text>
          <TouchableOpacity
            style={[
              styles.monthArrow,
              isFutureThreeMonth() && styles.disabledArrow,
            ]}
            onPress={() => changeMonth("next")}
            disabled={isFutureThreeMonth()}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isFutureThreeMonth() ? "#ccc" : "#007AFF"}
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
          <NoBudgetSet selectedDate={selectedDate} />
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
                  const month = (selectedDate.getMonth() + 1).toString();
                  const year = selectedDate.getFullYear();
                  router.push(`./expense-history?month=${month}&year=${year}`);
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
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      const month = (selectedDate.getMonth() + 1).toString();
                      const year = selectedDate.getFullYear().toString();
                      router.push(
                        `/expense-history?month=${month}&year=${year}&category=${category.id}`
                      );
                    }}
                  >
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
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.quickActionsSection}>
              {isEditableMonth() ? (
                <TouchableOpacity
                  style={styles.editBudgetButton}
                  onPress={() => {
                    const month = (selectedDate.getMonth() + 1).toString();
                    const year = selectedDate.getFullYear().toString();
                    router.push(`/set-budget?month=${month}&year=${year}`);
                  }}
                >
                  <Ionicons name="settings" size={20} color="#007AFF" />
                  <Text style={styles.editBudgetText}>Edit Budget</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editBudgetDisabled}>
                  <Ionicons name="lock-closed" size={20} color="#999" />
                  <Text style={styles.editBudgetDisabledText}>
                    Budget editing only available for current and next 2 months
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
            const month = (selectedDate.getMonth() + 1).toString();
            const year = selectedDate.getFullYear().toString();
            router.push(`/add-expense?month=${month}&year=${year}`);
          }}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
