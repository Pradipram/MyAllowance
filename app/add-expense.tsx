import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetCategory, Transaction } from "../types/budget";
import { StorageService } from "../utils/storage";

export default function AddExpenseScreen() {
  const { month, year } = useLocalSearchParams();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("");

  const paymentModes = [
    { id: "cash", name: "Cash", icon: "cash-outline" },
    { id: "card", name: "Card", icon: "card-outline" },
    { id: "upi", name: "UPI", icon: "phone-portrait-outline" },
    { id: "netbanking", name: "Net Banking", icon: "globe-outline" },
    { id: "other", name: "Other", icon: "ellipsis-horizontal-outline" },
  ];

  useEffect(() => {
    // Check if trying to add expense for non-current month
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
          "Expenses can only be added for the current month. You will be redirected to the dashboard.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
        return;
      }
    }

    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const today = new Date();
      const month = (today.getMonth() + 1).toString();
      const year = today.getFullYear();

      // Load current month's budget data
      const monthData = await StorageService.getMonthlyBudgetData(month, year);

      if (monthData) {
        setCategories(monthData.categories);
      } else {
        // Fallback to base categories
        const baseCategories = await StorageService.getBudgetCategories();
        setCategories(baseCategories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("Error", "Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const validateAndSave = async () => {
    // Validation
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category.");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    if (!paymentMode) {
      Alert.alert("Error", "Please select a payment mode.");
      return;
    }

    setIsSaving(true);

    try {
      const expenseAmount = Number(amount);
      const today = new Date();
      const month = (today.getMonth() + 1).toString();
      const year = today.getFullYear();

      // Load current month's data
      let monthData = await StorageService.getMonthlyBudgetData(month, year);

      if (!monthData) {
        // Create new month data from base categories
        const baseCategories = await StorageService.getBudgetCategories();
        monthData = {
          id: `${year}_${month}`,
          month: month,
          year: year,
          categories: baseCategories.map((cat) => ({ ...cat, spent: 0 })),
          totalBudget: baseCategories.reduce((sum, cat) => sum + cat.amount, 0),
          totalSpent: 0,
        };
      }

      // Update the spent amount for the selected category
      const updatedCategories = monthData.categories.map((cat) => {
        if (cat.id === selectedCategory) {
          return { ...cat, spent: (cat.spent || 0) + expenseAmount };
        }
        return cat;
      });

      // Update month data
      const updatedMonthData = {
        ...monthData,
        categories: updatedCategories,
        totalSpent: updatedCategories.reduce(
          (sum, cat) => sum + (cat.spent || 0),
          0
        ),
      };

      // Save updated month data
      await StorageService.saveMonthlyBudgetData(updatedMonthData);

      // Create transaction record (if needed for future features)
      const transaction: Transaction = {
        id: Date.now().toString(),
        categoryId: selectedCategory,
        amount: expenseAmount,
        description: description.trim() || "No description",
        date: date,
        type: "expense",
        paymentMode: paymentMode,
      };

      Alert.alert("Success", "Expense added successfully!", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      console.error("Error saving expense:", error);
      Alert.alert("Error", "Failed to save expense. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Expense</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollView}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id &&
                    styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id &&
                      styles.categoryChipTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Amount Input */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Dinner at Dominos"
            maxLength={100}
            multiline
          />
        </View>

        {/* Date Selection */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Payment Mode Selection */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Payment Mode *</Text>
          <View style={styles.paymentModeGrid}>
            {paymentModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.paymentModeCard,
                  paymentMode === mode.id && styles.paymentModeCardSelected,
                ]}
                onPress={() => setPaymentMode(mode.id)}
              >
                <Ionicons
                  name={mode.icon as any}
                  size={24}
                  color={paymentMode === mode.id ? "#ffffff" : "#007AFF"}
                />
                <Text
                  style={[
                    styles.paymentModeText,
                    paymentMode === mode.id && styles.paymentModeTextSelected,
                  ]}
                >
                  {mode.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={validateAndSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Expense"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
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
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  categoryScrollView: {
    flexDirection: "row",
  },
  categoryChip: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  categoryChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  categoryChipTextSelected: {
    color: "#ffffff",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    paddingVertical: 16,
  },
  descriptionInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1a1a1a",
    minHeight: 50,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 12,
  },
  buttonContainer: {
    marginTop: 40,
    marginBottom: 40,
    gap: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  paymentModeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  paymentModeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    minWidth: 100,
    flex: 1,
  },
  paymentModeCardSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  paymentModeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  paymentModeTextSelected: {
    color: "#ffffff",
  },
});
