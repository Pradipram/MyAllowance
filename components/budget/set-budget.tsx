import { styles } from "@/assets/styles/set-budget.style";
import { deleteMonthlyBudget } from "@/services/budget";
import { saveMonthlyBudgetCategories } from "@/services/monthly_records";
import { MonthlyRecord } from "@/types/types";
import { getMonthYearString } from "@/utils/utility";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { FC, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

interface SetBudgetProps {
  record: MonthlyRecord | null;
  setRecord: React.Dispatch<React.SetStateAction<MonthlyRecord | null>>;
  selectedMonthDate: Date;
}

const SetBudget: FC<SetBudgetProps> = ({
  record,
  setRecord,
  selectedMonthDate,
}) => {
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  useEffect(() => {
    // console.log("record: ", record);
    if (record) {
      // Only update if budget_categories is missing or empty
      if (!record.budget_categories || record.budget_categories.length === 0) {
        setRecord({
          ...record,
          budget_categories: [
            {
              id: "",
              name: "",
              budget: 0,
              index: 0,
              spent: 0,
            },
          ],
        });
      }
    } else {
      // If no record exists, initialize with default structure
      setRecord({
        id: "",
        user_id: "",
        month: selectedMonthDate.getMonth() + 1,
        year: selectedMonthDate.getFullYear(),
        total_budget: 0,
        total_income: 0,
        total_spent: 0,
        budget_categories: [
          {
            id: "",
            name: "",
            budget: 0,
            index: 0,
            spent: 0,
          },
        ],
        income_sources: [],
      });
    }
  }, [record]);

  const removeCategory = (name: string) => {
    const categories = record?.budget_categories || [];
    if (categories.length > 1) {
      setRecord({
        ...record!,
        budget_categories: categories.filter((cat) => cat.name !== name),
      });
    }
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

  const getTotalBudget = () => {
    return (
      record?.budget_categories.reduce((total, cat) => {
        const amount = Number(cat.budget) || 0;
        return total + amount;
      }, 0) || 0
    );
  };

  const validateAndSaveBudget = async () => {
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

      await saveMonthlyBudgetCategories(
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
    <View>
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
                onChangeText={(text) => updateCategory(index, "name", text)}
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
                  onChangeText={(text) => updateCategory(index, "budget", text)}
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={validateAndSaveBudget}
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
    </View>
  );
};

export default SetBudget;
