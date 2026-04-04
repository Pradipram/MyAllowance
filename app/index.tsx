// import logo from "@/assets/images/logo.png";
import { styles } from "@/assets/styles/index.style";
import IndexHeader from "@/components/header/index-header";
import IncomeSourcesModal from "@/components/modal/income-sources-modal";
import NoBudgetSet from "@/components/noBudgetSet";
import ProfileModal from "@/components/profile/profile-modal";
import { checkForUpdates } from "@/components/version/updateChecker";
import { getMonthlyRecords } from "@/services/monthly_records";
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
import { MonthlyRecord } from "../types/types";

export default function Index() {
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);
  const [monthRecord, setMonthRecord] = useState<MonthlyRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showIncomeSourcesModal, setShowIncomeSourcesModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Check authentication status
  useEffect(() => {
    checkForUpdates(false);

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
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
      setIsBudgetLoading(true);
      const res = await getMonthlyRecords(
        selectedDate.getMonth() + 1,
        selectedDate.getFullYear(),
      );
      setMonthRecord(
        res
          ? {
              ...res,
              budget_categories:
                res.budget_categories && res.budget_categories.length > 0
                  ? res.budget_categories.map((cat: any) => ({
                      ...cat,
                      budget: cat.budget ?? cat.amount ?? 0,
                    }))
                  : [],
            }
          : null,
      );
    } catch (error) {
      console.error("Error loading month budget:", error);
    } finally {
      setIsBudgetLoading(false);
    }
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

  const getRemainingAmount = () => {
    if (!monthRecord) return 0;
    return monthRecord.total_budget - monthRecord.total_spent;
  };

  const getCashflowBalance = () => {
    if (!monthRecord) return 0;
    return monthRecord.total_income - monthRecord.total_spent;
  };

  if (isBudgetLoading || isLoadingUser) {
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
        {!monthRecord || monthRecord.budget_categories.length === 0 ? (
          <NoBudgetSet selectedDate={selectedDate} />
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Monthly Summary</Text>

              {/* 4-Item Grid Layout */}
              <View style={styles.summaryGrid}>
                <View style={styles.gridRow}>
                  {/* Total Income */}
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => setShowIncomeSourcesModal(true)}
                  >
                    <View style={styles.incomeHeaderWithIcon}>
                      <Text style={styles.summaryLabel}>Total Income</Text>
                      <Ionicons
                        name="information-circle"
                        size={18}
                        color="#1ac8a9"
                      />
                    </View>
                    <Text style={[styles.summaryAmount, styles.incomeAmount]}>
                      ₹{monthRecord.total_income.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                  {/* Total Budget */}
                  <View style={styles.gridItem}>
                    <Text style={styles.summaryLabel}>Total Budget</Text>
                    <Text style={styles.summaryAmount}>
                      ₹{monthRecord.total_budget.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.gridRow}>
                  {/* Overall Spent */}
                  <View style={styles.gridItem}>
                    <Text style={styles.summaryLabel}>Overall Spent</Text>
                    <Text style={[styles.summaryAmount, styles.spentAmount]}>
                      ₹{monthRecord.total_spent.toLocaleString()}
                    </Text>
                  </View>
                  {/* Budget Remaining */}
                  <View style={styles.gridItem}>
                    <Text style={styles.summaryLabel}>Budget Remaining</Text>
                    <Text
                      style={[
                        styles.summaryAmount,
                        {
                          color: getRemainingAmount() >= 0 ? "#666" : "#ff4444",
                        },
                      ]}
                    >
                      ₹{Math.abs(getRemainingAmount()).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Cashflow Balance Section */}
              <View style={styles.cashflowSection}>
                <Text style={styles.cashflowLabel}>
                  {getCashflowBalance() >= 0 ? "Surplus" : "Deficit"}
                </Text>
                <Text
                  style={[
                    styles.cashflowAmount,
                    {
                      color: getCashflowBalance() >= 0 ? "#28a745" : "#ff4444",
                    },
                  ]}
                >
                  ₹{Math.abs(getCashflowBalance()).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  // const month = (selectedDate.getMonth() + 1).toString();
                  // const year = selectedDate.getFullYear();
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

            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Budget Categories</Text>
              {monthRecord.budget_categories.map((category) => {
                const spent = category.spent || 0;
                const percentage = getProgressPercentage(
                  spent,
                  category.budget,
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
                        `/expense-history?month=${month}&year=${year}&categoryId=${category.id}`,
                      );
                    }}
                  >
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryAmount}>
                        ₹{spent.toLocaleString()} / ₹
                        {category.budget.toLocaleString()}
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
              <TouchableOpacity
                style={[
                  styles.editBudgetButton,
                  { borderLeftColor: "#007AFF", borderLeftWidth: 4 },
                ]}
                onPress={() => {
                  router.push(
                    `/monthly-setup?selected_date=${selectedDate.toISOString()}&view=budget`,
                  );
                }}
              >
                <Ionicons name="settings" size={20} color="#007AFF" />
                <Text style={styles.editBudgetText}>Edit Budget</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.editBudgetButton,
                  { borderLeftColor: "#28a745", borderLeftWidth: 4 },
                ]}
                onPress={() => {
                  router.push(
                    `/monthly-setup?selected_date=${selectedDate.toISOString()}&view=income`,
                  );
                }}
              >
                <Ionicons name="settings" size={20} color="#28a745" />
                <Text style={[styles.editBudgetText, { color: "#28a745" }]}>
                  Edit Income Source
                </Text>
              </TouchableOpacity>
            </View>
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

      {/* Income Sources Modal */}
      <IncomeSourcesModal
        visible={showIncomeSourcesModal}
        onClose={() => setShowIncomeSourcesModal(false)}
        incomeSources={monthRecord?.income_sources || []}
        totalIncome={monthRecord?.total_income || 0}
      />
    </SafeAreaView>
  );
}
