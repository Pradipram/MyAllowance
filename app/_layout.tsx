import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "My Allowance",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
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
          name="analysis"
          options={{
            title: "Analysis",
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
        <Stack.Screen
          name="add-asset"
          options={{
            title: "Add Asset",
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
