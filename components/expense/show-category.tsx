import { styles } from "@/assets/styles/add-expense.style";
import { getMonthBudget } from "@/services/budget";
import { BudgetCategory } from "@/types/budget";
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
  amount: 0,
  spent: 0,
};

const ShowCategory: React.FC<ShowCategoryProps> = ({
  selectedCategoryId,
  onSelectCategory,
  month,
  year,
  from,
}) => {
  const [categories, setCategories] = useState<BudgetCategory[]>([
    defaultCategory,
  ]);
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);

  const loadBudget = useCallback(async () => {
    try {
      console.log("🔄 Loading budget categories for", month, year);
      setIsBudgetLoading(true);
      const res = await getMonthBudget(month, year);
      if (res) {
        setCategories([defaultCategory, ...res.categories]);
      } else {
        setCategories([defaultCategory]);
      }
    } catch (error) {
      console.error("Error loading budget:", error);
      setCategories([defaultCategory]);
    } finally {
      setIsBudgetLoading(false);
      console.log("✅ Finished loading budget categories");
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      loadBudget();
    }, [loadBudget])
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
