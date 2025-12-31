import { supabase } from "@/utils/supabase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { Alert } from "react-native";

export const handleGoogleoAuth = async (
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
  try {
    // Sign in with Google natively (no browser)
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data?.idToken) {
      throw new Error("No ID token received from Google");
    }

    // Sign in to Supabase with Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: userInfo.data.idToken,
    });

    if (error) throw error;

    // console.log("Google Signup successful:", data);
    Alert.alert("Success", "Signed in with Google successfully!", [
      { text: "OK", onPress: () => router.replace("/" as any) },
    ]);
  } catch (error: any) {
    console.error("Google Signup error:", error);
    if (error.code === "SIGN_IN_CANCELLED") {
      // User cancelled the sign-in flow
      return;
    }
    Alert.alert(
      "Error",
      error.message || "Failed to sign in with Google. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};
