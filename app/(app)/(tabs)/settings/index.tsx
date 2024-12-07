import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";

export default function Settings() {
  const safeArea = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <Text style={styles.title}>settings</Text>

      <View style={styles.menuContainer}>
        <Link href="/settings/edit-goals" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Edit Goals</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings/routine" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Edit Routine Preferences</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings/subscription" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Subscription</Text>
          </TouchableOpacity>
        </Link>
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
