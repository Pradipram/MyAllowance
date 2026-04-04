import { IncomeSource } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface IncomeSourcesModalProps {
  visible: boolean;
  onClose: () => void;
  incomeSources: IncomeSource[];
  totalIncome: number;
}

export default function IncomeSourcesModal({
  visible,
  onClose,
  incomeSources,
  totalIncome,
}: IncomeSourcesModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>

              {/* Header */}
              <Text style={styles.modalTitle}>Income Sources</Text>

              {/* Income Sources List */}
              <View style={styles.sourcesList}>
                {incomeSources && incomeSources.length > 0 ? (
                  incomeSources.map((source) => {
                    const earned = source.earned || 0;
                    const percentage =
                      totalIncome > 0
                        ? Math.round((earned / totalIncome) * 100)
                        : 0;

                    return (
                      <View key={source.id} style={styles.sourceItem}>
                        <View style={styles.sourceHeader}>
                          <View style={styles.sourceInfo}>
                            <Text style={styles.sourceName}>{source.name}</Text>
                            <Text style={styles.sourceType}>
                              {source.income_type === "active"
                                ? "Active Income"
                                : "Passive Income"}
                            </Text>
                          </View>
                          <View style={styles.sourceAmountContainer}>
                            <Text style={styles.sourceAmount}>
                              ₹{earned.toLocaleString()}
                            </Text>
                            <Text style={styles.sourcePercentage}>
                              {percentage}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noSourcesText}>
                    No income sources added yet
                  </Text>
                )}
              </View>

              {/* Total Section */}
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Income</Text>
                <Text style={styles.totalAmount}>
                  ₹{totalIncome.toLocaleString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
  },
  sourcesList: {
    marginBottom: 16,
    maxHeight: "60%",
  },
  sourceItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sourceType: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999",
  },
  sourceAmountContainer: {
    alignItems: "flex-end",
  },
  sourceAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1ac8a9",
    marginBottom: 4,
  },
  sourcePercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  noSourcesText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 12,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1ac8a9",
  },
});
