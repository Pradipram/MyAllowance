import { styles } from "@/assets/styles/set-budget.style";
import { IncomeSourceType } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import React, { FC } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface IncomeSourceTypeModalProps {
  showIncomeSourceTypeModal: boolean;
  setShowIncomeSourceTypeModal: (show: boolean) => void;
  selectedType?: IncomeSourceType;
  onSelectType: (type: IncomeSourceType) => void;
}

const IncomeSourceTypeModal: FC<IncomeSourceTypeModalProps> = ({
  showIncomeSourceTypeModal,
  setShowIncomeSourceTypeModal,
  selectedType,
  onSelectType,
}) => {
  const handleSelectType = (type: IncomeSourceType) => {
    onSelectType(type);
    setShowIncomeSourceTypeModal(false);
  };

  return (
    <Modal
      visible={showIncomeSourceTypeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowIncomeSourceTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Income Source Type</Text>
            <TouchableOpacity
              onPress={() => setShowIncomeSourceTypeModal(false)}
            >
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Choose the type of income source for this entry
          </Text>

          <View style={styles.monthOptions}>
            {Object.values(IncomeSourceType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.monthOption,
                  selectedType === type && styles.monthOptionSelected,
                ]}
                onPress={() => handleSelectType(type)}
              >
                <View>
                  <Text
                    style={[
                      styles.monthOptionText,
                      selectedType === type && styles.monthOptionTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: selectedType === type ? "#007AFF" : "#999",
                      marginTop: 4,
                    }}
                  >
                    {type === IncomeSourceType.ACTIVE
                      ? "Regular income (e.g., Salary)"
                      : "Passive income (e.g., Dividends)"}
                  </Text>
                </View>
                {selectedType === type && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#007AFF"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default IncomeSourceTypeModal;
