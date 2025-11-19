import { styles } from "@/assets/styles/expense-history.style";
import Header from "@/components/header/header";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetCategory, Transaction } from "../types/budget";

export default function ExpenseHistoryScreen() {
  const { month, year, category } = useLocalSearchParams<{
    month?: string;
    year?: string;
    category?: string;
  }>();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [preSelectedCategory, setPreSelectedCategory] =
    useState<BudgetCategory | null>(null);

  // useEffect(() => {
  //   loadData();
  // }, [month, year, category]);

  // Set selected category when category parameter is provided
  useEffect(() => {
    if (category && category !== "all") {
      setSelectedCategory(category);
      // Find category details for header
      const categoryDetails = categories.find((cat) => cat.id === category);
      setPreSelectedCategory(categoryDetails || null);
    }
  }, [category, categories]);

  // Refresh data when screen comes into focus
  // useFocusEffect(
  //   useCallback(() => {
  //     loadData();
  //   }, [])
  // );

  // const loadData = async () => {
  //   setIsLoading(true);
  //   try {
  //     // Use passed parameters or default to current date
  //     const targetMonth = month || (new Date().getMonth() + 1).toString();
  //     const targetYear = year ? parseInt(year) : new Date().getFullYear();

  //     // Load transactions for the specified month
  //     const monthTransactions = await StorageService.getMonthTransactions(
  //       targetMonth,
  //       targetYear
  //     );

  //     // Load categories for filtering
  //     const monthData = await StorageService.getMonthlyBudgetData(
  //       targetMonth,
  //       targetYear
  //     );
  //     if (monthData) {
  //       setCategories(monthData.categories);
  //     } else {
  //       const baseCategories = await StorageService.getBudgetCategories();
  //       setCategories(baseCategories);
  //     }

  //     setExpenses(monthTransactions);

  //     // Set the current month display to match the loaded data
  //     const displayDate = new Date(targetYear, parseInt(targetMonth) - 1, 1);
  //     setCurrentMonth(displayDate);
  //   } catch (error) {
  //     console.error("Error loading expense history:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getCategoryById = (categoryId: string): BudgetCategory | undefined => {
    return categories.find((cat) => cat.id === categoryId);
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
    if (selectedCategory === "all") {
      return expenses;
    }
    return expenses.filter(
      (expense) => expense.categoryId === selectedCategory
    );
  };

  const getTotalExpenses = (): number => {
    return getFilteredExpenses().reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  };

  const getMonthYearString = (): string => {
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
    return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  };

  const renderExpenseItem = ({ item }: { item: Transaction }) => {
    const category = getCategoryById(item.categoryId);
    const categoryName = category?.name || "Unknown";
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
            <View style={styles.metaInfo}>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              {item.paymentMode && (
                <>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.paymentModeText}>{item.paymentMode}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryFilter = ({
    item,
  }: {
    item: { id: string; name: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedCategory === item.id && styles.filterChipSelected,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedCategory === item.id && styles.filterChipTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filterCategories = [
    { id: "all", name: "All" },
    ...categories.map((cat) => ({ id: cat.id, name: cat.name })),
  ];

  const filteredExpenses = getFilteredExpenses();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {preSelectedCategory ? (
        <Header
          heading={`${preSelectedCategory.name} Expenses`}
          subheading={getMonthYearString()}
        />
      ) : (
        <Header heading={`Expense History - ${getMonthYearString()}`} />
      )}
      {/* Category Progress (when specific category is selected) */}
      {preSelectedCategory && (
        <View style={styles.categoryProgressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Total Spent</Text>
            <Text style={styles.progressAmount}>
              ₹{getTotalExpenses().toLocaleString()} / ₹
              {preSelectedCategory.amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      (getTotalExpenses() / preSelectedCategory.amount) * 100,
                      100
                    )}%`,
                    backgroundColor:
                      getTotalExpenses() / preSelectedCategory.amount > 0.8
                        ? "#ff4444"
                        : getTotalExpenses() / preSelectedCategory.amount > 0.6
                        ? "#ff9500"
                        : "#28a745",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(
                (getTotalExpenses() / preSelectedCategory.amount) * 100
              )}
              %
            </Text>
          </View>
        </View>
      )}

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              {preSelectedCategory
                ? `${preSelectedCategory.name} Spent`
                : "Total Expenses"}
            </Text>
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

      {/* Category Filter - Only show when no specific category is selected */}
      {/* {!preSelectedCategory && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by Category</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterCategories}
            renderItem={renderCategoryFilter}
            keyExtractor={(item) => item.id}
            style={styles.filterList}
            contentContainerStyle={styles.filterListContent}
          />
        </View>
      )} */}

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <FlatList
          data={filteredExpenses.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          style={styles.expensesList}
          contentContainerStyle={styles.expensesListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={60} color="#ccc" />
          <Text style={styles.emptyStateTitle}>
            {preSelectedCategory
              ? `No ${preSelectedCategory.name} Expenses`
              : selectedCategory === "all"
              ? "No Expenses Yet"
              : "No Expenses in This Category"}
          </Text>
          <Text style={styles.emptyStateText}>
            {preSelectedCategory
              ? `You haven't added any ${preSelectedCategory.name.toLowerCase()} expenses this month. Start tracking your ${preSelectedCategory.name.toLowerCase()} spending!`
              : selectedCategory === "all"
              ? "Start by adding your first expense using the + button"
              : "Try selecting a different category or add expenses to this category"}
          </Text>
        </View>
      )}

      {/* View All Categories button (when specific category is selected) */}
      {preSelectedCategory && (
        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => {
              // Navigate to expense history without category filter
              const currentMonth = (new Date().getMonth() + 1).toString();
              const currentYear = new Date().getFullYear().toString();
              router.push(
                `/expense-history?month=${currentMonth}&year=${currentYear}`
              );
            }}
          >
            <Text style={styles.viewAllButtonText}>View All Categories</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
