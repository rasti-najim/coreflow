import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

export default function Page() {
  const safeArea = useSafeAreaInsets();

  const handleCancelSubscription = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Add subscription cancellation logic here
  };

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <Text style={styles.title}>subscription</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleCancelSubscription}
        >
          <Text style={styles.menuText}>Cancel Subscription</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 48,
    fontFamily: "Margin-DEMO",
  },
  menuContainer: {
    gap: 24,
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 32,
  },
});
