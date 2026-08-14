import { styles } from "@/assets/styles/index.style";
import IndexHeader from "@/components/header/index-header";
import CategoryTrendCard from "@/components/expense/category-trend-card";
import IncomeTrendCard from "@/components/income/income-trend-card";
import SavingsTrendCard from "@/components/savings/savings-trend-card";
import ProfileModal from "@/components/profile/profile-modal";
import { checkForUpdates } from "@/components/version/updateChecker";
import { getCategoryTrendData, getCategoryTotalTrendData, CategoryTrendData } from "@/services/category-trend";
import { getIncomeTrendData, getIncomeTotalTrendData, IncomeTrendData } from "@/services/income-trend";
import { getSavingsTrendData, SavingsTrendData } from "@/services/savings-trend";
import { getTransactions } from "@/services/transaction";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
  const [categoryViewMode, setCategoryViewMode] = useState<'spend' | 'income'>('spend');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // ── MoM Trend state (expenses) ──
  const [selectedTrendCategory, setSelectedTrendCategory] = useState<string>('');
  const [categoryTrendData, setCategoryTrendData] = useState<CategoryTrendData | null>(null);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [categoryTotalTrendData, setCategoryTotalTrendData] = useState<CategoryTrendData | null>(null);
  const [isTotalTrendLoading, setIsTotalTrendLoading] = useState(false);

  // ── MoM Trend state (income) ──
  const [selectedTrendSource, setSelectedTrendSource] = useState<string>('');
  const [incomeTrendData, setIncomeTrendData] = useState<IncomeTrendData | null>(null);
  const [isIncomeTrendLoading, setIsIncomeTrendLoading] = useState(false);
  const [incomeTotalTrendData, setIncomeTotalTrendData] = useState<IncomeTrendData | null>(null);
  const [isIncomeTotalTrendLoading, setIsIncomeTotalTrendLoading] = useState(false);

  // ── MoM Trend state (savings) ──
  const [savingsTrendData, setSavingsTrendData] = useState<SavingsTrendData | null>(null);
  const [isSavingsTrendLoading, setIsSavingsTrendLoading] = useState(false);

  const dropdownButtonRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryTrendRef = useRef<View>(null);
  const scrollOffsetRef = useRef<number>(0);

  const categoryViewOptions = [
    { key: 'spend' as const, label: 'Spend Share' },
    { key: 'income' as const, label: 'Income Impact' },
  ];

  const getSelectedLabel = () =>
    categoryViewOptions.find((o) => o.key === categoryViewMode)?.label || '';

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

  // Derive unique expense category names from current transactions
  const expenseCategoryNames = useMemo(() => {
    const names = new Set<string>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => names.add(t.category_name));
    return Array.from(names).sort();
  }, [transactions]);

  // Derive unique income source names from current transactions
  const incomeSourceNames = useMemo(() => {
    const names = new Set<string>();
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => names.add(t.category_name));
    return Array.from(names).sort();
  }, [transactions]);

  // Auto-select first category when category list changes
  useEffect(() => {
    if (expenseCategoryNames.length > 0 && !expenseCategoryNames.includes(selectedTrendCategory)) {
      setSelectedTrendCategory(expenseCategoryNames[0]);
    }
  }, [expenseCategoryNames]);

  // Auto-select first income source when source list changes
  useEffect(() => {
    if (incomeSourceNames.length > 0 && !incomeSourceNames.includes(selectedTrendSource)) {
      setSelectedTrendSource(incomeSourceNames[0]);
    }
  }, [incomeSourceNames]);

  // Fetch trend data when selected category or month changes
  useEffect(() => {
    if (!selectedTrendCategory) {
      setCategoryTrendData(null);
      return;
    }
    const fetchTrend = async () => {
      try {
        setIsTrendLoading(true);
        const data = await getCategoryTrendData(
          selectedDate.getMonth() + 1,
          selectedDate.getFullYear(),
          selectedTrendCategory,
        );
        setCategoryTrendData(data);
      } catch (error) {
        console.error('Error loading category trend:', error);
        setCategoryTrendData(null);
      } finally {
        setIsTrendLoading(false);
      }
    };
    fetchTrend();
  }, [selectedTrendCategory, selectedDate]);

  // Fetch income trend data when selected source or month changes
  useEffect(() => {
    if (!selectedTrendSource) {
      setIncomeTrendData(null);
      return;
    }
    const fetchIncomeTrend = async () => {
      try {
        setIsIncomeTrendLoading(true);
        const data = await getIncomeTrendData(
          selectedDate.getMonth() + 1,
          selectedDate.getFullYear(),
          selectedTrendSource,
        );
        setIncomeTrendData(data);
      } catch (error) {
        console.error('Error loading income trend:', error);
        setIncomeTrendData(null);
      } finally {
        setIsIncomeTrendLoading(false);
      }
    };
    fetchIncomeTrend();
  }, [selectedTrendSource, selectedDate]);

  // Fetch total category trend data (all categories) when month changes
  useEffect(() => {
    if (expenseCategoryNames.length === 0) {
      setCategoryTotalTrendData(null);
      return;
    }
    const fetchTotalTrend = async () => {
      try {
        setIsTotalTrendLoading(true);
        const data = await getCategoryTotalTrendData(
          selectedDate.getMonth() + 1,
          selectedDate.getFullYear(),
        );
        setCategoryTotalTrendData(data);
      } catch (error) {
        console.error('Error loading total category trend:', error);
        setCategoryTotalTrendData(null);
      } finally {
        setIsTotalTrendLoading(false);
      }
    };
    fetchTotalTrend();
  }, [selectedDate, expenseCategoryNames]);

  // Fetch total income trend data (all sources) when month changes
  useEffect(() => {
    if (incomeSourceNames.length === 0) {
      setIncomeTotalTrendData(null);
      return;
    }
    const fetchIncomeTotalTrend = async () => {
      try {
        setIsIncomeTotalTrendLoading(true);
        const data = await getIncomeTotalTrendData(
          selectedDate.getMonth() + 1,
          selectedDate.getFullYear(),
        );
        setIncomeTotalTrendData(data);
      } catch (error) {
        console.error('Error loading total income trend:', error);
        setIncomeTotalTrendData(null);
      } finally {
        setIsIncomeTotalTrendLoading(false);
      }
    };
    fetchIncomeTotalTrend();
  }, [selectedDate, incomeSourceNames]);

  // Fetch savings trend data (surplus/deficit) when month or transactions change
  useEffect(() => {
    if (!user) {
      setSavingsTrendData(null);
      return;
    }
    const fetchSavingsTrend = async () => {
      try {
        setIsSavingsTrendLoading(true);
        const data = await getSavingsTrendData(
          selectedDate.getMonth() + 1,
          selectedDate.getFullYear(),
        );
        setSavingsTrendData(data);
      } catch (error) {
        console.error('Error loading savings trend:', error);
        setSavingsTrendData(null);
      } finally {
        setIsSavingsTrendLoading(false);
      }
    };
    fetchSavingsTrend();
  }, [selectedDate, transactions, user]);

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
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
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
              <View style={styles.summaryTitleRow}>
                <Text style={styles.summaryTitle}>Monthly Summary</Text>
                {expenseCategoryNames.length > 0 && (
                  <TouchableOpacity
                    style={styles.summaryTrendIcon}
                    activeOpacity={0.7}
                    onPress={() => {
                      categoryTrendRef.current?.measureInWindow((_x, cardY) => {
                        (scrollViewRef.current as any)?.measureInWindow(
                          (_sx: number, svY: number) => {
                            // Scroll content position = current offset + (card screen y - scrollview screen y)
                            const targetY = scrollOffsetRef.current + (cardY - svY) - 12;
                            scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
                          }
                        );
                      });
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
                      dropdownButtonRef.current?.measureInWindow((x, y, width, height) => {
                        setDropdownPosition({ top: y + height + 4, right: 20 });
                        setShowCategoryDropdown(true);
                      });
                    }}
                  >
                    <View ref={dropdownButtonRef} collapsable={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
                    <View style={[styles.dropdownMenu, { position: 'absolute', top: dropdownPosition.top, right: dropdownPosition.right }]}>
                      {categoryViewOptions.map((option) => (
                        <TouchableOpacity
                          key={option.key}
                          style={[
                            styles.dropdownOption,
                            categoryViewMode === option.key && styles.dropdownOptionActive,
                          ]}
                          onPress={() => {
                            setCategoryViewMode(option.key);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              categoryViewMode === option.key && styles.dropdownOptionTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                          {categoryViewMode === option.key && (
                            <Ionicons name="checkmark" size={18} color="#007AFF" />
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
                    totalIncome > 0
                      ? (category.amount / totalIncome) * 100
                      : 0;

                  const pct = categoryViewMode === 'spend' ? pctOfExpenses : pctOfIncome;
                  const fillColor = getProgressColor(pct);

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
                        <Text style={[styles.categoryPercentage, { color: fillColor }]}>
                          {pct.toFixed(1)}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* MoM Category Trend Card */}
            {expenseCategoryNames.length > 0 && (
              <View ref={categoryTrendRef} collapsable={false}>
                <CategoryTrendCard
                  categories={expenseCategoryNames}
                  selectedCategory={selectedTrendCategory}
                  onSelectCategory={setSelectedTrendCategory}
                  trendData={categoryTrendData}
                  loading={isTrendLoading}
                  totalTrendData={categoryTotalTrendData}
                  totalLoading={isTotalTrendLoading}
                />
              </View>
            )}

            {/* MoM Income Trend Card */}
            {incomeSourceNames.length > 0 && (
              <IncomeTrendCard
                sources={incomeSourceNames}
                selectedSource={selectedTrendSource}
                onSelectSource={setSelectedTrendSource}
                trendData={incomeTrendData}
                loading={isIncomeTrendLoading}
                totalTrendData={incomeTotalTrendData}
                totalLoading={isIncomeTotalTrendLoading}
              />
            )}

            {/* MoM Savings Trend Card */}
            {transactions.length > 0 && (
              <View style={{ marginBottom: 80 }}>
                <SavingsTrendCard
                  trendData={savingsTrendData}
                  loading={isSavingsTrendLoading}
                />
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
