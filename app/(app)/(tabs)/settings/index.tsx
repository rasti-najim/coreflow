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
import { usePostHog } from "posthog-react-native";
export default function Settings() {
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, deleteAccount } = useAuth();
  const posthog = usePostHog();

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            posthog.capture("user_logged_out");
            await signOut();
          } catch (error) {
            console.error("Error signing out:", error);
          }
        },
      },
    ]);
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
              posthog.capture("user_deleted_account");
              await deleteAccount();
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
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>settings</Text>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionHeader}>Preferences</Text>
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

        <Link href="/settings/reminders" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Reminders</Text>
          </TouchableOpacity>
        </Link>

        <Text style={styles.sectionHeader}>Legal</Text>
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

        <Text style={styles.sectionHeader}>Account</Text>
        <Link href="/settings/subscription" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Subscription</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={[styles.legalItem]} onPress={handleLogout}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome6 name="right-from-bracket" size={20} color="#4A2318" />
            <Text style={styles.legalText}>Log Out</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.legalItem]}
          onPress={handleDeleteAccount}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome6 name="trash-can" size={20} color="#FF0000" />
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
    fontFamily: "matolha-regular",
  },
  menuContainer: {
    gap: 16,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2318",
    marginTop: 16,
    marginBottom: 8,
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 20,
    color: "#4A2318",
  },
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  legalText: {
    fontSize: 20,
    color: "#4A2318",
  },
});
