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

export const OnboardingLoading = ({
  onboardingData,
}: {
  onboardingData: OnboardingData;
}) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

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

    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      phone_number: onboardingData.phoneNumber
        ? onboardingData.phoneNumber
        : null,
      email: onboardingData.email ? onboardingData.email : null,
      experience_level: onboardingData.pilatesLevel,
      push_token: onboardingData.pushToken,
    });

    if (userError) throw userError;

    // Goals insertion
    const { error: goalsError } = await supabase.from("user_goals").insert(
      onboardingData.goals.map((goal) => ({
        user_id: userId,
        name: goal,
      }))
    );

    if (goalsError) throw goalsError;

    // Preferences insertion
    const { error: prefsError } = await supabase
      .from("user_preferences")
      .insert({
        user_id: userId,
        weekly_sessions: onboardingData.routine,
        session_duration: onboardingData.duration,
        tracking_method: onboardingData.tracking,
      });

    if (prefsError) throw prefsError;

    // Handle photo upload and progress tracking if needed
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

      const { error: progressError } = await supabase.from("progress").insert({
        user_id: userId,
        entry_type: onboardingData.tracking === "pictures" ? "picture" : "mood",
        mood_description: onboardingData.mood ? onboardingData.mood : null,
        picture_url: pictureUrl,
        added_on: DateTime.now().toISODate(),
      });

      if (progressError) throw progressError;
    }

    console.log("onboarding data saved", onboardingData);
  };

  useEffect(() => {
    console.log("onboardingData", onboardingData);
    const save = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No user found");

        // console.log("onboarding data", onboardingData);

        await saveOnboardingData(user.id);
        await createSchedule(user.id, "create");

        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        mixpanel.identify(user.id);
        mixpanel.track("Sign Up");
        router.push("/(app)/(tabs)/home");
        return;
      } catch (error: any) {
        console.error("Failed to save onboarding data:", error.message);
        setToast({
          message: "Failed to save onboarding data",
          type: "error",
        });
      }
    };
    save();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creating your{"\n"}workout schedule</Text>
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
      <Text style={styles.subtitle}>This may take a moment...</Text>

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
  },
});
