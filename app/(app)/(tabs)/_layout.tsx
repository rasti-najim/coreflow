import { FontAwesome } from "@expo/vector-icons";
import { Text, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
// import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";

export default function TabLayout() {
  return (
    // <Tabs>
    //   <TabSlot />
    //   <TabList style={styles.navbar}>
    //     <TabTrigger name="home" href="/home">
    //       <FontAwesome name="plus" size={24} color="#4A2318" />
    //     </TabTrigger>
    //     <TabTrigger name="calendar" href="/calendar">
    //       <FontAwesome name="calendar" size={24} color="#4A2318" />
    //     </TabTrigger>
    //     <TabTrigger name="settings" href="/settings">
    //       <FontAwesome name="cog" size={24} color="#4A2318" />
    //     </TabTrigger>
    //   </TabList>
    // </Tabs>

    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#FFE9D5", borderTopWidth: 0 },
        tabBarActiveTintColor: "#4A2318",
      }}
      //   tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="plus" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
});
