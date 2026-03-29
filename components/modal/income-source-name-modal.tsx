import { styles } from "@/assets/styles/set-budget.style";
import { Ionicons } from "@expo/vector-icons";
import React, { FC, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

interface IncomeSourceNameModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectName: (name: string) => void;
  selectedName?: string;
}

const PREDEFINED_SOURCES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Refund",
  "Other",
];

const IncomeSourceNameModal: FC<IncomeSourceNameModalProps> = ({
  visible,
  onClose,
  onSelectName,
  selectedName,
}) => {
  const [customName, setCustomName] = useState("");
  const [selectedSource, setSelectedSource] = useState(selectedName || "");

  const handleSelectSource = (source: string) => {
    setSelectedSource(source);
    if (source !== "Other") {
      onSelectName(source);
      onClose();
      setCustomName("");
    }
  };

  const handleCustomNameSubmit = () => {
    if (customName.trim()) {
      onSelectName(customName);
      setSelectedSource("");
      setCustomName("");
      onClose();
    }
  };

  const isOtherSelected = selectedSource === "Other";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Income Source</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Choose from predefined sources or add a custom one
          </Text>

          {/* Predefined Sources List */}
          <View style={styles.monthOptions}>
            {PREDEFINED_SOURCES.map((source) => (
              <TouchableOpacity
                key={source}
                style={[
                  styles.monthOption,
                  selectedSource === source && styles.monthOptionSelected,
                ]}
                onPress={() => handleSelectSource(source)}
              >
                <Text
                  style={[
                    styles.monthOptionText,
                    selectedSource === source && styles.monthOptionTextSelected,
                  ]}
                >
                  {source}
                </Text>
                {selectedSource === source && (
                  <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Name Input - Only show if "Other" is selected */}
          {isOtherSelected && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.inputLabel}>Enter Custom Income Source</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Etsy Store, Uber Driving"
                value={customName}
                onChangeText={setCustomName}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.saveButton, { marginTop: 16, marginBottom: 0 }]}
                onPress={handleCustomNameSubmit}
                disabled={!customName.trim()}
              >
                <Text style={styles.saveButtonText}>Add Custom Source</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default IncomeSourceNameModal;
