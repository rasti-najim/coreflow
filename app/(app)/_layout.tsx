import { Text } from "react-native";
import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/components/auth-context";

export default function AppLayout() {
  const { session } = useAuth();

  // if (!session) {
  //   return <Redirect href="/welcome" />;
  // }r

  return <Slot />;
}
