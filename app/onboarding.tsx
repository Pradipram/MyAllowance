import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMonthSpecificEdit, setIsMonthSpecificEdit] = useState(false);
  const [showAutoSuggestion, setShowAutoSuggestion] = useState(false);
  const [budgetSuggestions, setBudgetSuggestions] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Helper function to get available months
  const getAvailableMonthsData = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const months = [];

    // Add current month and next 2 months (total 3 months)
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentYear, currentMonth - 1 + i, 1);
      const monthNum = date.getMonth() + 1;
      const yearNum = date.getFullYear();
      const monthName = date.toLocaleString("default", { month: "long" });

      months.push({
        value: `${monthNum}-${yearNum}`,
        label: `${monthName} ${yearNum}`,
        month: monthNum,
        year: yearNum,
      });
    }

    return months;
  };

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

  const getAvailableMonths = () => {
    return getAvailableMonthsData();
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

      // If this is the current month and initial setup, also save as template
      const today = new Date();
      const currentMonth = (today.getMonth() + 1).toString();
      const currentYear = today.getFullYear().toString();

      if (
        selectedMonthNum === currentMonth &&
        selectedYear === currentYear &&
        !isEditMode
      ) {
        await StorageService.saveBudgetCategories(budgetCategories);
        await StorageService.setSetupComplete(true);
      }

      Alert.alert(
        "Success",
        `Your budget for ${getMonthName(
          parseInt(selectedMonthNum)
        )} ${selectedYear} has been ${
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

  const getMonthName = (monthNum: number) => {
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
    return months[monthNum - 1] || "Unknown";
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
          {isEditMode && (
            <View style={styles.navHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={deleteBudget}
              >
                <Ionicons name="trash" size={20} color="#ff4444" />
                <Text style={styles.deleteButtonText}>Delete Budget</Text>
              </TouchableOpacity>
            </View>
          )}
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {selectedMonth
                  ? (() => {
                      const [monthNum, yearNum] = selectedMonth.split("-");
                      return `${
                        isEditMode ? "Edit" : "Set"
                      } Budget for ${getMonthName(
                        parseInt(monthNum)
                      )} ${yearNum}`;
                    })()
                  : isEditMode
                  ? "Edit Your Monthly Budget"
                  : "Set Your Monthly Budget"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {selectedMonth
                  ? (() => {
                      const [monthNum, yearNum] = selectedMonth.split("-");
                      const monthName = getMonthName(parseInt(monthNum));
                      return `${
                        isEditMode ? "Update" : "Create"
                      } your budget categories for ${monthName} ${yearNum}`;
                    })()
                  : `${
                      isEditMode ? "Update" : "Create"
                    } your budget categories and amounts`}
              </Text>
            </View>

            {/* Month Selector */}
            <View style={styles.monthSelectorContainer}>
              <Text style={styles.monthSelectorLabel}>Select Month:</Text>
              <TouchableOpacity
                style={styles.monthSelectorButton}
                onPress={() => setShowMonthSelector(true)}
              >
                <Text style={styles.monthSelectorText}>
                  {selectedMonth
                    ? getAvailableMonths().find(
                        (m) => m.value === selectedMonth
                      )?.label || "Select Month"
                    : "Select Month"}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categoriesContainer}>
              {categories.map((category, index) => (
                <View key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryNumber}>#{index + 1}</Text>
                    {categories.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeCategory(category.id)}
                        style={styles.removeButton}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#ff4444"
                        />
                      </TouchableOpacity>
                    )}
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
              <Text style={styles.saveButtonText}>
                {isEditMode ? "Update Budget" : "Save & Continue"}
              </Text>
            </TouchableOpacity>

            {isEditMode && (
              <TouchableOpacity
                style={styles.footerDeleteButton}
                onPress={deleteBudget}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
                <Text style={styles.footerDeleteButtonText}>
                  Delete Entire Budget
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* Month Selector Modal */}
      <Modal
        visible={showMonthSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMonthSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthSelector(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              You can only set budgets for the current month and next 2 months
            </Text>

            <View style={styles.monthOptions}>
              {getAvailableMonths().map((monthOption, index) => (
                <TouchableOpacity
                  key={monthOption.value}
                  style={[
                    styles.monthOption,
                    selectedMonth === monthOption.value &&
                      styles.monthOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedMonth(monthOption.value);
                    setShowMonthSelector(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      selectedMonth === monthOption.value &&
                        styles.monthOptionTextSelected,
                    ]}
                  >
                    {monthOption.label}
                  </Text>
                  {index === 0 && (
                    <Text style={styles.currentMonthBadge}>Current</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#ffffff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff4444",
    marginLeft: 6,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  removeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 8,
  },
  totalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footerDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff5f5",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  footerDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff4444",
    marginLeft: 8,
  },
  monthSelectorContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  monthSelectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  monthSelectorButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthSelectorText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  modalCloseButton: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  monthOptions: {
    gap: 12,
  },
  monthOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#f8f9fa",
  },
  monthOptionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  monthOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  monthOptionTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  currentMonthBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#28a745",
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
