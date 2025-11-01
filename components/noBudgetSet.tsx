import { styles } from "@/assets/styles/index.style";
import { getMonthYearString } from "@/utils/utility";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NoBudgetSetProps {
  selectedDate: Date;
}

const NoBudgetSet: React.FC<NoBudgetSetProps> = ({ selectedDate }) => {
  const [isPastMonth, setIsPastMonth] = useState(false);
  const [isCurrentMonth, setIsCurrentMonth] = useState(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const displayYear = selectedDate.getFullYear();
    const displayMonth = selectedDate.getMonth() + 1;

    const isCurrentMonth =
      displayYear === currentYear && displayMonth === currentMonth;
    const isPastMonth =
      displayYear < currentYear ||
      (displayYear === currentYear && displayMonth < currentMonth);
    setIsCurrentMonth(isCurrentMonth);
    setIsPastMonth(isPastMonth);
  }, [selectedDate]);

  return (
    <>
      <View style={styles.noDataContainer}>
        <Ionicons name="calendar-outline" size={60} color="#ccc" />
        <Text style={styles.noDataTitle}>No Budget Set</Text>
        <Text style={styles.noDataText}>
          {(() => {
            if (isCurrentMonth) {
              return "No budget set for this month. Tap 'Set Budget' to get started with your budget planning.";
            } else if (isPastMonth) {
              return `No budget was set for ${getMonthYearString(
                selectedDate
              )}. Past months without budget setup show zero spending limits.`;
            } else {
              return `No budget set for ${getMonthYearString(
                selectedDate
              )} yet. You can set up a budget for future months.`;
            }
          })()}
        </Text>
      </View>
      {!isPastMonth && (
        <View style={styles.content}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/set-budget")}
            >
              <Text style={styles.primaryButtonText}>Set Up Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/learn-more")}
            >
              <Text style={styles.secondaryButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

export default NoBudgetSet;
