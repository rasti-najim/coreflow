import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-goals" />
      <Stack.Screen name="edit-routine" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
