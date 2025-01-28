import React, { useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { CreateAccount } from "@/components/create-account";
import { VerifyOTP } from "@/components/verify-otp";
import supabase from "@/lib/supabase";
import { Toast, ToastProps } from "@/components/toast";
import { usePostHog } from "posthog-react-native";
export default function Login() {
  const [step, setStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const [toast, setToast] = useState<ToastProps | null>(null);
  const posthog = usePostHog();
  const handlePhoneSignIn = async () => {
    if (!phoneNumber) return;

    try {
      const { data: checkPhoneData, error: checkPhoneError } =
        await supabase.functions.invoke("check-phone", {
          body: { phoneNumber },
        });

      if (checkPhoneError) throw checkPhoneError;

      if (!checkPhoneData.exists) {
        Keyboard.dismiss();
        setToast({
          message: "User does not exist. Please sign up instead.",
          type: "error",
        });
        return;
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", phoneNumber);

      if (!user) {
        throw new Error("User does not exist");
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (!error) {
        setStep(1);
      } else {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: "sms",
      });

      if (!error && user) {
        posthog.identify(user.id);
        posthog.capture("onboarding_sign_in");
        router.replace("/(app)/(tabs)/home");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <CreateAccount
            type="login"
            title="Welcome Back"
            phoneNumber={phoneNumber}
            onChangePhoneNumber={setPhoneNumber}
            onGoogleSignIn={async (user) => {
              // Handle Google sign in and skip OTP
              console.log("google user", user);
              posthog.capture("onboarding_google_sign_in");
              router.replace("/(app)/(tabs)/home");
            }}
            onAppleSignIn={async (user) => {
              // Handle Apple sign in and skip OTP
              console.log("apple user", user);
              posthog.capture("onboarding_apple_sign_in");
              router.replace("/(app)/(tabs)/home");
            }}
          />
        );
      case 1:
        return (
          <VerifyOTP
            phoneNumber={phoneNumber}
            code={otp}
            onChangeCode={setOtp}
            onVerify={handleVerifyOTP}
            onResend={handlePhoneSignIn}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingLayout
        currentStep={step}
        totalSteps={2}
        onBack={() => (step === 0 ? router.back() : setStep(0))}
        onNext={step === 0 ? handlePhoneSignIn : handleVerifyOTP}
        isNextDisabled={step === 0 ? !phoneNumber : !otp}
        nextButtonText="Continue"
        hideProgressBar={true}
      >
        {renderStep()}
      </OnboardingLayout>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
});
