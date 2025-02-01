import supabase from "./supabase";
import { DateTime } from "luxon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

export async function updateUserStreak(userId: string) {
  try {
    // Get user's timezone from AsyncStorage
    const userTimezone = await AsyncStorage.getItem(`timezone_${userId}`);

    // Get user's current streak info
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("last_checkin_date, current_streak, longest_streak")
      .eq("id", userId)
      .limit(1)
      .single();

    if (userError) throw userError;

    const today = DateTime.now()
      .setZone(userTimezone || "local")
      .startOf("day");

    const lastCheckin = userData?.last_checkin_date
      ? DateTime.fromISO(userData.last_checkin_date, {
          zone: userTimezone || "local",
        })
      : null;

    let newStreak = 1;
    let newLongestStreak = userData?.longest_streak || 1;

    if (lastCheckin) {
      const daysSinceLastCheckin = today.diff(lastCheckin, "days").days;

      if (daysSinceLastCheckin === 1) {
        // Continuous streak
        newStreak = (userData?.current_streak || 0) + 1;
        newLongestStreak = Math.max(newStreak, newLongestStreak);
      } else if (daysSinceLastCheckin === 0) {
        // Already checked in today
        newStreak = userData?.current_streak || 1;
      }
      // else: streak broken, newStreak stays 1
    }

    // Update user's streak
    const { error: updateError } = await supabase
      .from("users")
      .update({
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_checkin_date: today.toISODate(),
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return Promise.resolve({ success: true, streak: newStreak });
  } catch (error) {
    console.error("Error updating streak:", error);
    return Promise.resolve({ success: false, streak: 0 });
  }
}

export async function saveWorkoutProgress(userId: string) {
  try {
    // Save progress entry
    const { error: progressError } = await supabase.from("progress").insert({
      user_id: userId,
      entry_type: "session",
      added_on: DateTime.now().toISODate(),
    });

    if (progressError) {
      console.error("Error saving progress:", progressError);
      throw progressError;
    }

    // Update user's streak directly
    const streak = await updateUserStreak(userId);

    if (!streak.success) {
      console.error("Error updating streak:", streak.streak);
      throw streak.streak;
    }

    // Set flag for review request
    await AsyncStorage.setItem("shouldRequestReview", "true");

    return Promise.resolve({ success: true });
  } catch (error) {
    console.error("Error saving workout progress:", error);
    return Promise.resolve({ success: false });
  }
}
