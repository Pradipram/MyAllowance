import { styles } from "@/assets/styles/set-budget.style";
import { saveMonthlyIncomeSources } from "@/services/monthly_records";
import {
  IncomeSource,
  IncomeSourceFields,
  IncomeSourceType,
  MonthlyRecord,
} from "@/types/types";
import { getMonthYearString } from "@/utils/utility";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { FC, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IncomeSourceTypeModal from "../modal/income-source-type-modal";

interface SetIncomeSourceProps {
  record: MonthlyRecord | null;
  setRecord: React.Dispatch<React.SetStateAction<MonthlyRecord | null>>;
  selectedMonthDate: Date;
}

const SetIncomeSource: FC<SetIncomeSourceProps> = ({
  record,
  setRecord,
  selectedMonthDate,
}) => {
  const [showIncomeSourceTypeModal, setShowIncomeSourceTypeModal] =
    useState(false);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(0);
  const [isSavingIncomeSources, setIsSavingIncomeSources] = useState(false);

  useEffect(() => {
    // console.log("record: ", record);
    if (record) {
      // Only update if income_sources is missing or empty
      if (!record.income_sources || record.income_sources.length === 0) {
        setRecord({
          ...record,
          income_sources: [
            {
              id: "",
              user_id: "",
              name: "",
              income_type: IncomeSourceType.ACTIVE,
              earned: 0,
            },
          ],
        });
      }
    } else {
      // If no record exists, initialize with default structure
      setRecord({
        id: "",
        user_id: "",
        month: selectedMonthDate.getMonth() + 1,
        year: selectedMonthDate.getFullYear(),
        total_budget: 0,
        total_income: 0,
        total_spent: 0,
        budget_categories: [],
        income_sources: [
          {
            id: "",
            user_id: "",
            name: "",
            income_type: IncomeSourceType.ACTIVE,
            earned: 0,
          },
        ],
      });
    }
  }, [record, selectedMonthDate]);

  const removeIncomeSource = (name: string) => {
    const sources = record?.income_sources || [];
    if (sources.length > 1) {
      setRecord({
        ...record!,
        income_sources: sources.filter((src) => src.name !== name),
      });
    }
  };

  const updateIncomeSource = (
    index: number,
    field: IncomeSourceFields,
    value: string | IncomeSourceType,
  ) => {
    const sources = record?.income_sources || [];
    setRecord({
      ...record!,
      income_sources: sources.map((src, i) =>
        i === index ? { ...src, [field]: value } : src,
      ),
    });
  };

  const addIncomeSource = () => {
    const sources = record?.income_sources || [];
    setRecord({
      ...record!,
      income_sources: [
        ...sources,
        {
          id: "",
          user_id: "",
          name: "",
          income_type: IncomeSourceType.ACTIVE,
          earned: 0,
        },
      ],
    });
  };

  const validateAndSaveIncomeSources = async () => {
    const validSources: IncomeSource[] | undefined =
      record?.income_sources.filter((src) => src.name.trim() !== "");

    if (validSources?.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please enter at least one income source name.",
      );
      return;
    }

    if (!selectedMonthDate) {
      Alert.alert("Error", "Please select a month for your budget.");
      return;
    }

    try {
      setIsSavingIncomeSources(true);
      await saveMonthlyIncomeSources(
        selectedMonthDate.getMonth() + 1,
        selectedMonthDate.getFullYear(),
        validSources as IncomeSource[],
      );

      Alert.alert(
        "Success",
        `Your Income Sources for ${getMonthYearString(
          selectedMonthDate,
        )} have been updated successfully!`,
        [{ text: "OK", onPress: () => router.replace("/") }],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save income sources. Please try again.");
      console.error("Error saving income sources:", error);
    } finally {
      setIsSavingIncomeSources(false);
    }
  };

  const deleteIncomeSources = () => {};

  return (
    <SafeAreaView>
      <View style={styles.categoriesContainer}>
        {record?.income_sources.map((source, index) => (
          <View key={index} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryNumber}>#{index + 1}</Text>
              <TouchableOpacity
                onPress={() => removeIncomeSource(source.name)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Income Source Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Salary, Dividends"
                value={source.name}
                onChangeText={(text) =>
                  updateIncomeSource(index, IncomeSourceFields.NAME, text)
                }
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Income Source Type</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedSourceIndex(index);
                  setShowIncomeSourceTypeModal(true);
                }}
                style={styles.IncomeSourceTypeSelector}
              >
                <Text style={styles.monthSelectorText}>
                  {source.income_type || IncomeSourceType.ACTIVE}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Single modal instance outside the loop */}
      <IncomeSourceTypeModal
        showIncomeSourceTypeModal={showIncomeSourceTypeModal}
        setShowIncomeSourceTypeModal={setShowIncomeSourceTypeModal}
        selectedType={record?.income_sources[selectedSourceIndex]?.income_type}
        onSelectType={(type) =>
          updateIncomeSource(selectedSourceIndex, IncomeSourceFields.TYPE, type)
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={addIncomeSource}>
        <Ionicons name="add-circle" size={24} color="#007AFF" />
        <Text style={styles.addButtonText}>Add Income Source</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={validateAndSaveIncomeSources}
          disabled={isSavingIncomeSources}
        >
          {isSavingIncomeSources ? (
            <Text style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerDeleteButton}
          onPress={deleteIncomeSources}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
          <Text style={styles.footerDeleteButtonText}>
            Reset Income Sources
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SetIncomeSource;
