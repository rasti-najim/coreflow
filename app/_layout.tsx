import { AuthProvider } from "@/components/auth-context";
import { Slot } from "expo-router";
import Superwall from "@superwall/react-native-superwall";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PostHogProvider } from "posthog-react-native";

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY) {
      Superwall.configure(process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY);
    }
  }, []);

  return (
    <PostHogProvider apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}>
      <AuthProvider>
        <GestureHandlerRootView>
          <Slot />
        </GestureHandlerRootView>
      </AuthProvider>
    </PostHogProvider>
  );
}
