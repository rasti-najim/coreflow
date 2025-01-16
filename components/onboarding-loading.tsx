import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Loading } from "./loading";
import { OnboardingData } from "@/app/onboarding";
import { router } from "expo-router";
import mixpanel from "@/lib/mixpanel";
import supabase from "@/lib/supabase";
import { createSchedule } from "@/lib/schedule";
import * as Haptics from "expo-haptics";
import { DateTime } from "luxon";
import { Toast, ToastProps } from "./toast";
import { decode } from "base64-arraybuffer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const OnboardingLoading = ({
  onboardingData,
}: {
  onboardingData: OnboardingData;
}) => {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLongWait, setIsLongWait] = useState(false);
  const MAX_RETRIES = 3;
  const LONG_WAIT_THRESHOLD = 10000; // 10 seconds

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
      // Start a transaction
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

      // Handle photo upload and progress tracking separately (since storage operations can't be part of the DB transaction)
      if (
        onboardingData.tracking !== "neither" &&
        onboardingData.tracking !== null
      ) {
        let pictureUrl = null;

        if (onboardingData.photo) {
          const fileExtension = onboardingData.photo?.fileName?.split(".")[1];
          const filePath = `${userId}/${DateTime.now().toISO()}.${fileExtension}`;

          const { data, error } = await supabase.storage
            .from("photo-progress")
            .upload(filePath, decode(onboardingData.photo?.base64 || ""), {
              contentType: onboardingData.photo?.mimeType,
            });

          if (!error) {
            pictureUrl = data?.path?.split("/")[1];
          }
        }

        const { error: progressError } = await supabase
          .from("progress")
          .insert({
            user_id: userId,
            entry_type:
              onboardingData.tracking === "pictures" ? "picture" : "mood",
            mood_description: onboardingData.mood ? onboardingData.mood : null,
            picture_url: pictureUrl,
            added_on: DateTime.now().toISODate(),
          });

        if (progressError) throw progressError;
      }

      // Store timezone in AsyncStorage
      if (onboardingData.timezone) {
        await AsyncStorage.setItem(
          `timezone_${userId}`,
          onboardingData.timezone
        );
      }

      console.log("onboarding data saved", onboardingData);
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      return Promise.resolve({ success: false });
    }
  };

  const save = async () => {
    try {
      setIsRetrying(true);
      setIsLongWait(false);

      // Set up timer for long wait feedback
      const longWaitTimer = setTimeout(() => {
        setIsLongWait(true);
      }, LONG_WAIT_THRESHOLD);

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
      clearTimeout(longWaitTimer);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      mixpanel.identify(user.id);
      mixpanel.track("Sign Up");
      router.push("/(app)/(tabs)/home");
    } catch (error: any) {
      console.error("Failed to save onboarding data:", error.message);
      setToast({
        message:
          retryCount >= MAX_RETRIES
            ? "Maximum retry attempts reached. Please try again later."
            : "Failed to save onboarding data. Tap to retry.",
        type: "error",
      });
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    if (retryCount >= MAX_RETRIES) return;
    setRetryCount((prev) => prev + 1);
    setToast(null);
    save();
  };

  useEffect(() => {
    console.log("onboardingData", onboardingData);
    save();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creating your{"\n"}workout schedule</Text>
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
      <Text style={styles.subtitle}>
        {isLongWait
          ? "This is taking longer than expected...\nPlease wait while we finish setting up."
          : isRetrying
          ? "Retrying..."
          : "This may take a moment..."}
      </Text>

      {toast && (
        <Toast
          message={toast.message}
          onHide={() => retryCount < MAX_RETRIES && setToast(null)}
          type={toast.type}
          onPress={retryCount < MAX_RETRIES ? handleRetry : undefined}
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
