import { styles } from "@/assets/styles/set-budget.style";
import Header from "@/components/header/header";
import MonthSelector from "@/components/modal/month-selector";
import { deleteMonthlyBudget } from "@/services/budget";
import {
  getMonthlyRecords,
  saveMonthlyRecord,
} from "@/services/monthly_records";
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
import { MonthlyRecord } from "../types/types";

export default function OnboardingScreen() {
  const params = useLocalSearchParams();
  const [record, setRecord] = useState<MonthlyRecord | null>(null);
  const [isMonthlyRecordLoading, setIsMonthlyRecordLoading] = useState(false);

  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(() => {
    if (params.selected_date && typeof params.selected_date === "string") {
      const date = new Date(params.selected_date);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });

  const activeUIFor =
    params.for && typeof params.for === "string" ? params.for : "budget";

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
      setIsMonthlyRecordLoading(true);
      // const res = await getMonthBudget(
      //   selectedMonthDate.getMonth() + 1,
      //   selectedMonthDate.getFullYear(),
      // );
      const res = await getMonthlyRecords(
        selectedMonthDate.getMonth() + 1,
        selectedMonthDate.getFullYear(),
      );
      if (res) {
        setRecord({
          ...res,
          // Guard: if the record exists but has no categories yet, seed one blank row
          budget_categories:
            res.budget_categories && res.budget_categories.length > 0
              ? res.budget_categories.map((cat: any) => ({
                  ...cat,
                  // Fallback: old rows have 'amount' populated but 'budget' null
                  budget: cat.budget ?? cat.amount ?? 0,
                }))
              : [{ name: "", budget: 0, spent: 0, index: 0 }],
        });
      } else {
        setRecord({
          id: "",
          user_id: "",
          month: selectedMonthDate.getMonth() + 1,
          year: selectedMonthDate.getFullYear(),
          total_budget: 0,
          total_income: 0,
          total_spent: 0,
          budget_categories: [{ name: "", budget: 0, spent: 0, index: 0 }],
          income_sources: [],
        });
      }
    } catch (error) {
      console.error("Error loading month budget:", error);
    } finally {
      setIsMonthlyRecordLoading(false);
    }
  };

  const removeCategory = (name: string) => {
    const categories = record?.budget_categories || [];
    if (categories.length > 1) {
      setRecord({
        ...record!,
        budget_categories: categories.filter((cat) => cat.name !== name),
      });
    }
  };

  const addCategory = () => {
    const categories = record?.budget_categories || [];
    setRecord({
      ...record!,
      budget_categories: [
        ...categories,
        {
          id: undefined,
          name: "",
          budget: 0,
          spent: 0,
          index: categories.length,
        },
      ],
    });
  };

  const updateCategory = (
    index: number,
    field: "name" | "budget",
    value: string,
  ) => {
    const categories = record?.budget_categories || [];
    setRecord({
      ...record!,
      budget_categories: categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat,
      ),
    });
  };

  const validateAndSave = async () => {
    const validCategories = record?.budget_categories.filter(
      (cat) =>
        cat.name.trim() !== "" &&
        cat.budget !== 0 &&
        !isNaN(Number(cat.budget)) &&
        Number(cat.budget) > 0,
    );

    if (validCategories?.length === 0) {
      Alert.alert(
        "Error",
        "Please add at least one valid category with a name and budget amount.",
      );
      return;
    }

    if (!selectedMonthDate) {
      Alert.alert("Error", "Please select a month for your budget.");
      return;
    }

    try {
      setIsSavingBudget(true);

      const budgetCategories = (validCategories || []).map((cat) => ({
        id: cat.id,
        name: cat.name.trim(),
        budget: Number(cat.budget),
        index: cat.index,
      }));

      const totalBudget = budgetCategories.reduce(
        (sum, cat) => sum + cat.budget,
        0,
      );

      await saveMonthlyRecord(
        selectedMonthDate.getMonth() + 1,
        selectedMonthDate.getFullYear(),
        budgetCategories,
        totalBudget,
      );

      // console.log("Save Response:", res);
      Alert.alert(
        "Success",
        `Your budget for ${getMonthYearString(
          selectedMonthDate,
        )} has been updated successfully!`,
        [{ text: "OK", onPress: () => router.replace("/") }],
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
      record?.budget_categories.reduce((total, cat) => {
        const amount = Number(cat.budget) || 0;
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
      ],
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
              const res = await deleteMonthlyBudget(
                record?.month!,
                record?.year!,
              );
              console.log("Delete Response:", res);
              router.replace("/");
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete budget. Please try again.");
      console.error("Delete error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isMonthlyRecordLoading ? (
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
                selectedMonthDate,
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
              {record?.budget_categories.map((category, index) => (
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
                        value={Number(category.budget).toString()}
                        onChangeText={(text) =>
                          updateCategory(index, "budget", text)
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
