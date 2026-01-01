// import logo from "@/assets/images/logo.png";
import { styles } from "@/assets/styles/index.style";
import IndexHeader from "@/components/header/index-header";
import NoBudgetSet from "@/components/noBudgetSet";
import ProfileModal from "@/components/profile/profile-modal";
import { checkForUpdates } from "@/components/version/updateChecker";
import { getMonthBudget } from "@/services/budget";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MonthlyBudget } from "../types/budget";

export default function Index() {
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);
  const [monthBudget, setMonthBudget] = useState<MonthlyBudget | null>(null);
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
        console.log("Auth state changed:", event);
        if (session?.user) {
          setUser(session.user);
        } else {
          router.replace("/login");
          setUser(null);
        }
        setIsLoadingUser(false);
      }
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

  const loadMonthData = async () => {
    try {
      setIsBudgetLoading(true);
      const res = await await getMonthBudget(
        selectedDate.getMonth() + 1,
        selectedDate.getFullYear()
      );
      // console.log("Loaded month budget:", res);
      setMonthBudget(res);
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
    if (!monthBudget) return 0;
    return monthBudget.totalBudget - monthBudget.totalSpent;
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

  // if (isSetupComplete || 1) {
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
        {!monthBudget || monthBudget?.categories.length === 0 ? (
          <NoBudgetSet selectedDate={selectedDate} />
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Monthly Overview</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Budget</Text>
                  <Text style={styles.summaryAmount}>
                    ₹{monthBudget.totalBudget.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Spent</Text>
                  <Text style={[styles.summaryAmount, styles.spentAmount]}>
                    ₹{monthBudget.totalSpent.toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.remainingSection}>
                <Text style={styles.remainingLabel}>Remaining</Text>
                <Text
                  style={[
                    styles.remainingAmount,
                    {
                      color: getRemainingAmount() >= 0 ? "#28a745" : "#ff4444",
                    },
                  ]}
                >
                  ₹{Math.abs(getRemainingAmount()).toLocaleString()}
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
                    ).toString()}&year=${selectedDate.getFullYear()}`
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
              {monthBudget?.categories.map((category) => {
                // const spent = getCategorySpent(category.id as string);
                const spent = category.spent || 0;
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
                        `/expense-history?month=${month}&year=${year}&categoryId=${category.id}`
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
              <TouchableOpacity
                style={styles.editBudgetButton}
                onPress={() => {
                  router.push(
                    `/set-budget?selected_date=${selectedDate.toISOString()}`
                  );
                }}
              >
                <Ionicons name="settings" size={20} color="#007AFF" />
                <Text style={styles.editBudgetText}>Edit Budget</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {isCurrentMonth() && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            const month = (selectedDate.getMonth() + 1).toString();
            const year = selectedDate.getFullYear().toString();
            router.push(`/add-expense?month=${month}&year=${year}`);
            // router.push(
            //   `/set-budget?selectedDate=${selectedDate.toISOString()}`
            // );
          }}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
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
