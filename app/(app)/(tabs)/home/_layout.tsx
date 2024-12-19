import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="session"
        options={{ presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="track-picture"
        options={{ presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="track-mood"
        options={{ presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="custom"
        options={{ presentation: "fullScreenModal" }}
      />
    </Stack>
  );
}
