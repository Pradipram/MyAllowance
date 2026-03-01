import { styles } from "@/assets/styles/add-expense.style";
import { getMonthlyRecords } from "@/services/monthly_records";
import { BudgetCategory } from "@/types/types";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ShowCategoryProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string, categoryName: string) => void;
  month: number;
  year: number;
  from?: "add-expense" | "expense-history";
}

const defaultCategory: BudgetCategory = {
  id: "all",
  name: "All",
  budget: 0,
  spent: 0,
  index: -1,
};

const ShowCategory: React.FC<ShowCategoryProps> = ({
  selectedCategoryId,
  onSelectCategory,
  month,
  year,
  from = "expense-history", // Default to expense-history to maintain existing behavior
}) => {
  const [categories, setCategories] = useState<BudgetCategory[]>(
    from === "add-expense" ? [] : [defaultCategory],
  );
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);

  const loadBudget = useCallback(async () => {
    try {
      setIsBudgetLoading(true);
      const res = await getMonthlyRecords(month, year);
      if (res && res.budget_categories && res.budget_categories.length > 0) {
        const mapped: BudgetCategory[] = res.budget_categories.map(
          (cat: any) => ({
            ...cat,
            budget: cat.budget ?? cat.amount ?? 0,
          }),
        );
        const categoriesToShow =
          from === "add-expense" ? mapped : [defaultCategory, ...mapped];
        setCategories(categoriesToShow);
      } else {
        setCategories(from === "add-expense" ? [] : [defaultCategory]);
      }
    } catch (error) {
      console.error("Error loading budget:", error);
      setCategories(from === "add-expense" ? [] : [defaultCategory]);
    } finally {
      setIsBudgetLoading(false);
    }
  }, [month, year, from]);

  useFocusEffect(
    useCallback(() => {
      loadBudget();
    }, [loadBudget]),
  );

  if (isBudgetLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.formSection}>
      <Text style={styles.label}>Category *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategoryId === category.id && styles.categoryChipSelected,
            ]}
            onPress={() =>
              onSelectCategory(category.id as string, category.name)
            }
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategoryId === category.id &&
                  styles.categoryChipTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ShowCategory;
