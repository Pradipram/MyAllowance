import { styles } from "@/assets/styles/index.style";
import IndexHeader from "@/components/header/index-header";
import ProfileModal from "@/components/profile/profile-modal";
import { checkForUpdates } from "@/components/version/updateChecker";
import { getTransactions } from "@/services/transaction";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Transaction } from "../types/types";

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Check authentication status
  useEffect(() => {
    checkForUpdates(false);

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          router.replace("/login");
          setUser(null);
        }
        setIsLoadingUser(false);
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadMonthData();
    }
  }, [selectedDate, user]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadMonthData();
      }
    }, [user, selectedDate]),
  );

  const loadMonthData = async () => {
    try {
      setIsLoading(true);
      const res = await getTransactions(
        selectedDate.getMonth() + 1,
        selectedDate.getFullYear(),
      );
      setTransactions(res || []);
    } catch (error) {
      console.error("Error loading month transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total income
  const getTotalIncome = () => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Calculate total spent
  const getTotalSpent = () => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Calculate net (surplus/deficit)
  const getNet = () => {
    return getTotalIncome() - getTotalSpent();
  };

  // Group expenses by category
  const getExpensesByCategory = () => {
    const categoryMap: { [key: string]: number } = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (categoryMap[t.category_name]) {
          categoryMap[t.category_name] += t.amount;
        } else {
          categoryMap[t.category_name] = t.amount;
        }
      });

    return Object.entries(categoryMap)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
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

  if (isLoading || isLoadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <IndexHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isCurrentMonth={isCurrentMonth}
        setShowProfileModal={setShowProfileModal}
        user={user}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {transactions.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="wallet-outline" size={48} color="#999" />
            <Text style={styles.noDataTitle}>No Transactions</Text>
            <Text style={styles.noDataText}>
              Start tracking your income and expenses by adding a transaction.
            </Text>
          </View>
        ) : (
          <>
            {/* Monthly Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Monthly Summary</Text>

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

            {/* Expense History Link */}
            <View style={styles.quickActionsSection}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  router.push(
                    `./expense-history?month=${(
                      selectedDate.getMonth() + 1
                    ).toString()}&year=${selectedDate.getFullYear()}`,
                  );
                }}
              >
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.quickActionText}>Expense History</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Expense Categories */}
            {getExpensesByCategory().length > 0 && (
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>Categories</Text>
                {getExpensesByCategory().map((category) => {
                  const totalExpenses = getTotalSpent();
                  const totalIncome = getTotalIncome();
                  const pctOfExpenses =
                    totalExpenses > 0
                      ? (category.amount / totalExpenses) * 100
                      : 0;
                  const pctOfIncome =
                    totalIncome > 0
                      ? (category.amount / totalIncome) * 100
                      : 0;

                  return (
                    <TouchableOpacity
                      key={category.name}
                      style={styles.categoryCard}
                      activeOpacity={0.7}
                      onPress={() => {
                        const month = (
                          selectedDate.getMonth() + 1
                        ).toString();
                        const year = selectedDate.getFullYear().toString();
                        router.push(
                          `/expense-history?month=${month}&year=${year}&categoryName=${encodeURIComponent(category.name)}`,
                        );
                      }}
                    >
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryName}>
                          {category.name}
                        </Text>
                        <Text style={styles.categoryAmount}>
                          ₹{category.amount.toLocaleString()}
                        </Text>
                      </View>

                      {/* % of Total Expenses */}
                      <View style={styles.percentageRow}>
                        <Text style={styles.percentageLabel}>Spend Share</Text>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${Math.min(pctOfExpenses, 100)}%`,
                                backgroundColor: "#007AFF",
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.percentageValue,
                            { color: "#007AFF" },
                          ]}
                        >
                          {pctOfExpenses.toFixed(1)}%
                        </Text>
                      </View>

                      {/* % of Total Income */}
                      <View style={[styles.percentageRow, { marginTop: 6 }]}>
                        <Text style={styles.percentageLabel}>Income Impact</Text>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${Math.min(pctOfIncome, 100)}%`,
                                backgroundColor:
                                  pctOfIncome > 50
                                    ? "#FF3B30"
                                    : pctOfIncome > 25
                                      ? "#ff9500"
                                      : "#34C759",
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.percentageValue,
                            {
                              color:
                                pctOfIncome > 50
                                  ? "#FF3B30"
                                  : pctOfIncome > 25
                                    ? "#ff9500"
                                    : "#34C759",
                            },
                          ]}
                        >
                          {pctOfIncome.toFixed(1)}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {isCurrentMonth() && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, styles.fabExpense]}
            onPress={() => {
              const month = (selectedDate.getMonth() + 1).toString();
              const year = selectedDate.getFullYear().toString();
              router.push(
                `/add-transaction?month=${month}&year=${year}&type=expense`,
              );
            }}
          >
            <Ionicons name="remove" size={32} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fab, styles.fabIncome]}
            onPress={() => {
              const month = (selectedDate.getMonth() + 1).toString();
              const year = selectedDate.getFullYear().toString();
              router.push(
                `/add-transaction?month=${month}&year=${year}&type=income`,
              );
            }}
          >
            <Ionicons name="add" size={32} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Modal */}
      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </SafeAreaView>
  );
}
