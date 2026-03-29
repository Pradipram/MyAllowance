import { styles } from "@/assets/styles/set-budget.style";
import SetBudget from "@/components/budget/set-budget";
import Header from "@/components/header/header";
import SetIncomeSource from "@/components/income/set-income-source";
import MonthSelector from "@/components/modal/month-selector";
import { getMonthlyRecords } from "@/services/monthly_records";
import { getMonthYearString } from "@/utils/utility";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MonthlyRecord } from "../types/types";

export default function OnboardingScreen() {
  const params = useLocalSearchParams();
  const [record, setRecord] = useState<MonthlyRecord | null>(null);
  const [isMonthlyRecordLoading, setIsMonthlyRecordLoading] = useState(false);

  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(() => {
    if (params.selected_date && typeof params.selected_date === "string") {
      const date = new Date(params.selected_date);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });

  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const view = params.view || "budget";

  useEffect(() => {
    if (!isNaN(selectedMonthDate.getTime())) {
      loadMonthData();
    }
    // console.log("selectedMonthDate: ", selectedMonthDate);
  }, [selectedMonthDate]);

  const loadMonthData = async () => {
    try {
      setIsMonthlyRecordLoading(true);
      const res = await getMonthlyRecords(
        selectedMonthDate.getMonth() + 1,
        selectedMonthDate.getFullYear(),
      );

      // if (res) {
      //   setRecord(res);
      // }
      setRecord(res);
    } catch (error) {
      console.error("Error loading month budget:", error);
    } finally {
      setIsMonthlyRecordLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isMonthlyRecordLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your budget...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Header
              heading={`set ${view === "budget" ? "budget" : "income"} for ${getMonthYearString(
                selectedMonthDate,
              )}`}
            />

            {/* Month Selector */}
            <View style={styles.monthSelectorContainer}>
              <Text style={styles.monthSelectorLabel}>Select Month:</Text>
              <TouchableOpacity
                style={styles.monthSelectorButton}
                onPress={() => setShowMonthSelector(true)}
              >
                <Text style={styles.monthSelectorText}>
                  {getMonthYearString(selectedMonthDate)}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Categories */}
            {view === "income" ? (
              <SetIncomeSource
                record={record}
                setRecord={setRecord}
                selectedMonthDate={selectedMonthDate}
              />
            ) : (
              <SetBudget
                record={record}
                setRecord={setRecord}
                selectedMonthDate={selectedMonthDate}
              />
            )}
          </ScrollView>
        </>
      )}

      <MonthSelector
        showMonthSelector={showMonthSelector}
        setShowMonthSelector={setShowMonthSelector}
        selectedMonth={selectedMonthDate}
        setSelectedMonth={setSelectedMonthDate}
      />
    </SafeAreaView>
  );
}
