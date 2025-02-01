import { FontAwesome6 } from "@expo/vector-icons";
import { Text, StyleSheet } from "react-native";
// import { Tabs } from "expo-router";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FloatingActionButton } from "@/components/floating-action-button";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList style={[styles.navbar, { paddingBottom: insets.bottom + 10 }]}>
        <TabTrigger style={styles.tabTrigger} name="home" href="/home">
          <FontAwesome6 name="house" size={24} color="#4A2318" />
        </TabTrigger>
        <TabTrigger style={styles.tabTrigger} name="timeline" href="/timeline">
          <FontAwesome6 name="calendar" size={24} color="#4A2318" />
        </TabTrigger>
        <TabTrigger style={styles.tabTrigger} name="settings" href="/settings">
          <FontAwesome6 name="gear" size={24} color="#4A2318" />
        </TabTrigger>
        <FloatingActionButton />
      </TabList>
    </Tabs>

    // <Tabs
    //   screenOptions={{
    //     headerShown: false,
    //     tabBarStyle: { backgroundColor: "#FFE9D5", borderTopWidth: 0 },
    //     tabBarActiveTintColor: "#4A2318",
    //   }}
    //   //   tabBar={(props) => <TabBar {...props} />}
    // >
    //   <Tabs.Screen
    //     name="home"
    //     options={{
    //       title: "",
    //       tabBarIcon: ({ color }) => (
    //         // <FontAwesome name="plus" size={24} color={color} />
    //         <FontAwesome6 name="house" size={24} color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="timeline"
    //     options={{
    //       title: "",
    //       tabBarIcon: ({ color }) => (
    //         <FontAwesome6 name="calendar" size={24} color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="settings"
    //     options={{
    //       title: "",
    //       tabBarIcon: ({ color }) => (
    //         <FontAwesome6 name="gear" size={24} color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen name="index" options={{ href: null }} />
    // </Tabs>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFE9D5",
    paddingTop: 10,
    gap: "10%",
  },
  tabTrigger: {
    padding: 10,
  },
});
