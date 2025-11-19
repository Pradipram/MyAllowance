import { styles } from "@/assets/styles/set-budget.style";
import { getAvailableMonthsData, getMonthYearString } from "@/utils/utility";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface MonthSelectorProps {
  showMonthSelector: boolean;
  setShowMonthSelector: (show: boolean) => void;
  selectedMonth: Date;
  setSelectedMonth: (month: Date) => void;
}

const MonthSelector = ({
  showMonthSelector,
  setShowMonthSelector,
  selectedMonth,
  setSelectedMonth,
}: MonthSelectorProps) => {
  return (
    <Modal
      visible={showMonthSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMonthSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <TouchableOpacity onPress={() => setShowMonthSelector(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            You can only set budgets for the current month and next 2 months
          </Text>

          <View style={styles.monthOptions}>
            {getAvailableMonthsData().map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthOption,
                  selectedMonth.getFullYear() === date.getFullYear() &&
                    selectedMonth.getMonth() === date.getMonth() &&
                    styles.monthOptionSelected,
                ]}
                onPress={() => {
                  setSelectedMonth(date);
                  setShowMonthSelector(false);
                }}
              >
                <Text
                  style={[
                    styles.monthOptionText,
                    selectedMonth.getFullYear() === date.getFullYear() &&
                      selectedMonth.getMonth() === date.getMonth() &&
                      styles.monthOptionTextSelected,
                  ]}
                >
                  {getMonthYearString(date)}
                </Text>
                {index === 0 && (
                  <Text style={styles.currentMonthBadge}>Current</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MonthSelector;
