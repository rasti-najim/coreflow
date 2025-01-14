import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";

export default function Page() {
  const safeArea = useSafeAreaInsets();

  const handleManageSubscription = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Add subscription cancellation logic here
    Linking.openURL("itms-apps://apps.apple.com/account/subscriptions");
  };

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <Text style={styles.title}>subscription</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleManageSubscription}
        >
          <Text style={styles.menuText}>Manage Subscription</Text>
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
    fontFamily: "matolha-regular",
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
