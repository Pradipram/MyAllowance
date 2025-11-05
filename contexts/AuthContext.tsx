import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  fullName: string;
  authProvider: "email" | "google";
  isEmailVerified?: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "@myallowance_user",
  AUTH_TOKEN: "@myallowance_auth_token",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const authToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (userData && authToken) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User, token: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error("Error saving user to storage:", error);
      throw error;
    }
  };

  const clearUserFromStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.AUTH_TOKEN,
      ]);
    } catch (error) {
      console.error("Error clearing user from storage:", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // For now, simulate authentication
      const mockUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        fullName: "Demo User",
        authProvider: "email",
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };

      const mockToken = "mock_auth_token_" + Date.now();

      await saveUserToStorage(mockUser, mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error("Sign in error:", error);
      throw new Error(
        "Failed to sign in. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      console.log("Signing up user:", fullName, email, password);
      setIsLoading(true);

      // TODO: Replace with actual API call
      // For now, simulate user creation
      const mockUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        fullName: fullName.trim(),
        authProvider: "email",
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
      };

      const mockToken = "mock_auth_token_" + Date.now();

      // Simulate email verification requirement
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await saveUserToStorage(mockUser, mockToken);

      // Don't set user immediately for email signup - require verification
      throw new Error("VERIFICATION_REQUIRED");
    } catch (error) {
      if (error instanceof Error && error.message === "VERIFICATION_REQUIRED") {
        throw error;
      }
      console.error("Sign up error:", error);
      throw new Error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);

      // TODO: Implement Google Sign-In
      // For now, simulate Google authentication
      const mockUser: User = {
        id: "google_" + Date.now().toString(),
        email: "demo@gmail.com",
        fullName: "Google Demo User",
        authProvider: "google",
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };

      const mockToken = "google_auth_token_" + Date.now();

      await saveUserToStorage(mockUser, mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error("Google sign in error:", error);
      throw new Error("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await clearUserFromStorage();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw new Error("Failed to sign out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // TODO: Implement password reset
      console.log("Password reset requested for:", email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Password reset error:", error);
      throw new Error("Failed to send password reset email. Please try again.");
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth service functions for direct usage
export const AuthService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const authToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (userData && authToken) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const authToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!authToken;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  },
};
