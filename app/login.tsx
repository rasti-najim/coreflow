import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { CreateAccount } from "@/components/create-account";
import { VerifyOTP } from "@/components/verify-otp";
import supabase from "@/lib/supabase";
import mixpanel from "@/lib/mixpanel";

export default function Login() {
  const [step, setStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) return;

    try {
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
        mixpanel.identify(user.id);
        mixpanel.track("Sign In");
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
            title="Welcome Back"
            phoneNumber={phoneNumber}
            onChangePhoneNumber={setPhoneNumber}
            onGoogleSignIn={async (user) => {
              // Handle Google sign in and skip OTP
              console.log("google user", user);
              mixpanel.track("Google Sign In");
              router.replace("/(app)/(tabs)/home");
            }}
            onAppleSignIn={async (user) => {
              // Handle Apple sign in and skip OTP
              console.log("apple user", user);
              mixpanel.track("Apple Sign In");
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
    <OnboardingLayout
      currentStep={step}
      totalSteps={2}
      onBack={() => (step === 0 ? router.back() : setStep(0))}
      onNext={step === 0 ? handlePhoneSignIn : handleVerifyOTP}
      isNextDisabled={step === 0 ? !phoneNumber : !otp}
      nextButtonText="Continue"
    >
      {renderStep()}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
});
