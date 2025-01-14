import supabase from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkReferralCode = async (userId: string): Promise<boolean> => {
  try {
    // First check local storage for quick response
    const localStatus = await AsyncStorage.getItem(
      `has_referral_code_${userId}`
    );

    // If we have a cached false result, return it immediately
    if (localStatus === "false") {
      return false;
    }

    // If we have a cached true result, verify in background
    if (localStatus === "true") {
      // Verify in database in background
      supabase
        .from("referral_codes")
        .select("status")
        .eq("used_by_user_id", userId)
        .eq("status", "active")
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            // Clear local storage if verification fails
            AsyncStorage.removeItem(`has_referral_code_${userId}`);
          }
        });

      return true;
    }

    // If no cache entry exists, user doesn't have a referral code
    return false;
  } catch (error) {
    console.error("Error checking referral code:", error);
    return false;
  }
};

export const clearReferralCode = async (userId: string) => {
  await AsyncStorage.removeItem(`has_referral_code_${userId}`);
};
