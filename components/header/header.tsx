import { styles } from "@/assets/styles/expense-history.style";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  heading: string;
  subheading?: string;
}

const Header = ({ heading, subheading }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>
          {heading}
          {/* {preSelectedCategory
            ? `${preSelectedCategory.name} - Expenses`
            : `Expense History - ${getMonthYearString()}`} */}
        </Text>
        {subheading && <Text style={styles.headerSubtitle}>{subheading}</Text>}
      </View>
    </View>
  );
};

export default Header;
