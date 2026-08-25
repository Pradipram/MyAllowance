import { updateValuation } from "@/services/portfolio";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface UpdateValuationSheetProps {
  assetId: string;
  currentValue?: number;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateValuationSheet({
  assetId,
  currentValue,
  visible,
  onClose,
  onSuccess,
}: UpdateValuationSheetProps) {
  const [newValueText, setNewValueText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setNewValueText(
        currentValue !== undefined && currentValue !== null
          ? currentValue.toString()
          : "",
      );
    }
  }, [visible, currentValue]);

  const handleSave = async () => {
    if (!assetId) {
      Alert.alert("Error", "Asset ID is missing.");
      return;
    }

    const parsedValue = parseFloat(newValueText);
    if (isNaN(parsedValue) || parsedValue < 0) {
      Alert.alert("Invalid Value", "Please enter a valid valuation amount.");
      return;
    }

    try {
      setLoading(true);
      const response = await updateValuation(assetId, parsedValue);

      if (response.success) {
        onSuccess();
      } else {
        Alert.alert(
          "Update Failed",
          response.error || "Failed to update valuation. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error updating valuation:", error);
      Alert.alert("Error", "An unexpected error occurred while updating valuation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Backdrop overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Sheet Content with Keyboard Avoidance */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheetContent}>
          {/* Sheet Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Update Valuation</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Form Body */}
          <View style={styles.body}>
            {currentValue !== undefined && currentValue !== null && (
              <View style={styles.currentValueBadge}>
                <Text style={styles.currentValueLabel}>Previous Value:</Text>
                <Text style={styles.currentValueAmount}>
                  ₹{currentValue.toLocaleString()}
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>New Market Value *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={newValueText}
                onChangeText={(text) => {
                  if (text === "" || /^\d*\.?\d*$/.test(text)) {
                    setNewValueText(text);
                  }
                }}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                autoFocus
                maxLength={12}
                editable={!loading}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Valuation</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  currentValueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  currentValueLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6c757d",
  },
  currentValueAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#212529",
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
    marginBottom: 24,
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
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ec5fe",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
