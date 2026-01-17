import { styles } from "@/assets/styles/add-expense.style";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ShowIncomeCategoryProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string, categoryName: string) => void;
}

const incomeCategories = [
  { id: "salary", name: "Salary", icon: "briefcase-outline" },
  { id: "gift", name: "Gift", icon: "gift-outline" },
  { id: "investment", name: "Investment", icon: "trending-up-outline" },
  { id: "refund", name: "Refund", icon: "arrow-undo-outline" },
  { id: "freelance", name: "Freelance", icon: "laptop-outline" },
  { id: "other-income", name: "Other", icon: "cash-outline" },
];

const ShowIncomeCategory: React.FC<ShowIncomeCategoryProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.formSection}>
      <Text style={styles.label}>Income Category *</Text>
      <View style={styles.incomeCategoryGrid}>
        {incomeCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.incomeCategoryCard,
              selectedCategoryId === category.id &&
                styles.incomeCategoryCardSelected,
            ]}
            onPress={() => onSelectCategory(category.id, category.name)}
          >
            <Ionicons
              name={category.icon as any}
              size={24}
              color={selectedCategoryId === category.id ? "#ffffff" : "#34C759"}
            />
            <Text
              style={[
                styles.incomeCategoryText,
                selectedCategoryId === category.id &&
                  styles.incomeCategoryTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ShowIncomeCategory;
