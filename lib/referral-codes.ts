import supabase from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const validateReferralCode = async (code: string, userId: string) => {
  try {
    const { data, error } = await supabase.rpc("validate_referral_code", {
      p_code: code,
      p_user_id: userId,
    });

    if (error) {
      throw error;
    }

    // Store the premium status locally
    await AsyncStorage.setItem(`premium_status_${userId}`, "true");
    return true;
  } catch (error) {
    console.error("Error validating referral code:", error);
    throw error;
  }
};

export const checkPremiumAccess = async (userId: string): Promise<boolean> => {
  try {
    // First check local storage
    const localStatus = await AsyncStorage.getItem(
      `has_referral_code_${userId}`
    );
    if (localStatus === "true") {
      // Verify the status in database even if we have local storage
      const { data, error } = await supabase
        .from("referral_codes")
        .select("status")
        .eq("used_by_user_id", userId)
        .eq("status", "active")
        .limit(1)
        .single();

      if (error || !data) {
        // If there's an error or no active referral found, clear local storage
        await AsyncStorage.removeItem(`has_referral_code_${userId}`);
        return false;
      }

      return true;
    }

    // If not in local storage, check database
    const { data, error } = await supabase
      .from("referral_codes")
      .select("status")
      .eq("used_by_user_id", userId)
      .eq("status", "active")
      .limit(1)
      .single();

    if (error) throw error;

    // Store result locally for future checks
    const hasPremium = !!data;
    await AsyncStorage.setItem(
      `has_referral_code_${userId}`,
      hasPremium ? "true" : "false"
    );

    return hasPremium;
  } catch (error) {
    console.error("Error checking premium access:", error);
    return false;
  }
};

export const clearPremiumStatus = async (userId: string) => {
  await AsyncStorage.removeItem(`has_referral_code_${userId}`);
};
