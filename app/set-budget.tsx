import { styles } from "@/assets/styles/set-budget.style";
import Header from "@/components/header/header";
import MonthSelector from "@/components/modal/month-selector";
import {
  deleteMonthlyBudget,
  getMonthBudget,
  saveOrUpdateMonthlyBudget,
} from "@/services/budget";
import { getMonthYearString } from "@/utils/utility";
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
import { BudgetCategory, MonthlyBudget } from "../types/budget";

export default function OnboardingScreen() {
  const params = useLocalSearchParams();
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);

  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(() => {
    if (params.selected_date && typeof params.selected_date === "string") {
      const date = new Date(params.selected_date);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });

  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  useEffect(() => {
    if (!isNaN(selectedMonthDate.getTime())) {
      loadMonthData();
    }
    // console.log("Selected month date:", selectedMonthDate);
  }, [selectedMonthDate]);

  const loadMonthData = async () => {
    try {
      setIsBudgetLoading(true);
      const res = await getMonthBudget(
        selectedMonthDate.getMonth() + 1,
        selectedMonthDate.getFullYear()
      );

      if (res) {
        // Existing budget loaded
        setBudget(res);
        // console.log("Loaded existing budget", res);
      } else {
        // No budget found - initialize with empty category
        setBudget({
          month: selectedMonthDate.getMonth() + 1,
          year: selectedMonthDate.getFullYear(),
          categories: [{ name: "", amount: 0, spent: 0 }],
          totalBudget: 0,
          totalSpent: 0,
        });
      }
    } catch (error) {
      console.error("Error loading month budget:", error);
    } finally {
      setIsBudgetLoading(false);
    }
  };

  const removeCategory = (name: string) => {
    const categories = budget?.categories || [];
    if (categories.length > 1) {
      setBudget({
        ...budget!,
        categories: categories.filter((cat) => cat.name !== name),
      });
    }
  };
  ``;

  const addCategory = () => {
    const categories = budget?.categories || [];
    setBudget({
      ...budget!,
      categories: [
        ...categories,
        { id: undefined, name: "", amount: 0, spent: 0 },
      ],
    });
  };

  const updateCategory = (
    index: number,
    field: "name" | "amount",
    value: string
  ) => {
    const categories = budget?.categories || [];
    setBudget({
      ...budget!,
      categories: categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      ),
    });
  };

  const validateAndSave = async () => {
    const validCategories = budget?.categories.filter(
      (cat) =>
        cat.name.trim() !== "" &&
        cat.amount !== 0 &&
        !isNaN(Number(cat.amount)) &&
        Number(cat.amount) > 0
    );

    if (validCategories?.length === 0) {
      Alert.alert(
        "Error",
        "Please add at least one valid category with a name and budget amount."
      );
      return;
    }

    if (!selectedMonthDate) {
      Alert.alert("Error", "Please select a month for your budget.");
      return;
    }

    try {
      setIsSavingBudget(true);
      // Convert to proper BudgetCategory format
      const budgetCategories: BudgetCategory[] = (validCategories || []).map(
        (cat) => ({
          id: cat.id,
          name: cat.name.trim(),
          amount: Number(cat.amount),
          spent: 0,
        })
      );

      const totalBudget = budgetCategories.reduce(
        (sum, cat) => sum + cat.amount,
        0
      );
      const monthlyBudget: MonthlyBudget = {
        id: budget?.id,
        month: selectedMonthDate.getMonth() + 1,
        year: parseInt(selectedMonthDate.getFullYear().toString()),
        categories: budgetCategories,
        totalBudget: totalBudget,
        totalSpent: 0,
      };

      const res = await saveOrUpdateMonthlyBudget(monthlyBudget);

      console.log("Save Response:", res);
      Alert.alert(
        "Success",
        `Your budget for ${getMonthYearString(
          selectedMonthDate
        )} has been updated successfully!`,
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save budget. Please try again.");
      console.error("Save error:", error);
    } finally {
      setIsSavingBudget(false);
    }
  };

  const getTotalBudget = () => {
    return (
      budget?.categories.reduce((total, cat) => {
        const amount = Number(cat.amount) || 0; // Convert to number!
        return total + amount;
      }, 0) || 0
    );
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

      Alert.alert(
        "Budget Deleted",
        "Your budget has been successfully deleted.",
        [
          {
            text: "OK",
            onPress: async () => {
              const res = await deleteMonthlyBudget(budget?.id!);
              console.log("Delete Response:", res);
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
      {isBudgetLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your budget...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Header
              heading={`set budget for ${getMonthYearString(
                selectedMonthDate
              )}`}
            />

            {/* Month Selector */}
            <View style={styles.monthSelectorContainer}>
              <Text style={styles.monthSelectorLabel}>Select Month:</Text>
              <TouchableOpacity
                style={styles.monthSelectorButton}
                onPress={() => setShowMonthSelector(true)}
              >
                <Text style={styles.monthSelectorText}>
                  {getMonthYearString(selectedMonthDate)}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              {budget?.categories.map((category, index) => (
                <View key={index} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryNumber}>#{index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeCategory(category.name)}
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
                        updateCategory(index, "name", text)
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
                        value={Number(category.amount).toString()}
                        onChangeText={(text) =>
                          updateCategory(index, "amount", text)
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
              disabled={isSavingBudget}
            >
              {isSavingBudget ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <Text style={styles.saveButtonText}>Save & Continue</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerDeleteButton}
              onPress={deleteBudget}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
              <Text style={styles.footerDeleteButtonText}>Reset Budget</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <MonthSelector
        showMonthSelector={showMonthSelector}
        setShowMonthSelector={setShowMonthSelector}
        selectedMonth={selectedMonthDate}
        setSelectedMonth={setSelectedMonthDate}
      />
    </SafeAreaView>
  );
}
