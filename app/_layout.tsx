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
          name="onboarding"
          options={{
            title: "Setup Budget",
            headerShown: false,
            presentation: "modal",
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
      </Stack>
    </>
  );
}
