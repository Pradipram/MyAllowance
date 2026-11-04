import { Asset } from "@/types/types";
import { updateValuation } from "@/services/portfolio";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface UpdateValuationSheetProps {
  asset: Asset | null;
  visible: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function UpdateValuationSheet({
  asset,
  visible,
  onClose,
}: UpdateValuationSheetProps) {
  const [investedText, setInvestedText] = useState("");
  const [currentText, setCurrentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const successToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (successToastTimer.current) {
        clearTimeout(successToastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (visible && asset) {
      setInvestedText(asset.invested_amount.toString());
      setCurrentText(asset.current_value.toString());
    }
  }, [visible, asset]);

  const invested = Number.parseFloat(investedText) || 0;
  const current = Number.parseFloat(currentText) || 0;
  const gain = current - invested;
  const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;
  const isGain = gain >= 0;

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const handleSave = async () => {
    if (isSaving) return;

    if (!asset) {
      Alert.alert("Error", "Asset is missing.");
      return;
    }

    if (invested <= 0 || current < 0) {
      Alert.alert("Invalid amount", "Please enter valid valuation amounts.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await updateValuation(asset.asset_id, current, invested);

      if (response.success) {
        toastProgress.setValue(0);
        setShowSuccessToast(true);
        Animated.timing(toastProgress, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }).start();
        successToastTimer.current = setTimeout(() => {
          setShowSuccessToast(false);
          onClose();
        }, 1200);
      } else {
        Alert.alert(
          "Update failed",
          response.error || "Failed to update valuation.",
        );
      }
    } catch (error) {
      console.error("Error updating valuation:", error);
      Alert.alert("Update failed", "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.sheetWrapper}
        >
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <View style={styles.handle} />

              <View style={styles.header}>
                <Text style={styles.title}>Update Valuation</Text>
                <TouchableOpacity onPress={onClose} hitSlop={8}>
                  <Ionicons name="close" size={24} color="#8e8e93" />
                </TouchableOpacity>
              </View>

              <View style={styles.identity}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{asset?.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.identityText}>
                  <Text style={styles.assetName}>{asset?.name}</Text>
                  <Text style={styles.assetType}>{asset?.asset_type}</Text>
                </View>
                <Text style={styles.assetId}>Asset ID #{asset?.asset_id.slice(0, 4)}</Text>
              </View>

              <Text style={styles.label}>Valuation date</Text>
              <View style={styles.dateField}>
                <Text style={styles.fieldText}>{formattedDate}</Text>
                <Ionicons name="calendar-outline" size={19} color="#8e8e93" />
              </View>

              <View style={styles.labelRow}>
                <Text style={styles.label}>Invested amount</Text>
                <Text style={styles.previous}>Previously {formatCurrency(asset?.invested_amount ?? 0)}</Text>
              </View>
              <View style={styles.inputField}>
                <Text style={styles.currency}>₹</Text>
                <TextInput
                  value={investedText}
                  onChangeText={setInvestedText}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.labelRow}>
                <Text style={styles.label}>Current value</Text>
                <Text style={styles.previous}>Previously {formatCurrency(asset?.current_value ?? 0)}</Text>
              </View>
              <View style={styles.inputField}>
                <Text style={styles.currency}>₹</Text>
                <TextInput
                  value={currentText}
                  onChangeText={setCurrentText}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  selectTextOnFocus
                />
              </View>

              <View style={[styles.preview, isGain ? styles.previewGain : styles.previewLoss]}>
                <Text style={styles.previewLabel}>{isGain ? "Unrealised gain" : "Unrealised loss"}</Text>
                <Text style={[styles.previewValue, isGain ? styles.gain : styles.loss]}>
                  {isGain ? "+" : "-"}{formatCurrency(Math.abs(gain))} ({isGain ? "+" : "-"}{Math.abs(gainPercent).toFixed(2)}%)
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Save valuation</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
            {showSuccessToast && (
              <View style={styles.successToast}>
                <View style={styles.successToastMessage}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.successToastText}>
                    Valuation updated successfully
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: toastProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheetWrapper: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  sheetContent: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e5ea",
    alignSelf: "center",
    marginBottom: 18,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8fa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#e5e5ea", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontWeight: "700", color: "#555" },
  identityText: { flex: 1, marginLeft: 12 },
  assetName: { fontSize: 15, fontWeight: "600", color: "#111" },
  assetType: { fontSize: 12, color: "#8e8e93", marginTop: 2 },
  assetId: { fontSize: 11, color: "#8e8e93" },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 8 },
  previous: { fontSize: 11, color: "#8e8e93", marginBottom: 8 },
  dateField: { height: 44, borderWidth: 1, borderColor: "#d1d1d6", borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, marginBottom: 24 },
  fieldText: { fontSize: 14, color: "#111" },
  inputField: { height: 48, borderWidth: 1.2, borderColor: "#d1d1d6", borderRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 20 },
  currency: { fontSize: 15, color: "#8e8e93", marginRight: 8 },
  input: { flex: 1, fontSize: 17, fontWeight: "600", color: "#111" },
  preview: { borderRadius: 8, padding: 10, marginBottom: 14 },
  previewGain: { backgroundColor: "#f1faf2" },
  previewLoss: { backgroundColor: "#fff1f0" },
  previewLabel: { fontSize: 11, color: "#666", marginBottom: 2 },
  previewValue: { fontSize: 14, fontWeight: "700" },
  gain: { color: "#228b22" },
  loss: { color: "#d64545" },
  actions: { flexDirection: "row", gap: 10 },
  cancelButton: { flex: 1, height: 44, borderRadius: 9, borderWidth: 1, borderColor: "#d1d1d6", alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#555" },
  saveButton: { flex: 1, height: 44, borderRadius: 9, backgroundColor: "#007aff", alignItems: "center", justifyContent: "center" },
  saveButtonDisabled: { backgroundColor: "#8bbcf5" },
  saveText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  successToast: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 20,
    borderRadius: 9,
    paddingTop: 10,
    backgroundColor: "#228b22",
    overflow: "hidden",
  },
  successToastMessage: {
    minHeight: 34,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  successToastText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#fff",
  },
});
