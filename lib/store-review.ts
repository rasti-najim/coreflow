import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { DateTime } from "luxon";
import supabase from "./supabase";

const canRequestReview = async () => {
  const storedStatus = await AsyncStorage.getItem("hasReviewed");

  if (storedStatus === "true") return false;

  const lastReviewRequest = await AsyncStorage.getItem("lastReviewRequest");
  if (!lastReviewRequest) return true;

  const lastDate = DateTime.fromISO(lastReviewRequest);
  const daysSinceLastRequest = DateTime.now().diff(lastDate, "days").days;
  return daysSinceLastRequest >= 30;
};

// Check if store review is available
export async function requestReview(userId: string) {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable && (await canRequestReview())) {
      // Get completed sessions count from Supabase
      const { count } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed");

      // Request review after every 5th completed session
      if (count && count % 5 === 0) {
        await StoreReview.requestReview();
        await AsyncStorage.setItem("lastReviewRequest", DateTime.now().toISO());
        await AsyncStorage.setItem("hasReviewed", "true");
      }
    }
  } catch (error) {
    console.error("Error requesting review:", error);
  }
}
