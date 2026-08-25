import Header from "@/components/header/header";
import { addAsset } from "@/services/portfolio";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AssetType = "equity" | "mutual_fund" | "other";

interface AssetTypeOption {
  id: AssetType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ASSET_TYPES: AssetTypeOption[] = [
  { id: "equity", label: "Equity", icon: "trending-up-outline" },
  { id: "mutual_fund", label: "Mutual Fund", icon: "pie-chart-outline" },
  { id: "other", label: "Other", icon: "cube-outline" },
];

export default function AddAssetScreen() {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<AssetType>("equity");
  const [investedAmountText, setInvestedAmountText] = useState("");
  const [currentValueText, setCurrentValueText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvestedAmountChange = (text: string) => {
    if (text === "" || /^\d*\.?\d*$/.test(text)) {
      setInvestedAmountText(text);
    }
  };

  const handleCurrentValueChange = (text: string) => {
    if (text === "" || /^\d*\.?\d*$/.test(text)) {
      setCurrentValueText(text);
    }
  };

  const setSameAsInvested = () => {
    if (investedAmountText) {
      setCurrentValueText(investedAmountText);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter an asset name.");
      return false;
    }

    const invested = parseFloat(investedAmountText);
    if (isNaN(invested) || invested < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid invested amount.");
      return false;
    }

    const current = parseFloat(currentValueText);
    if (isNaN(current) || current < 0) {
      Alert.alert("Invalid Valuation", "Please enter a valid current value.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const invested = parseFloat(investedAmountText);
      const current = parseFloat(currentValueText);

      const response = await addAsset(
        name.trim(),
        selectedType,
        invested,
        current,
      );

      if (response.success) {
        router.back();
      } else {
        Alert.alert(
          "Error",
          response.error || "Failed to add asset. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error submitting asset:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while adding the asset.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header heading="Add Asset" subheading="New Portfolio Holding" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Asset Name */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Asset Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Apple Inc., Bitcoin, HDFC Fund"
              placeholderTextColor="#999"
              maxLength={80}
              autoCapitalize="words"
            />
          </View>

          {/* Asset Type Selector */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Asset Type *</Text>
            <View style={styles.typeGrid}>
              {ASSET_TYPES.map((typeOption) => {
                const isSelected = selectedType === typeOption.id;
                return (
                  <TouchableOpacity
                    key={typeOption.id}
                    style={[
                      styles.typeCard,
                      isSelected && styles.typeCardSelected,
                    ]}
                    onPress={() => setSelectedType(typeOption.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={typeOption.icon}
                      size={22}
                      color={isSelected ? "#ffffff" : "#007AFF"}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        isSelected && styles.typeTextSelected,
                      ]}
                    >
                      {typeOption.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Invested Amount */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Invested Amount *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={investedAmountText}
                onChangeText={handleInvestedAmountChange}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                maxLength={12}
              />
            </View>
          </View>

          {/* Current Value */}
          <View style={styles.formSection}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Current Value *</Text>
              {investedAmountText.length > 0 && (
                <TouchableOpacity
                  onPress={setSameAsInvested}
                  style={styles.helperAction}
                >
                  <Text style={styles.helperActionText}>Same as invested</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={currentValueText}
                onChangeText={handleCurrentValueChange}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                maxLength={12}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Add Asset</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  formSection: {
    marginTop: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  helperAction: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  helperActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
  },
  typeGrid: {
    flexDirection: "row",
    gap: 10,
  },
  typeCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  typeCardSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#495057",
    textAlign: "center",
  },
  typeTextSelected: {
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
    paddingVertical: 14,
  },
  buttonContainer: {
    marginTop: 36,
    gap: 14,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ec5fe",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
});
