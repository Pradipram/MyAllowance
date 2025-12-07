import { styles } from "@/assets/styles/add-expense.style";
import ShowCategory from "@/components/expense/show-category";
import { insertTransaction } from "@/services/transaction";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Transaction } from "../types/budget";

const defaultTransaction: Transaction = {
  // id: "",
  user_id: "",
  category_id: "",
  category_name: "",
  amount: 0,
  description: "",
  date: new Date(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  type: "expense",
  payment_mode: "upi",
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
};

export default function AddExpenseScreen() {
  const { month, year } = useLocalSearchParams();

  const [transaction, setTransaction] =
    useState<Transaction>(defaultTransaction);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);

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

    // loadBudget();
  }, []);

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

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setTransaction({
        ...transaction,
        date: selectedDate,
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
      });
    }
  };

  const handleAddScreenshot = () => {
    // Placeholder for image picker
    Alert.alert(
      "Coming Soon",
      "Screenshot upload feature will be available soon!"
    );
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const validateTransaction = () => {
    if (!transaction.category_id) {
      Alert.alert("Error", "Please select a category.");
      return false;
    }

    if (
      !transaction.amount ||
      isNaN(transaction.amount) ||
      transaction.amount <= 0
    ) {
      Alert.alert("Error", "Please enter a valid amount.");
      return false;
    }

    if (!transaction.payment_mode) {
      Alert.alert("Error", "Please select a payment mode.");
      return false;
    }
    return true;
  };

  const addTransaction = async () => {
    // console.log("Add transaction function called", transaction);
    if (!validateTransaction()) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await insertTransaction(transaction as Transaction);
      // console.log("Transaction added successfully:", res);
      Alert.alert("Success", "Expense added successfully!", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      console.error("Error adding transaction:", error);
      Alert.alert("Error", "Failed to add transaction. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Add New Expense",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <ShowCategory
          selectedCategoryId={transaction.category_id}
          onSelectCategory={(category_id, category_name) =>
            setTransaction({ ...transaction, category_id, category_name })
          }
          month={transaction.month}
          year={transaction.year}
          from="add-expense"
        />

        {/* Amount Input */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={transaction.amount?.toString() || ""}
              onChangeText={(text) =>
                setTransaction({
                  ...transaction,
                  amount: text ? Number(text) : 0,
                })
              }
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
            value={transaction.description || ""}
            onChangeText={(text) =>
              setTransaction({ ...transaction, description: text })
            }
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
            <Text style={styles.dateText}>
              {formatDate(transaction.date || new Date())}
            </Text>
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
                  transaction.payment_mode === mode.id &&
                    styles.paymentModeCardSelected,
                ]}
                onPress={() =>
                  setTransaction({ ...transaction, payment_mode: mode.id })
                }
              >
                <Ionicons
                  name={mode.icon as any}
                  size={24}
                  color={
                    transaction.payment_mode === mode.id ? "#ffffff" : "#007AFF"
                  }
                />
                <Text
                  style={[
                    styles.paymentModeText,
                    transaction.payment_mode === mode.id &&
                      styles.paymentModeTextSelected,
                  ]}
                >
                  {mode.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Screenshots Upload */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Screenshots (Optional)</Text>
          <Text style={styles.helperText}>Add payment receipts or bills</Text>

          {/* Upload Button */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleAddScreenshot}
          >
            <Ionicons name="camera-outline" size={24} color="#007AFF" />
            <Text style={styles.uploadButtonText}>Add Screenshot</Text>
          </TouchableOpacity>

          {/* Screenshots Preview */}
          {screenshots.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.screenshotsContainer}
            >
              {screenshots.map((uri, index) => (
                <View key={index} style={styles.screenshotWrapper}>
                  <Image
                    source={{ uri }}
                    style={styles.screenshotImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveScreenshot(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={addTransaction}
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
          value={transaction.date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}
