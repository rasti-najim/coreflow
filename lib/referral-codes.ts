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

    const { data, error } = await supabase
      .from("referral_codes")
      .select("status")
      .eq("used_by_user_id", userId)
      .eq("status", "active")
      .limit(1)
      .single();

    if (error || !data) {
      AsyncStorage.setItem(`has_referral_code_${userId}`, "false");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking referral code:", error);
    return false;
  }
};

export const clearReferralCode = async (userId: string) => {
  await AsyncStorage.removeItem(`has_referral_code_${userId}`);
};
