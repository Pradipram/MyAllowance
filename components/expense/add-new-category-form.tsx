import { styles } from "@/assets/styles/add-expense.style";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

interface AddNewCategoryFormProps {
  onCancel: () => void;
  onAdd: (categoryName: string) => void;
  type?: "expense" | "income";
}

const AddNewCategoryForm: React.FC<AddNewCategoryFormProps> = ({
  onCancel,
  onAdd,
  type = "expense",
}) => {
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAdd = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }
    onAdd(newCategoryName);
  };

  return (
    <View style={styles.addNewForm}>
      <Text style={styles.addNewTitle}>
        {type === "expense" ? "New Category" : "New Income Source"}
      </Text>
      <TextInput
        style={styles.addNewInput}
        placeholder={
          type === "expense"
            ? "Enter category name"
            : "Enter income source name"
        }
        placeholderTextColor="#999"
        value={newCategoryName}
        onChangeText={setNewCategoryName}
        autoFocus
      />
      <View style={styles.addNewButtonGroup}>
        <TouchableOpacity
          style={[styles.addNewActionButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addNewActionButton, styles.saveButton]}
          onPress={handleAdd}
        >
          <Text style={styles.saveButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddNewCategoryForm;
