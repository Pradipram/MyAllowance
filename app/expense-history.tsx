import { styles } from "@/assets/styles/expense-history.style";
import ShowCategory from "@/components/expense/show-category";
import Header from "@/components/header/header";
import { deleteTransaction, getTransactions } from "@/services/transaction";
import { getMonthYearStringFromNumbers } from "@/utils/utility";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Transaction } from "../types/types";

export default function ExpenseHistoryScreen() {
  const { month, year, categoryId, categoryName } = useLocalSearchParams<{
    month?: string;
    year?: string;
    categoryId?: string;
    categoryName?: string;
  }>();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isMonthTransactionsLoading, setIsMonthTransactionsLoading] =
    useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMonthTransactions();
    }, []),
  );

  const loadMonthTransactions = async () => {
    setIsMonthTransactionsLoading(true);
    try {
      const transactionsResponse = await getTransactions(
        parseInt(month!),
        parseInt(year!),
      );
      setAllTransactions(transactionsResponse || []);

      // If categoryName was passed (e.g. from dashboard), resolve it to a category_id
      const expensesOnly = (transactionsResponse || []).filter(
        (t: Transaction) => t.type === "expense",
      );
      if (categoryName && !categoryId) {
        const match = expensesOnly.find(
          (t) => t.category_name === categoryName,
        );
        if (match && match.category_id) {
          setSelectedCategoryId(match.category_id);
        }
      }
    } catch (error) {
      console.error("Error loading month transactions:", error);
    } finally {
      setIsMonthTransactionsLoading(false);
    }
  };

  // Split transactions by type
  const expenseTransactions = allTransactions.filter((t) => t.type === "expense");
  const incomeTransactions = allTransactions.filter((t) => t.type === "income");

  const getCategoryIcon = (categoryName: string): string => {
    const iconMap: { [key: string]: string } = {
      Food: "restaurant-outline",
      TA: "car-outline",
      Transport: "car-outline",
      HRA: "home-outline",
      Rent: "home-outline",
      Entertainment: "game-controller-outline",
      Shopping: "bag-outline",
      Healthcare: "medical-outline",
      Education: "book-outline",
      Utilities: "flash-outline",
      Other: "ellipsis-horizontal-outline",
    };

    // Find exact match or partial match
    const exactMatch = iconMap[categoryName];
    if (exactMatch) return exactMatch;

    // Check for partial matches
    for (const key in iconMap) {
      if (
        categoryName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(categoryName.toLowerCase())
      ) {
        return iconMap[key];
      }
    }

    return "cash-outline"; // default icon
  };

  const getIncomeIcon = (sourceName: string): string => {
    const iconMap: { [key: string]: string } = {
      Salary: "wallet-outline",
      Freelance: "laptop-outline",
      Investment: "trending-up-outline",
      Gift: "gift-outline",
      Refund: "return-down-back-outline",
      Other: "ellipsis-horizontal-outline",
    };

    const exactMatch = iconMap[sourceName];
    if (exactMatch) return exactMatch;

    for (const key in iconMap) {
      if (
        sourceName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(sourceName.toLowerCase())
      ) {
        return iconMap[key];
      }
    }

    return "cash-outline";
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const expenseDate = new Date(date);

    if (expenseDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (expenseDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return expenseDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const getFilteredExpenses = (): Transaction[] => {
    if (selectedCategoryId === "all") {
      return expenseTransactions;
    }
    return expenseTransactions.filter(
      (expense) => expense.category_id === selectedCategoryId,
    );
  };

  const getTotalExpenses = (): number => {
    return getFilteredExpenses().reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
  };

  const getTotalIncome = (): number => {
    return incomeTransactions.reduce(
      (sum, income) => sum + income.amount,
      0,
    );
  };

  const handleEditTransaction = (item: Transaction) => {
    // Navigate to add-expense with transaction data
    router.push({
      pathname: "/add-transaction",
      params: {
        isEditing: "true",
        transactionId: item.id,
      },
    });
  };

  const handleDeleteTransaction = (item: Transaction) => {
    const typeLabel = item.type === "income" ? "income" : "expense";
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete this ₹${item.amount.toLocaleString()} ${typeLabel}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(item.id!);
            try {
              const deletedTx = await deleteTransaction(item.id as string);
              Alert.alert("Success", "Transaction deleted successfully");

              setAllTransactions((prev) => prev.filter((t) => t.id !== item.id));
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "Failed to delete transaction");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const renderExpenseItem = ({ item }: { item: Transaction }) => {
    const categoryName = item.category_name || "Unknown";
    const icon = getCategoryIcon(categoryName);

    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseIcon}>
          <Ionicons name={icon as any} size={24} color="#007AFF" />
        </View>

        <View style={styles.expenseDetails}>
          <View style={styles.expenseHeader}>
            <Text style={styles.categoryText}>{categoryName}</Text>
            <Text style={styles.amountText}>
              ₹{item.amount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.expenseInfo}>
            <Text style={styles.descriptionText} numberOfLines={1}>
              {item.description}
            </Text>
            <View style={styles.expenseMetaRow}>
              <View style={styles.metaInfo}>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                {item.payment_mode && (
                  <>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.paymentModeText}>
                      {item.payment_mode}
                    </Text>
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditTransaction(item)}
                  activeOpacity={0.7}
                  disabled={deletingId === item.id}
                >
                  <Ionicons name="create-outline" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTransaction(item)}
                  activeOpacity={0.7}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color="#FF3B30" />
                  ) : (
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderIncomeItem = ({ item }: { item: Transaction }) => {
    const sourceName = item.category_name || "Unknown";
    const icon = getIncomeIcon(sourceName);

    return (
      <View style={styles.expenseItem}>
        <View style={[styles.expenseIcon, styles.incomeIcon]}>
          <Ionicons name={icon as any} size={24} color="#34C759" />
        </View>

        <View style={styles.expenseDetails}>
          <View style={styles.expenseHeader}>
            <Text style={styles.categoryText}>{sourceName}</Text>
            <Text style={styles.incomeAmountText}>
              ₹{item.amount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.expenseInfo}>
            <Text style={styles.descriptionText} numberOfLines={1}>
              {item.description}
            </Text>
            <View style={styles.expenseMetaRow}>
              <View style={styles.metaInfo}>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                {item.payment_mode && (
                  <>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.paymentModeText}>
                      {item.payment_mode}
                    </Text>
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditTransaction(item)}
                  activeOpacity={0.7}
                  disabled={deletingId === item.id}
                >
                  <Ionicons name="create-outline" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTransaction(item)}
                  activeOpacity={0.7}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color="#FF3B30" />
                  ) : (
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isMonthTransactionsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredExpenses = getFilteredExpenses();
  const currentList = activeTab === 'expense' ? filteredExpenses : incomeTransactions;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        heading={`History - ${getMonthYearStringFromNumbers(
          parseInt(month as string),
          parseInt(year as string),
        )}`}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
          onPress={() => setActiveTab('expense')}
        >
          <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'income' && styles.tabActiveIncome]}
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActiveIncome]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              {activeTab === 'expense' ? 'Total Expenses' : 'Total Income'}
            </Text>
            <Text style={[
              styles.summaryAmount,
              activeTab === 'income' && styles.summaryAmountIncome,
            ]}>
              ₹{(activeTab === 'expense' ? getTotalExpenses() : getTotalIncome()).toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryCount}>{currentList.length}</Text>
          </View>
        </View>
      </View>

      {/* Category filter - only for expenses */}
      {activeTab === 'expense' && (
        <View style={{ marginLeft: 30, marginBottom: 10 }}>
          <ShowCategory
            month={parseInt(month as string)}
            year={parseInt(year as string)}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(categoryId, categoryName) => {
              setSelectedCategoryId(categoryId);
            }}
          />
        </View>
      )}

      {/* Transaction List */}
      {currentList.length > 0 ? (
        <FlatList
          data={[...currentList].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )}
          renderItem={activeTab === 'expense' ? renderExpenseItem : renderIncomeItem}
          keyExtractor={(item) => item.id as string}
          style={styles.expensesList}
          contentContainerStyle={styles.expensesListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name={activeTab === 'expense' ? "receipt-outline" : "wallet-outline"}
            size={60}
            color="#ccc"
          />
          <Text style={styles.emptyStateTitle}>
            {activeTab === 'expense'
              ? selectedCategoryId === "all"
                ? "No Expenses Yet"
                : "No Expenses in This Category"
              : "No Income Yet"}
          </Text>
          <Text style={styles.emptyStateText}>
            {activeTab === 'expense'
              ? selectedCategoryId === "all"
                ? "Start by adding your first expense using the - button"
                : "Try selecting a different category or add expenses to this category"
              : "Start by adding your first income using the + button"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
