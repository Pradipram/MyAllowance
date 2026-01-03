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
import { Transaction } from "../types/budget";

export default function ExpenseHistoryScreen() {
  const { month, year, categoryId } = useLocalSearchParams<{
    month?: string;
    year?: string;
    categoryId?: string;
  }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMonthTransactionsLoading, setIsMonthTransactionsLoading] =
    useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // loadData();
      loadMonthTransactions();
    }, [])
  );

  const loadMonthTransactions = async () => {
    setIsMonthTransactionsLoading(true);
    try {
      const transactionsResponse = await getTransactions(
        parseInt(month!),
        parseInt(year!)
      );
      // console.log("Loaded month transactions:", transactionsResponse);
      setTransactions(transactionsResponse || []);
    } catch (error) {
      console.error("Error loading month transactions:", error);
    } finally {
      setIsMonthTransactionsLoading(false);
    }
  };

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
      return transactions;
    }
    return transactions.filter(
      (expense) => expense.category_id === selectedCategoryId
    );
  };

  const getTotalExpenses = (): number => {
    return getFilteredExpenses().reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  };

  const handleEditTransaction = (item: Transaction) => {
    // Navigate to add-expense with transaction data
    router.push({
      pathname: "/add-expense",
      params: {
        isEditing: "true",
        transactionId: item.id,
      },
    });
  };

  const handleDeleteTransaction = (item: Transaction) => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete this ₹${item.amount.toLocaleString()} expense?`,
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

              setTransactions((prev) => prev.filter((t) => t.id !== item.id));

              Alert.alert("Success", "Transaction deleted successfully");
              // console.log("Deleting transaction:", item);
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "Failed to delete transaction");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderExpenseItem = ({ item }: { item: Transaction }) => {
    // const category = getCategoryById(item.categoryId);
    // const categoryName = category?.name || "Unknown";
    const categoryName = item.category_name || "Unknown";
    const icon = getCategoryIcon(categoryName);
    // console.log("Rendering expense item:", item, "with icon:", icon);

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

  if (isMonthTransactionsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredExpenses = getFilteredExpenses();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        heading={`Expense History - ${getMonthYearStringFromNumbers(
          parseInt(month as string),
          parseInt(year as string)
        )}`}
      />

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryAmount}>
              ₹{getTotalExpenses().toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryCount}>{filteredExpenses.length}</Text>
          </View>
        </View>
      </View>

      <View style={{ marginLeft: 30, marginBottom: 10 }}>
        <ShowCategory
          month={parseInt(month as string)}
          year={parseInt(year as string)}
          selectedCategoryId={selectedCategoryId}
          // setIsBudgetLoading={setIsMonthTransactionsLoading}
          onSelectCategory={(categoryId, categoryName) => {
            // console.log("Selected category:", categoryId, categoryName);
            setSelectedCategoryId(categoryId);
          }}
        />
      </View>

      {/* Expenses List */}
      {/* {filteredExpenses.length > 0 ? ( */}
      {filteredExpenses.length > 0 ? (
        <FlatList
          data={filteredExpenses.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id as string}
          style={styles.expensesList}
          contentContainerStyle={styles.expensesListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={60} color="#ccc" />
          <Text style={styles.emptyStateTitle}>
            {selectedCategoryId === "all"
              ? "No Expenses Yet"
              : "No Expenses in This Category"}
          </Text>
          <Text style={styles.emptyStateText}>
            {selectedCategoryId === "all"
              ? "Start by adding your first expense using the + button"
              : "Try selecting a different category or add expenses to this category"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
