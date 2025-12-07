import { styles } from "@/assets/styles/auth/callback.style";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );

  useEffect(() => {
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async () => {
    try {
      // Get the current session to check if email was verified
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        setStatus("error");
        Alert.alert(
          "Verification Error",
          "Failed to verify your email. Please try again or contact support.",
          [{ text: "OK", onPress: () => router.replace("/login" as any) }]
        );
        return;
      }

      if (session) {
        // Email verified successfully
        setStatus("success");
        Alert.alert(
          "Email Verified!",
          "Your email has been verified successfully. You can now sign in.",
          [{ text: "OK", onPress: () => router.replace("/login" as any) }]
        );
      } else {
        // No session found, might be an issue
        setStatus("error");
        Alert.alert(
          "Verification Incomplete",
          "Please check your email and click the verification link again.",
          [{ text: "OK", onPress: () => router.replace("/login" as any) }]
        );
      }
    } catch (e) {
      console.error("Verification error:", e);
      setStatus("error");
      Alert.alert("Error", "An unexpected error occurred.", [
        { text: "OK", onPress: () => router.replace("/login" as any) },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === "verifying" && (
          <>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.title}>Verifying Your Email</Text>
            <Text style={styles.subtitle}>Please wait...</Text>
          </>
        )}

        {status === "success" && (
          <>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>Redirecting you to sign in...</Text>
          </>
        )}

        {status === "error" && (
          <>
            <Text style={styles.errorIcon}>✕</Text>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>
              Please try clicking the link again
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
