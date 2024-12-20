import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/components/auth-context";
import * as Haptics from "expo-haptics";
import { FontAwesome6 } from "@expo/vector-icons";

export default function Settings() {
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const { signOut, deleteAccount } = useAuth();

  const handleLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

        <TouchableOpacity style={[styles.menuItem]} onPress={handleLogout}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome6 name="right-from-bracket" size={24} color="#4A2318" />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.deleteAccountItem]}
          onPress={handleDeleteAccount}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome6 name="trash-can" size={24} color="#FF0000" />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </View>
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
  logoutText: {
    color: "#4A2318",
    fontSize: 24,
  },
  deleteAccountItem: {
    // marginTop: 24,
  },
  deleteAccountText: {
    color: "#FF0000",
    fontSize: 24,
  },
});
