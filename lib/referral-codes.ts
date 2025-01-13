import supabase from "@/lib/supabase";

export const validateReferralCode = async (code: string, userId: string) => {
  try {
    const { data, error } = await supabase.rpc("validate_referral_code", {
      p_code: code,
      p_user_id: userId,
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error validating referral code:", error);
    throw error;
  }
};
