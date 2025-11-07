import { styles } from "@/assets/styles/profile-modal.style";
import { supabase } from "@/utils/superbase";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { router } from "expo-router";
import React from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import ProfileIcon from "./profileIcon";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ProfileModal({
  visible,
  onClose,
  user,
}: ProfileModalProps) {
  const [loading, setLoading] = React.useState(false);
  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
              return;
            }
            onClose();
            router.replace("/login");
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>

              {/* Profile Header */}
              <View style={styles.profileHeader}>
                <ProfileIcon fullName={user?.user_metadata.fullName} />
                <Text style={styles.userName}>
                  {user?.user_metadata.fullName || "User"}
                </Text>
                <Text style={styles.userEmail}>{user?.email || "N/A"}</Text>
              </View>

              {/* User Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email || "N/A"}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(user?.created_at)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsSection}>
                {/* <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    onClose();
                    // Navigate to settings or edit profile if you have such a page
                    // router.push("/settings");
                  }}
                >
                  <Ionicons name="settings-outline" size={20} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Settings</Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity> */}

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    onClose();
                    router.push("/learn-more");
                  }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.actionButtonText}>About</Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                disabled={loading}
              >
                <Ionicons name="log-out-outline" size={20} color="#ff4444" />
                <Text style={styles.signOutText}>
                  {loading ? "Signing Out..." : "Sign Out"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
