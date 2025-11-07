import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  // useEffect(() => {
  //   const handleDeepLink = async (event: any) => {
  //     const url = event.url;
  //     // const { data, error } = await supabase.auth.getSessionFromUrl({ url });
  //     // if (error) console.error("Supabase Session Error:", error);
  //     console.log("url", url);
  //   };

  //   const subscription = Linking.addEventListener("url", handleDeepLink);

  //   return () => subscription.remove();
  // }, []);
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
          name="add-expense"
          options={{
            title: "Add Expense",
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}
