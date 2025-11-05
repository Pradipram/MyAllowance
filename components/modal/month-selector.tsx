import { styles } from "@/assets/styles/set-budget.style";
import { getAvailableMonthsData } from "@/utils/utility";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface MonthSelectorProps {
  showMonthSelector: boolean;
  setShowMonthSelector: (show: boolean) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
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
            {getAvailableMonthsData().map((monthOption, index) => (
              <TouchableOpacity
                key={monthOption.value}
                style={[
                  styles.monthOption,
                  selectedMonth === monthOption.value &&
                    styles.monthOptionSelected,
                ]}
                onPress={() => {
                  setSelectedMonth(monthOption.value);
                  setShowMonthSelector(false);
                }}
              >
                <Text
                  style={[
                    styles.monthOptionText,
                    selectedMonth === monthOption.value &&
                      styles.monthOptionTextSelected,
                  ]}
                >
                  {monthOption.label}
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
