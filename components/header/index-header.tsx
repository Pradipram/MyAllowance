import { styles } from "@/assets/styles/index.style";
import { getMonthYearString } from "@/utils/utility";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { Text, TouchableOpacity, View } from "react-native";
import ProfileIcon from "../profile/profileIcon";

interface IndexHeaderProps {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  isCurrentMonth: () => boolean;
  setShowProfileModal: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
}

const IndexHeader = ({
  selectedDate,
  setSelectedDate,
  isCurrentMonth,
  setShowProfileModal,
  user,
}: IndexHeaderProps) => {
  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    const today = new Date();

    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
      setSelectedDate(newDate);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
      setSelectedDate(newDate);
      if (isFutureThreeMonth()) {
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
      }
    }
  };

  const isFutureThreeMonth = () => {
    const today = new Date();
    // const selectedDate = new Date(selectedDate);

    // Calculate the date 3 months from now
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 2);
    // console.log("Three Months Later:", threeMonthsLater);

    // Allow only future months within 3 months range
    // return selectedDate > today && selectedDate <= threeMonthsLater;
    return selectedDate > threeMonthsLater;
  };

  return (
    <View style={styles.header}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => changeMonth("prev")}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text
          style={[
            styles.monthText,
            isCurrentMonth() && styles.currentMonthText,
          ]}
        >
          {getMonthYearString(selectedDate)}
          {isCurrentMonth() && (
            <Text style={styles.currentMonthIndicator}> • Current</Text>
          )}
        </Text>
        <TouchableOpacity
          style={[
            styles.monthArrow,
            isFutureThreeMonth() && styles.disabledArrow,
          ]}
          onPress={() => changeMonth("next")}
          disabled={isFutureThreeMonth()}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isFutureThreeMonth() ? "#ccc" : "#007AFF"}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Icon */}
      <TouchableOpacity
        style={styles.profileIcon}
        onPress={() => setShowProfileModal(true)}
      >
        <ProfileIcon fullName={user?.user_metadata.fullName} size={32} />
      </TouchableOpacity>
    </View>
  );
};

export default IndexHeader;
