import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

  useEffect(() => {
    // Check if trying to edit a non-current month
    if (month && year) {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      if (
        parseInt(month as string) !== currentMonth ||
        parseInt(year as string) !== currentYear
      ) {
        Alert.alert(
          "Access Restricted",
          "Budget editing is only allowed for the current month. You will be redirected to the dashboard.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
        return;
      }
    }

    loadExistingCategories();
  }, []);

  const loadExistingCategories = async () => {
    try {
      const setupComplete = await StorageService.isSetupComplete();

      if (setupComplete) {
        // Check if we're editing a specific month
        if (month && year) {
          setIsMonthSpecificEdit(true);
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
            // If no month data, load base categories for this month
            const existingCategories =
              await StorageService.getBudgetCategories();
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
      }
    } catch (error) {
      console.error("Error loading existing categories:", error);
    } finally {
      setIsLoading(false);
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

    try {
      // Convert to proper BudgetCategory format
      const budgetCategories: BudgetCategory[] = validCategories.map((cat) => ({
        id: cat.id,
        name: cat.name.trim(),
        amount: Number(cat.amount),
        spent: 0,
      }));

      if (isMonthSpecificEdit && month && year) {
        // Save to month-specific storage
        const totalBudget = budgetCategories.reduce(
          (sum, cat) => sum + cat.amount,
          0
        );
        const monthlyBudget: MonthlyBudget = {
          id: `${year}_${month}`,
          month: month as string,
          year: parseInt(year as string),
          categories: budgetCategories,
          totalBudget: totalBudget,
          totalSpent: 0,
        };

        await StorageService.saveMonthlyBudgetData(monthlyBudget);

        Alert.alert(
          "Success",
          `Your budget for ${getMonthName(
            parseInt(month as string)
          )} ${year} has been updated successfully!`,
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      } else {
        // Save to base storage (affects all future months)
        await StorageService.saveBudgetCategories(budgetCategories);
        await StorageService.setSetupComplete(true);

        Alert.alert(
          "Success",
          `Your budget has been ${
            isEditMode ? "updated" : "set up"
          } successfully!`,
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      }
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
                {isEditMode
                  ? isMonthSpecificEdit && month && year
                    ? `Edit Budget for ${getMonthName(
                        parseInt(month as string)
                      )} ${year}`
                    : "Edit Your Monthly Budget"
                  : "Set Your Monthly Allowances"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEditMode
                  ? isMonthSpecificEdit && month && year
                    ? `Update your budget categories for ${getMonthName(
                        parseInt(month as string)
                      )} ${year}`
                    : "Update your budget categories and amounts"
                  : "Define your budget categories to start tracking your expenses"}
              </Text>
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
});
