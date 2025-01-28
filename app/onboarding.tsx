import { OnboardingLayout } from "@/components/onboarding-layout";
import { PilatesExperience } from "@/components/pilates-experience";
import { SelectGoals } from "@/components/select-goals";
import { SelectRoutine, SelectDuration } from "@/components/select-routine";
import { GoalsDetails } from "@/components/goals-details";
import { CreateAccount } from "@/components/create-account";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Tracking } from "@/components/tracking";
import {
  StartingJourney,
  StartingJourneyPhoto,
} from "@/components/starting-journey";
import supabase from "@/lib/supabase";
import { VerifyOTP } from "@/components/verify-otp";
import mixpanel from "@/lib/mixpanel";
import { DateTime } from "luxon";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { Routine, Duration } from "@/components/select-routine";
import Superwall from "@superwall/react-native-superwall";
import { OnboardingLoading } from "@/components/onboarding-loading";
import { Reminders } from "@/components/reminders";
import { Notifications } from "@/components/notifications";
import { Toast, ToastProps } from "@/components/toast";
import { Keyboard, View } from "react-native";

export interface OnboardingData {
  pilatesLevel: "beginner" | "intermediate" | "advanced" | null;
  goals: string[];
  routine: Routine | null;
  duration: Duration | null;
  goalDetails: string[];
  hasPurchased?: boolean;
  hasAccount?: boolean;
  phoneNumber?: string;
  email?: string;
  tracking: "pictures" | "mood" | "neither" | null;
  mood?: string;
  photo?: ImagePicker.ImagePickerAsset | null;
  otp?: string;
  pushToken?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string;
  timezone?: string;
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    pilatesLevel: null,
    goals: [],
    routine: null,
    duration: null,
    goalDetails: [],
    hasAccount: false,
    phoneNumber: "",
    email: "",
    tracking: null,
    mood: "",
    photo: null,
    otp: "",
    pushToken: "",
    reminderTime: "",
    timezone: "",
  });
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const totalSteps = useMemo(() => 11, []);

  const handlePhoneSignIn = async (phoneNumber: string) => {
    console.log("Phone sign in with", phoneNumber);
    if (!phoneNumber) return;

    try {
      const { data, error } = await supabase.functions.invoke("check-phone", {
        body: { phoneNumber },
      });

      if (error) throw error;

      if (data.exists) {
        Keyboard.dismiss();
        setToast({
          message:
            "This phone number already has an account. Please sign in instead.",
          type: "error",
        });
        return Promise.resolve({ success: false });
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", phoneNumber)
        .limit(1)
        .single();

      if (user) {
        // User exists, show error and return failure
        console.error("User already exists");
        return Promise.resolve({ success: false });
      }

      // Update the onboarding data with the phone number
      setOnboardingData((prev) => ({
        ...prev,
        phoneNumber: phoneNumber,
      }));

      await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error(error);
      return Promise.resolve({ success: false });
    }
  };

  const handleNext = async () => {
    try {
      if (step >= totalSteps) return;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      switch (step) {
        case 7:
          if (onboardingData.tracking === "neither") {
            Superwall.shared.register("onboarding").then(async () => {
              setStep(step + 2);
            });
            return;
          }
          break;

        case 8:
          Superwall.shared.register("onboarding").then(async () => {
            setStep(step + 1);
          });
          return;

        case 9:
          if (onboardingData.phoneNumber) {
            const result = await handlePhoneSignIn(onboardingData.phoneNumber);
            console.log("result", result);
            if (!result?.success) return;
          }
          if (onboardingData.email) {
            setStep(step + 2);
            return;
          }
          break;

        case 10:
          if (onboardingData.otp) {
            const success = await handleVerifyOTP(onboardingData.otp);
            if (success) {
              setStep(step + 1);
            }
            return;
          }
          break;
      }

      setStep(step + 1);
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      switch (step) {
        case 6:
          if (!onboardingData.pushToken) {
            setStep(4);
            return;
          }
          break;
        case 9:
          if (onboardingData.tracking === "neither") {
            setStep(7);
            return;
          }
          break;
        case 11:
          if (onboardingData.email) {
            setStep(9);
            return;
          }
          break;
      }

      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const isNextDisabled = () => {
    switch (step) {
      case 0:
        return onboardingData.goals.length === 0;
      case 1:
        return !onboardingData.pilatesLevel;
      case 2:
        return !onboardingData.routine;
      case 3:
        return !onboardingData.duration;
      case 4:
        // return onboardingData.goalDetails.length === 0;
        return false;
      case 5:
        return !onboardingData.reminderTime;
      case 6:
        return false;
      case 7:
        return !onboardingData.tracking;
      case 8:
        if (onboardingData.tracking === "neither") return false;
        if (onboardingData.tracking === "pictures")
          return !onboardingData.photo;
        return !onboardingData.mood;
      case 9:
        return !onboardingData.phoneNumber && !onboardingData.email;
      case 10:
        return !onboardingData.otp && !onboardingData.hasAccount;
      default:
        return false;
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!otp || otp.length !== 6) {
      console.log("Invalid OTP:", otp);
      return false;
    }

    if (!onboardingData.phoneNumber) {
      console.log("No phone number available");
      return false;
    }

    try {
      console.log(
        "Verifying OTP:",
        otp,
        "for phone:",
        onboardingData.phoneNumber
      );

      const { error } = await supabase.auth.verifyOtp({
        phone: onboardingData.phoneNumber,
        token: otp,
        type: "sms",
      });

      if (error) {
        console.error("OTP verification error:", error);
        return false;
      }

      console.log("OTP verified successfully");
      setOnboardingData((prev) => ({ ...prev, hasAccount: true }));
      mixpanel.track("Verify OTP");
      return true;
    } catch (error) {
      console.error("OTP verification failed:", error);
      return false;
    }
  };

  useEffect(() => {
    if (step === 9 && onboardingData.email) {
      handleNext();
    }
  }, [onboardingData.email]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <SelectGoals
            selectedGoals={onboardingData.goals}
            onSelectGoal={(goals) => {
              setOnboardingData((prev) => ({ ...prev, goals: goals }));
              mixpanel.track("Select Goals", {
                goals: goals,
              });
            }}
          />
        );
      case 1:
        return (
          <PilatesExperience
            selectedLevel={onboardingData.pilatesLevel}
            onSelectLevel={(level) => {
              setOnboardingData((prev) => ({
                ...prev,
                pilatesLevel: level as "beginner" | "intermediate" | "advanced",
              }));
              mixpanel.track("Select Pilates Level", {
                level: level,
              });
            }}
          />
        );
      case 2:
        return (
          <SelectRoutine
            selectedRoutine={onboardingData.routine}
            onSelectRoutine={(routine) => {
              setOnboardingData((prev) => ({ ...prev, routine: routine }));
              mixpanel.track("Select Routine", {
                routine: routine,
              });
            }}
          />
        );
      case 3:
        return (
          <SelectDuration
            selectedDuration={onboardingData.duration}
            onSelectDuration={(duration) => {
              setOnboardingData((prev) => ({ ...prev, duration: duration }));
              mixpanel.track("Select Duration", {
                duration: duration,
              });
            }}
          />
        );
      case 4:
        return (
          <Reminders
            onAllow={(pushToken) => {
              setOnboardingData((prev) => ({ ...prev, pushToken: pushToken }));
              handleNext();
            }}
            onDeny={() => {
              setStep(step + 2);
            }}
          />
        );
      case 5:
        return (
          <Notifications
            onTimeSelected={(time) => {
              setOnboardingData((prev) => ({
                ...prev,
                reminderTime: time.reminder_time,
                timezone: time.timezone,
              }));
            }}
          />
        );
      case 6:
        return <GoalsDetails selectedGoals={onboardingData.goals} />;
      case 7:
        return (
          <Tracking
            // @ts-ignore
            selectedTracking={onboardingData.tracking}
            onSelectTracking={(tracking) => {
              // @ts-ignore
              setOnboardingData((prev) => ({ ...prev, tracking: tracking }));
              mixpanel.track("Select Tracking", {
                tracking: tracking,
              });
            }}
          />
        );
      case 8:
        if (onboardingData.tracking === "pictures") {
          return (
            <StartingJourneyPhoto
              onPhotoSelect={(photo) => {
                setOnboardingData((prev) => ({ ...prev, photo: photo }));
                mixpanel.track("Starting Journey Photo");
              }}
            />
          );
        }
        return (
          <StartingJourney
            onMoodChange={(mood) => {
              setOnboardingData((prev) => ({ ...prev, mood: mood }));
              mixpanel.track("Starting Journey Mood");
            }}
          />
        );
      case 9:
        return (
          <CreateAccount
            type="signup"
            title="Create Your Account"
            onGoogleSignIn={async (user) => {
              // Handle Google sign in and skip OTP
              setOnboardingData((prev) => ({
                ...prev,
                email: user.email,
                hasAccount: true,
              }));

              await new Promise((resolve) => setTimeout(resolve, 1000));

              mixpanel.track("Google Sign In");
            }}
            onAppleSignIn={async (user) => {
              // Handle Apple sign in and skip OTP
              setOnboardingData((prev) => ({
                ...prev,
                email: user.email,
                hasAccount: true,
              }));

              await new Promise((resolve) => setTimeout(resolve, 1000));

              mixpanel.track("Apple Sign In");
            }}
            phoneNumber={onboardingData.phoneNumber || ""}
            onChangePhoneNumber={(phoneNumber) => {
              setOnboardingData((prev) => ({
                ...prev,
                phoneNumber,
              }));
            }}
          />
        );
      case 10:
        return (
          <VerifyOTP
            phoneNumber={onboardingData.phoneNumber || ""}
            code={onboardingData.otp || ""}
            onChangeCode={(code) =>
              setOnboardingData((prev) => ({ ...prev, otp: code }))
            }
            onVerify={handleVerifyOTP}
            onResend={() => handlePhoneSignIn(onboardingData.phoneNumber || "")}
          />
        );
      case 11:
        return <OnboardingLoading onboardingData={onboardingData} />;

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingLayout
        currentStep={step}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleNext}
        isNextDisabled={isNextDisabled()}
        showLayout={step !== 11}
        hideArrow={step == 4}
      >
        {renderStep()}
      </OnboardingLayout>
      {step === 9 && toast && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </View>
  );
}
