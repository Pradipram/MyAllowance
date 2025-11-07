import { styles } from "@/assets/styles/profileIcon.style";
import { getInitials } from "@/utils/utility";
import React from "react";
import { Text, View } from "react-native";

interface ProfileIconProps {
  fullName?: string;
  size?: number;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ fullName, size }) => {
  if (!size) {
    size = 80;
  }

  return (
    <View style={[styles.avatarContainer, { width: size, height: size }]}>
      <Text style={[styles.avatarText, { fontSize: size / 2 }]}>
        {getInitials(fullName)}
      </Text>
    </View>
  );
};

export default ProfileIcon;
