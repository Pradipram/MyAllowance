import { styles } from "@/assets/styles/index.style";
import IndexHeader from "@/components/header/index-header";
import MonthlySummaryCard from "@/components/monthly-summary/monthly-summary-card";
import ProfileModal from "@/components/profile/profile-modal";
import { checkForUpdates } from "@/components/version/updateChecker";
import { getTransactions } from "@/services/transaction";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Transaction } from "@/types/types";

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [categoryViewMode, setCategoryViewMode] = useState<"spend" | "income">(
    "spend",
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  const dropdownButtonRef = useRef<View>(null);

  const categoryViewOptions = [
    { key: "spend" as const, label: "Spend Share" },
    { key: "income" as const, label: "Income Impact" },
  ];

  const getSelectedLabel = () =>
    categoryViewOptions.find((o) => o.key === categoryViewMode)?.label || "";

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

  const loadMonthData = useCallback(async () => {
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
  }, [selectedDate]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadMonthData();
      }
    }, [user, loadMonthData]),
  );

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
            <MonthlySummaryCard
              selectedMonth={selectedDate.getMonth() + 1}
              selectedYear={selectedDate.getFullYear()}
              getTotalIncome={getTotalIncome}
              getTotalSpent={getTotalSpent}
              getNet={getNet}
              hasTransactions={transactions.length > 0}
            />

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
                <Text style={styles.quickActionText}>History</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Expense Categories */}
            {getExpensesByCategory().length > 0 && (
              <View style={styles.categoriesSection}>
                <View style={styles.categoriesHeader}>
                  <Text style={styles.sectionTitle}>Categories</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      dropdownButtonRef.current?.measureInWindow(
                        (x, y, width, height) => {
                          setDropdownPosition({
                            top: y + height + 4,
                            right: 20,
                          });
                          setShowCategoryDropdown(true);
                        },
                      );
                    }}
                  >
                    <View
                      ref={dropdownButtonRef}
                      collapsable={false}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {getSelectedLabel()}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="#007AFF" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Dropdown Modal */}
                <Modal
                  visible={showCategoryDropdown}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowCategoryDropdown(false)}
                >
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCategoryDropdown(false)}
                  >
                    <View
                      style={[
                        styles.dropdownMenu,
                        {
                          position: "absolute",
                          top: dropdownPosition.top,
                          right: dropdownPosition.right,
                        },
                      ]}
                    >
                      {categoryViewOptions.map((option) => (
                        <TouchableOpacity
                          key={option.key}
                          style={[
                            styles.dropdownOption,
                            categoryViewMode === option.key &&
                            styles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setCategoryViewMode(option.key);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              categoryViewMode === option.key &&
                              styles.dropdownOptionTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                          {categoryViewMode === option.key && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#007AFF"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>

                {getExpensesByCategory().map((category) => {
                  const totalExpenses = getTotalSpent();
                  const totalIncome = getTotalIncome();
                  const pctOfExpenses =
                    totalExpenses > 0
                      ? (category.amount / totalExpenses) * 100
                      : 0;
                  const pctOfIncome =
                    totalIncome > 0 ? (category.amount / totalIncome) * 100 : 0;

                  const pct =
                    categoryViewMode === "spend" ? pctOfExpenses : pctOfIncome;
                  const fillColor = getProgressColor(pct);

                  return (
                    <TouchableOpacity
                      key={category.name}
                      style={styles.categoryCard}
                      activeOpacity={0.7}
                      onPress={() => {
                        const month = (selectedDate.getMonth() + 1).toString();
                        const year = selectedDate.getFullYear().toString();
                        router.push(
                          `/expense-history?month=${month}&year=${year}&categoryName=${encodeURIComponent(category.name)}`,
                        );
                      }}
                    >
                      {/* Colored fill background */}
                      <View
                        style={[
                          styles.categoryFill,
                          {
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: fillColor,
                          },
                        ]}
                      />
                      <View style={styles.categoryContent}>
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryName}>
                            {category.name}
                          </Text>
                          <Text style={styles.categoryAmount}>
                            ₹{category.amount.toLocaleString()}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.categoryPercentage,
                            { color: fillColor },
                          ]}
                        >
                          {pct.toFixed(1)}%
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
