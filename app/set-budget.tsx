import { styles } from "@/assets/styles/set-budget.style";
import Header from "@/components/header/header";
import MonthSelector from "@/components/modal/month-selector";
import { getAvailableMonthsData } from "@/utils/utility";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AutoBudgetSuggestion from "../components/AutoBudgetSuggestion";
import { BudgetCategory, MonthlyBudget } from "../types/budget";
import { StorageService } from "../utils/storage";

interface CategoryInput {
  id: string;
  name: string;
  amount: string;
}

export default function OnboardingScreen() {
  const { month, year } = useLocalSearchParams();
  const [categories, setCategories] = useState<CategoryInput[]>([
    { id: "1", name: "", amount: "" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isMonthSpecificEdit, setIsMonthSpecificEdit] = useState(false);
  const [showAutoSuggestion, setShowAutoSuggestion] = useState(false);
  const [budgetSuggestions, setBudgetSuggestions] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  useEffect(() => {
    // Check if trying to edit a month beyond the 3-month limit
    if (month && year) {
      const availableMonths = getAvailableMonthsData();
      const requestedMonth = `${month}-${year}`;
      const isValidMonth = availableMonths.some(
        (m) => m.value === requestedMonth
      );

      if (!isValidMonth) {
        Alert.alert(
          "Access Restricted",
          "Budget editing is only allowed for the current month and next 2 months. You will be redirected to the dashboard.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
        return;
      }
    }

    loadExistingCategories();
    initializeSelectedMonth();
  }, []);

  const initializeSelectedMonth = () => {
    // Initialize with current month if no specific month is provided
    if (!month || !year) {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      setSelectedMonth(`${currentMonth}-${currentYear}`);
    } else {
      setSelectedMonth(`${month}-${year}`);
    }
  };

  const loadExistingCategories = async () => {
    try {
      const setupComplete = await StorageService.isSetupComplete();

      if (setupComplete) {
        // Check if we're editing a specific month
        if (month && year) {
          setIsMonthSpecificEdit(true); // Always set to true when month/year provided
          // Load month-specific data first
          const monthData = await StorageService.getMonthlyBudgetData(
            month as string,
            parseInt(year as string)
          );

          if (monthData) {
            setIsEditMode(true);
            const categoryInputs: CategoryInput[] = monthData.categories.map(
              (cat, index) => ({
                id: (index + 1).toString(),
                name: cat.name,
                amount: cat.amount.toString(),
              })
            );
            setCategories(categoryInputs);
          } else {
            // If no month data exists, load base category names but with empty amounts for new month setup
            const existingCategories =
              await StorageService.getBudgetCategories();
            if (existingCategories.length > 0) {
              setIsEditMode(false); // This is a new month setup, not editing existing
              const categoryInputs: CategoryInput[] = existingCategories.map(
                (cat, index) => ({
                  id: (index + 1).toString(),
                  name: cat.name,
                  amount: "", // Empty amounts for new month
                })
              );
              setCategories(categoryInputs);
            }
          }
        } else {
          // Regular editing mode - load base categories
          const existingCategories = await StorageService.getBudgetCategories();
          if (existingCategories.length > 0) {
            setIsEditMode(true);
            const categoryInputs: CategoryInput[] = existingCategories.map(
              (cat, index) => ({
                id: (index + 1).toString(),
                name: cat.name,
                amount: cat.amount.toString(),
              })
            );
            setCategories(categoryInputs);
          }
        }
      } else {
        // New user setup - check for auto suggestions
        await checkForAutoSuggestions();
      }
    } catch (error) {
      console.error("Error loading existing categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForAutoSuggestions = async () => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const shouldShow = await StorageService.shouldShowAutoSuggestion(
        currentYear,
        currentMonth
      );

      if (shouldShow) {
        // Get suggestions from storage
        const suggestions = await StorageService.generateBudgetSuggestions(
          currentYear,
          currentMonth
        );

        if (suggestions.length > 0) {
          // Calculate spending data for the last 3 months
          const monthlySpending =
            await StorageService.getLastThreeMonthsSpending(
              currentYear,
              currentMonth
            );

          const suggestionData = suggestions.map((category) => {
            const spendingHistory = monthlySpending[category.id] || [];
            const averageSpent =
              spendingHistory.length > 0
                ? Math.round(
                    spendingHistory.reduce((sum, amount) => sum + amount, 0) /
                      spendingHistory.length
                  )
                : 0;

            return {
              category,
              averageSpent,
              suggestedBudget: category.amount,
            };
          });

          setBudgetSuggestions(suggestionData);
          setShowAutoSuggestion(true);
        }
      }
    } catch (error) {
      console.error("Error checking for auto suggestions:", error);
    }
  };

  const addCategory = () => {
    const maxId = Math.max(...categories.map((cat) => parseInt(cat.id) || 0));
    const newId = (maxId + 1).toString();
    setCategories([...categories, { id: newId, name: "", amount: "" }]);
  };

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const updateCategory = (
    id: string,
    field: "name" | "amount",
    value: string
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    );
  };

  const validateAndSave = async () => {
    const validCategories = categories.filter(
      (cat) =>
        cat.name.trim() !== "" &&
        cat.amount.trim() !== "" &&
        !isNaN(Number(cat.amount)) &&
        Number(cat.amount) > 0
    );

    if (validCategories.length === 0) {
      Alert.alert(
        "Error",
        "Please add at least one valid category with a name and budget amount."
      );
      return;
    }

    if (!selectedMonth) {
      Alert.alert("Error", "Please select a month for your budget.");
      return;
    }

    try {
      // Convert to proper BudgetCategory format
      const budgetCategories: BudgetCategory[] = validCategories.map((cat) => ({
        id: cat.id,
        name: cat.name.trim(),
        amount: Number(cat.amount),
        spent: 0,
      }));

      // Parse selected month
      const [selectedMonthNum, selectedYear] = selectedMonth.split("-");

      const totalBudget = budgetCategories.reduce(
        (sum, cat) => sum + cat.amount,
        0
      );
      const monthlyBudget: MonthlyBudget = {
        id: `${selectedYear}_${selectedMonthNum}`,
        month: selectedMonthNum,
        year: parseInt(selectedYear),
        categories: budgetCategories,
        totalBudget: totalBudget,
        totalSpent: 0,
      };

      // Save to the selected month
      await StorageService.saveMonthlyBudgetData(monthlyBudget);

      Alert.alert(
        "Success",
        `Your budget for ${getMonthName()} ${selectedYear} has been ${
          isEditMode ? "updated" : "set up"
        } successfully!`,
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save budget. Please try again.");
      console.error("Save error:", error);
    }
  };

  const getTotalBudget = () => {
    return categories.reduce((total, cat) => {
      const amount = parseFloat(cat.amount) || 0;
      return total + amount;
    }, 0);
  };

  const getMonthName = () => {
    const [monthStr, yearStr] = selectedMonth.split("-");
    const monthNum = parseInt(monthStr, 10);
    const yearNum = parseInt(yearStr, 10);
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
    return months[monthNum - 1] + "-" + yearNum || "Unknown";
  };

  const deleteBudget = () => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete your entire budget? This action cannot be undone and will remove all your categories and budget data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteBudget,
        },
      ]
    );
  };

  const confirmDeleteBudget = async () => {
    try {
      // Clear all budget data
      await StorageService.clearAllData();

      Alert.alert(
        "Budget Deleted",
        "Your budget has been successfully deleted.",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset to initial state
              setCategories([{ id: "1", name: "", amount: "" }]);
              setIsEditMode(false);
              router.replace("/");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete budget. Please try again.");
      console.error("Delete error:", error);
    }
  };

  const handleApplyAllSuggestions = () => {
    // Apply all suggested budgets
    const categoryInputs: CategoryInput[] = budgetSuggestions.map(
      (item, index) => ({
        id: (index + 1).toString(),
        name: item.category.name,
        amount: item.suggestedBudget.toString(),
      })
    );

    setCategories(categoryInputs);
    setShowAutoSuggestion(false);
  };

  const handleCustomizeManually = () => {
    // Close suggestion popup and let user customize manually
    setShowAutoSuggestion(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your budget...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Header heading={`set budget for ${getMonthName()}`} />

            {/* Month Selector */}
            <View style={styles.monthSelectorContainer}>
              <Text style={styles.monthSelectorLabel}>Select Month:</Text>
              <TouchableOpacity
                style={styles.monthSelectorButton}
                onPress={() => setShowMonthSelector(true)}
              >
                <Text style={styles.monthSelectorText}>{getMonthName()}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryNumber}>#{category.id}</Text>
                    <TouchableOpacity
                      onPress={() => removeCategory(category.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Category Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., Food, Transportation, Entertainment"
                      value={category.name}
                      onChangeText={(text) =>
                        updateCategory(category.id, "name", text)
                      }
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Budget Amount</Text>
                    <View style={styles.amountInputContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.amountInput}
                        placeholder="5000"
                        value={category.amount}
                        onChangeText={(text) =>
                          updateCategory(category.id, "amount", text)
                        }
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addCategory}>
              <Ionicons name="add-circle" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>

            {getTotalBudget() > 0 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Monthly Budget</Text>
                <Text style={styles.totalAmount}>
                  ₹{getTotalBudget().toLocaleString()}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={validateAndSave}
            >
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>

            {/* {isEditMode && ( */}
            <TouchableOpacity
              style={styles.footerDeleteButton}
              onPress={deleteBudget}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
              <Text style={styles.footerDeleteButtonText}>Reset Budget</Text>
            </TouchableOpacity>
            {/* )} */}
          </View>
        </>
      )}

      {/* Month Selector Modal */}
      <MonthSelector
        showMonthSelector={showMonthSelector}
        setShowMonthSelector={setShowMonthSelector}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {/* Auto Budget Suggestion Popup */}
      <AutoBudgetSuggestion
        visible={showAutoSuggestion}
        suggestions={budgetSuggestions}
        onApplyAll={handleApplyAllSuggestions}
        onCustomize={handleCustomizeManually}
        onClose={() => setShowAutoSuggestion(false)}
      />
    </SafeAreaView>
  );
}
