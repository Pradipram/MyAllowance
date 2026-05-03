import { styles } from "@/assets/styles/add-expense.style";
import {
  addExpenseCategory,
  fetchExpenseCategories,
} from "@/services/expense-category";
import { addIncomeSource, fetchIncomeSources } from "@/services/income-source";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddNewCategoryForm from "./add-new-category-form";

interface CategoryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string, categoryName: string) => void;
  type?: "expense" | "income";
}

interface CategoryItem {
  id: string;
  name: string;
  lastUsed?: string;
}

const CategoryBottomSheet: React.FC<CategoryBottomSheetProps> = ({
  visible,
  onClose,
  selectedCategoryId,
  onSelectCategory,
  type = "expense",
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);

  // Load categories when bottom sheet is opened
  React.useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res =
        type === "expense"
          ? await fetchExpenseCategories()
          : await fetchIncomeSources();
      if (res && res.length > 0) {
        const mapped: CategoryItem[] = res.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        }));
        setCategories(mapped);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Get recently added categories (last 10)
  const recentCategories = useMemo(() => {
    return categories.slice(0, 10);
  }, [categories]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return recentCategories;
    }
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, categories, recentCategories]);

  const handleAddNewCategory = async (categoryName: string) => {
    setLoading(true);
    const result =
      type === "expense"
        ? await addExpenseCategory(categoryName)
        : await addIncomeSource(categoryName);
    setLoading(false);

    if (result.success && result.data) {
      onSelectCategory(result.data.id, result.data.name);
      setShowAddNew(false);
      onClose();
    } else {
      Alert.alert("Error", result.error || "Failed to add it");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        style={[
          styles.bottomSheetOverlay,
          { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 },
        ]}
        onPress={onClose}
      />

      {/* Bottom Sheet Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.bottomSheetWrapper}
      >
        <View style={styles.bottomSheetContent}>
          {/* Header */}
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              {type === "expense" ? "Select Category" : "Select Income Source"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {!showAddNew ? (
            <View style={{ flexShrink: 1 }}>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#999"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search category..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Recently Added Categories Label */}
              {!searchQuery && recentCategories.length > 0 && (
                <Text style={styles.sectionLabel}>Recently Added</Text>
              )}

              {/* Categories List */}
              {filteredCategories.length > 0 ? (
                <FlatList
                  data={filteredCategories}
                  keyExtractor={(item) => item.id}
                  style={{ flexShrink: 1 }}
                  contentContainerStyle={{ paddingBottom: 10 }}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.categoryItem,
                        selectedCategoryId === item.id &&
                          styles.categoryItemSelected,
                      ]}
                      onPress={() => {
                        onSelectCategory(item.id, item.name);
                        onClose();
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryItemText,
                          selectedCategoryId === item.id &&
                            styles.categoryItemTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {selectedCategoryId === item.id && (
                        <Ionicons name="checkmark" size={20} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No categories found</Text>
                </View>
              )}

              {/* Add New Button */}
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={() => setShowAddNew(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                <Text style={styles.addNewButtonText}>
                  {type === "expense"
                    ? "Add New Category"
                    : "Add New Income Source"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Add New Category Form */
            <AddNewCategoryForm
              onCancel={() => setShowAddNew(false)}
              onAdd={handleAddNewCategory}
              type={type}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CategoryBottomSheet;
