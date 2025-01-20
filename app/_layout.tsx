import { AuthProvider } from "@/components/auth-context";
import { Slot } from "expo-router";
import Superwall from "@superwall/react-native-superwall";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY) {
      Superwall.configure(process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY);
    }
  }, []);

  return (
    <AuthProvider>
      <GestureHandlerRootView>
        <Slot />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
