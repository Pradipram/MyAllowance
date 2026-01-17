import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
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
          name="add-transaction"
          options={{
            title: "Add Transaction",
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}
