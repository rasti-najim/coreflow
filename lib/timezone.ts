import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCalendars } from "expo-localization";
import supabase from "./supabase";

export async function checkAndUpdateTimezone(userId: string) {
  try {
    const currentTimezone = getCalendars()[0].timeZone;
    if (!currentTimezone) return;

    // Check stored timezone first
    const storedTimezone = await AsyncStorage.getItem(`timezone_${userId}`);

    // If stored timezone matches current, no need to check database
    if (storedTimezone === currentTimezone) {
      return;
    }

    // If different or no stored timezone, check database
    const { data } = await supabase
      .from("user_preferences")
      .select("timezone")
      .eq("user_id", userId)
      .limit(1)
      .single();

    // If database timezone is different from current, update it
    if (data?.timezone !== currentTimezone) {
      const { error } = await supabase
        .from("user_preferences")
        .update({ timezone: currentTimezone })
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating timezone:", error);
        return;
      }
    }

    // Update stored timezone
    await AsyncStorage.setItem(`timezone_${userId}`, currentTimezone);
  } catch (error) {
    console.error("Error checking timezone:", error);
  }
}
