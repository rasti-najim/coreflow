import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { Arrow } from "./arrow";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  Easing,
} from "react-native-reanimated";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import supabase from "@/lib/supabase";
import { requestReview } from "@/lib/store-review";

interface RemindersProps {
  onAllow: (pushToken: string) => void;
  onDeny: () => void;
}

export const Reminders = ({ onAllow, onDeny }: RemindersProps) => {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-15, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repetition
      true // Reverse animation
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: "270deg" }],
  }));

  const handleAllow = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // First check if we already have permission
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      // Only proceed if we don't already have permission
      if (existingStatus !== "granted") {
        // Request permission
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          // Handle permission denied
          onDeny();
          return;
        }
      }

      // Get push token
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        throw new Error("Failed to get push token");
      }

      // Success - pass token to parent
      onAllow(token);
    } catch (error) {
      console.error("Error setting up notifications:", error);
      onDeny(); // Fall back to deny on any errors
    }
  };

  const handleDeny = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDeny();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders</Text>
      <Text style={styles.subtitle}>
        We will remind you to flow at the best times for you!
      </Text>

      <View style={styles.notificationContainer}>
        <View style={styles.mockNotification}>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>
              CoreFlow would like to send you notifications
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.dontAllowButton}
              onPress={handleDeny}
            >
              <Text style={styles.dontAllowText}>Don't Allow</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.allowButton} onPress={handleAllow}>
              <Text style={styles.allowText}>✨Allow✨</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={[styles.arrow, animatedStyle]}>
          <Arrow width={60} height={60} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 18,
    // fontWeight: "bold",
    marginBottom: 32,
    textAlign: "left",
  },
  mockNotification: {
    borderWidth: 2,
    // borderColor: "#E5E5E5",
    borderColor: "#4A2318",
    borderRadius: 20,
    width: "100%",
    overflow: "hidden",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  notificationContent: {
    padding: 16,
    paddingBottom: 24,
  },
  notificationTitle: {
    fontSize: 24,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#4A2318",
  },
  dontAllowButton: {
    flex: 1,
    paddingVertical: 12,
    borderRightWidth: 0.5,
    borderRightColor: "#4A2318",
  },
  allowButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#4A2318",
  },
  dontAllowText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "400",
  },
  allowText: {
    fontSize: 18,
    textAlign: "center",
    color: "#FFE9D5",
    fontWeight: "bold",
  },
  notificationContainer: {
    width: "100%",
    position: "relative",
    marginTop: "10%",
  },
  arrow: {
    position: "absolute",
    right: "15%",
    bottom: -80,
  },
});
