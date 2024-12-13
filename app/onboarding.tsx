import { OnboardingLayout } from "@/components/onboarding-layout";
import { PilatesExperience } from "@/components/pilates-experience";
import { SelectGoals } from "@/components/select-goals";
import { SelectRoutine, SelectDuration } from "@/components/select-routine";
import { GoalsDetails } from "@/components/goals-details";
import { CreateAccount } from "@/components/create-account";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { PaywallScreen } from "@/components/paywall";
import { Tracking } from "@/components/tracking";
import {
  StartingJourney,
  StartingJourneyPhoto,
} from "@/components/starting-journey";
import supabase from "@/lib/supabase";
import { VerifyOTP } from "@/components/verify-otp";

interface OnboardingData {
  pilatesLevel: "beginner" | "intermediate" | "advanced" | null;
  goals: string[];
  routine: string | null;
  duration: string | null;
  goalDetails: string[];
  hasPurchased?: boolean;
  hasAccount?: boolean;
  phoneNumber?: string;
  email?: string;
  tracking: "pictures" | "mood" | "neither" | null;
  mood?: string;
  photo?: string;
  otp?: string;
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
    photo: "",
    otp: "",
  });
  const router = useRouter();

  const totalSteps = useMemo(() => 10, []); // Increased by 1 for account creation

  const handlePhoneSignIn = async (phoneNumber: string) => {
    console.log("Phone sign in with", phoneNumber);
    if (!phoneNumber) return;

    // Update the onboarding data with the phone number
    setOnboardingData((prev) => ({
      ...prev,
      phoneNumber: phoneNumber,
    }));

    try {
      await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const saveOnboardingData = async (userId: string) => {
    console.log("user id", userId);
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      phone_number: onboardingData.phoneNumber,
      email: onboardingData.email ? onboardingData.email : null,
      experience_level: onboardingData.pilatesLevel,
    });

    if (userError) throw userError;

    const { error: goalsError } = await supabase.from("user_goals").insert(
      onboardingData.goals.map((goal) => ({
        user_id: userId,
        name: goal,
      }))
    );

    if (goalsError) throw goalsError;

    const { error: prefsError } = await supabase
      .from("user_preferences")
      .insert({
        user_id: userId,
        weekly_sessions: onboardingData.routine,
        session_duration: onboardingData.duration,
        tracking_method: onboardingData.tracking,
      });

    if (prefsError) throw prefsError;

    console.log("onboarding data saved", onboardingData);
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      if (step === 6) {
        await handlePhoneSignIn(onboardingData.phoneNumber || "");
      }
      if (step === 7) {
        await handleVerifyOTP();
      }
      setStep(step + 1);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No user found");

        // console.log("onboarding data", onboardingData);

        await saveOnboardingData(user.id);
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        router.push("/(app)/(tabs)/home");
      } catch (error: any) {
        console.error("Failed to save onboarding data:", error.message);
        // Here you might want to show an error message to the user
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
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
        return !onboardingData.hasPurchased;
      case 6:
        return !onboardingData.phoneNumber;
      case 7:
        return !onboardingData.otp && !onboardingData.hasAccount;
      case 8:
        return !onboardingData.tracking;
      case 9:
        if (onboardingData.tracking === "neither") return false;
        if (onboardingData.tracking === "pictures")
          return !onboardingData.photo;
        return !onboardingData.mood;
      default:
        return false;
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: onboardingData.phoneNumber || "",
        token: onboardingData.otp || "",
        type: "sms",
      });

      if (!error) {
        setOnboardingData((prev) => ({ ...prev, hasAccount: true }));
        await handleNext();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderStep = () => {
    if (step === 5) {
      return (
        <PaywallScreen
          onPurchase={() => {
            setOnboardingData((prev) => ({ ...prev, hasPurchased: true }));
            handleNext();
          }}
          onSkip={() => {
            // Handle skip logic (e.g., show limited features)
            setOnboardingData((prev) => ({ ...prev, hasPurchased: false }));
            handleNext();
          }}
        />
      );
    }

    switch (step) {
      case 0:
        return (
          <SelectGoals
            selectedGoals={onboardingData.goals}
            onSelectGoal={(goals) =>
              setOnboardingData((prev) => ({ ...prev, goals: goals }))
            }
          />
        );
      case 1:
        return (
          <PilatesExperience
            selectedLevel={onboardingData.pilatesLevel}
            onSelectLevel={(level) =>
              setOnboardingData((prev) => ({
                ...prev,
                pilatesLevel: level as "beginner" | "intermediate" | "advanced",
              }))
            }
          />
        );
      case 2:
        return (
          <SelectRoutine
            selectedRoutine={onboardingData.routine}
            onSelectRoutine={(routine) =>
              setOnboardingData((prev) => ({ ...prev, routine: routine }))
            }
          />
        );
      case 3:
        return (
          <SelectDuration
            selectedDuration={onboardingData.duration}
            onSelectDuration={(duration) =>
              setOnboardingData((prev) => ({ ...prev, duration: duration }))
            }
          />
        );
      case 4:
        return <GoalsDetails selectedGoals={onboardingData.goals} />;
      case 6:
        return (
          <CreateAccount
            title="Create Your Account"
            onGoogleSignIn={() => {
              // Handle Google sign in and skip OTP
              handleNext();
            }}
            onAppleSignIn={() => {
              // Handle Apple sign in and skip OTP
              handleNext();
            }}
            phoneNumber={onboardingData.phoneNumber || ""}
            onChangePhoneNumber={(phoneNumber) =>
              setOnboardingData((prev) => ({ ...prev, phoneNumber }))
            }
          />
        );
      case 7:
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
      case 8:
        return (
          <Tracking
            selectedTracking={onboardingData.tracking}
            onSelectTracking={(tracking) =>
              setOnboardingData((prev) => ({ ...prev, tracking: tracking }))
            }
          />
        );
      case 9:
        if (onboardingData.tracking === "pictures") {
          return (
            <StartingJourneyPhoto
              onPhotoSelect={(photo) =>
                setOnboardingData((prev) => ({ ...prev, photo: photo }))
              }
            />
          );
        }
        return (
          <StartingJourney
            onMoodChange={(mood) =>
              setOnboardingData((prev) => ({ ...prev, mood: mood }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      isNextDisabled={isNextDisabled()}
      showLayout={step !== 5}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
