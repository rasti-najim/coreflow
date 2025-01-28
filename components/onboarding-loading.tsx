import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Loading } from "./loading";
import { OnboardingData } from "@/app/onboarding";
import { router } from "expo-router";
import supabase from "@/lib/supabase";
import { createSchedule } from "@/lib/schedule";
import * as Haptics from "expo-haptics";
import { DateTime } from "luxon";
import { Toast, ToastProps } from "./toast";
import { decode } from "base64-arraybuffer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePostHog } from "posthog-react-native";
export const OnboardingLoading = ({
  onboardingData,
}: {
  onboardingData: OnboardingData;
}) => {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isLongWait, setIsLongWait] = useState(false);
  const LONG_WAIT_THRESHOLD = 10000; // 10 seconds
  const [longWaitTimer, setLongWaitTimer] = useState<NodeJS.Timeout>();
  const posthog = usePostHog();
  const saveOnboardingData = async (userId: string) => {
    console.log("user id", userId);

    if (
      !onboardingData.routine ||
      !onboardingData.duration ||
      !onboardingData.tracking ||
      !onboardingData.pilatesLevel
    )
      throw new Error("Routine, duration, or tracking is required");

    console.log("onboarding email", onboardingData.email);

    if (!onboardingData.phoneNumber && !onboardingData.email) {
      throw new Error("Phone number or email is required");
    }

    try {
      const { error: transactionError } = await supabase.rpc(
        "save_onboarding_data",
        {
          p_user_id: userId,
          p_phone_number: onboardingData.phoneNumber || null,
          p_email: onboardingData.email || null,
          p_experience_level: onboardingData.pilatesLevel,
          p_push_token: onboardingData.pushToken,
          p_goals: onboardingData.goals,
          p_weekly_sessions: onboardingData.routine,
          p_session_duration: onboardingData.duration,
          p_tracking_method: onboardingData.tracking,
          p_reminder_time: onboardingData.reminderTime,
          p_timezone: onboardingData.timezone,
        }
      );

      if (transactionError) throw transactionError;

      // Start photo upload in background if exists
      if (onboardingData.tracking === "pictures" && onboardingData.photo) {
        uploadPhotoInBackground(userId, onboardingData.photo);
      }

      // Handle mood tracking
      if (onboardingData.tracking === "mood") {
        await supabase.from("progress").insert({
          user_id: userId,
          entry_type: "mood",
          mood_description: onboardingData.mood,
          added_on: DateTime.now().toISODate(),
        });
      }

      // Store timezone in background
      if (onboardingData.timezone) {
        AsyncStorage.setItem(
          `timezone_${userId}`,
          onboardingData.timezone
        ).catch(console.error);
      }

      return { success: true };
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      return { success: false };
    }
  };

  const uploadPhotoInBackground = async (userId: string, photo: any) => {
    try {
      const fileExtension = photo?.fileName?.split(".")[1];
      const filePath = `${userId}/${DateTime.now().toISO()}.${fileExtension}`;

      const { data, error } = await supabase.storage
        .from("photo-progress")
        .upload(filePath, decode(photo?.base64 || ""), {
          contentType: photo?.mimeType,
        });

      if (error) {
        console.error("Photo upload failed:", error);
        return;
      }

      // Insert progress entry after successful upload
      await supabase.from("progress").insert({
        user_id: userId,
        entry_type: "picture",
        picture_url: data?.path?.split("/")[1],
        added_on: DateTime.now().toISODate(),
      });
    } catch (error) {
      console.error("Background photo upload failed:", error);
    }
  };

  const save = async () => {
    try {
      setIsLongWait(false);

      const timer = setTimeout(() => {
        setIsLongWait(true);
      }, LONG_WAIT_THRESHOLD);

      setLongWaitTimer(timer);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("No user found");

      const { success } = await saveOnboardingData(user.id);
      if (!success) throw new Error("Failed to save onboarding data");

      await createSchedule(user.id, "create");

      // Clear the timer if operation succeeds
      clearTimeout(timer);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      posthog.identify(user.id);
      posthog.capture("onboarding_completed");
      router.push("/(app)/(tabs)/home");
    } catch (error: any) {
      console.error("Failed to save onboarding data:", error.message);
      setToast({
        message: "Failed to save onboarding data. Please try again later.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    console.log("onboardingData", onboardingData);
    save();
  }, []);

  useEffect(() => {
    return () => {
      if (longWaitTimer) clearTimeout(longWaitTimer);
    };
  }, [longWaitTimer]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creating your{"\n"}workout schedule</Text>
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
      <Text style={styles.subtitle}>
        {isLongWait
          ? "This is taking longer than expected...\nPlease wait while we finish setting up."
          : "This may take a moment..."}
      </Text>

      {toast && (
        <Toast
          message={toast.message}
          onHide={() => setToast(null)}
          type={toast.type}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A2318",
    textAlign: "center",
    marginBottom: 48,
  },
  loadingContainer: {
    height: 100,
    marginBottom: 48,
  },
  subtitle: {
    fontSize: 18,
    color: "#4A2318",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 24,
  },
});
