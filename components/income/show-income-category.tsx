import { styles } from "@/assets/styles/add-expense.style";
import { getMonthlyRecords } from "@/services/monthly_records";
import { IncomeSource } from "@/types/types";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ShowIncomeCategoryProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string, categoryName: string) => void;
  month: number;
  year: number;
}

const ShowIncomeCategory: React.FC<ShowIncomeCategoryProps> = ({
  selectedCategoryId,
  onSelectCategory,
  month,
  year,
}) => {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadIncomeSources = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getMonthlyRecords(month, year);
      if (res && res.income_sources && res.income_sources.length > 0) {
        setIncomeSources(res.income_sources);
      } else {
        setIncomeSources([]);
      }
    } catch (error) {
      console.error("Error loading income sources:", error);
      setIncomeSources([]);
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      loadIncomeSources();
    }, [loadIncomeSources]),
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading income sources...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.formSection}>
      <Text style={styles.label}>Income Category *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
      >
        {incomeSources.map((source) => (
          <TouchableOpacity
            key={source.id}
            style={[
              styles.categoryChip,
              selectedCategoryId === source.id && styles.categoryChipSelected,
            ]}
            onPress={() => onSelectCategory(source.id, source.name)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategoryId === source.id &&
                  styles.categoryChipTextSelected,
              ]}
            >
              {source.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {!isLoading && incomeSources.length === 0 && (
        <Text style={styles.helperText}>
          No income sources found for this month. Add them from Monthly Setup.
        </Text>
      )}
    </View>
  );
};

export default ShowIncomeCategory;
