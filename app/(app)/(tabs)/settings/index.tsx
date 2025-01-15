import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/components/auth-context";
import * as Haptics from "expo-haptics";
import { FontAwesome6 } from "@expo/vector-icons";
import mixpanel from "@/lib/mixpanel";

export default function Settings() {
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, deleteAccount } = useAuth();

  const handleLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mixpanel.track("Logout");
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              mixpanel.track("Delete Account");
              await deleteAccount();
              // The auth context will handle the redirect to welcome screen
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: safeArea.top + 24 }]}
      showsHorizontalScrollIndicator={false}
    >
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

        <Link href="/settings/reminders" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Reminders</Text>
          </TouchableOpacity>
        </Link>

        <Link
          href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
          asChild
        >
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Terms of Service</Text>
            <FontAwesome6
              name="arrow-up-right-from-square"
              size={16}
              color="#4A2318"
            />
          </TouchableOpacity>
        </Link>

        <Link href="https://barnburnerllc.github.io/CoreFlow/" asChild>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <FontAwesome6
              name="arrow-up-right-from-square"
              size={16}
              color="#4A2318"
            />
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={[styles.legalItem]} onPress={handleLogout}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome6 name="right-from-bracket" size={16} color="#4A2318" />
            <Text style={styles.legalText}>Log Out</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.legalItem]}
          onPress={handleDeleteAccount}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome6 name="trash-can" size={16} color="#FF0000" />
            <Text style={[styles.legalText, { color: "#FF0000" }]}>
              Delete Account
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    // marginBottom: 48,
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
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  legalText: {
    fontSize: 16,
    color: "#4A2318",
  },
});
