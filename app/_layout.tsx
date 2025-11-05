import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "My Allowance",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: "Sign In",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: "Sign Up",
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
          name="onboarding"
          options={{
            title: "Set Budget",
            headerShown: false,
          }}
        /> */}
        <Stack.Screen
          name="set-budget"
          options={{
            title: "Set Budget",
            headerShown: false,
            // presentation: "modal",
          }}
        />
        <Stack.Screen
          name="learn-more"
          options={{
            title: "Learn More",
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="expense-history"
          options={{
            title: "Expense History",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-expense"
          options={{
            title: "Add Expense",
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
