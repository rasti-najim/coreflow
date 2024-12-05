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

interface OnboardingData {
  pilatesLevel: string | null;
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
  });
  const router = useRouter();

  const totalSteps = useMemo(() => 9, []); // Increased by 1 for account creation

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Handle completion of onboarding
      console.log("Completed onboarding:", onboardingData);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to next screen
      router.push("/(app)");
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
        // return !onboardingData.hasAccount;
        return false;
      case 7:
        return !onboardingData.tracking;
      case 8:
        if (onboardingData.tracking === "neither") return false;
        if (onboardingData.tracking === "pictures")
          return !onboardingData.photo;
        return !onboardingData.mood;
      default:
        return false;
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
              setOnboardingData((prev) => ({ ...prev, pilatesLevel: level }))
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
          <CreateAccount onGoogleSignIn={() => {}} onPhoneSignIn={() => {}} />
        );
      case 7:
        return (
          <Tracking
            selectedTracking={onboardingData.tracking}
            onSelectTracking={(tracking) =>
              setOnboardingData((prev) => ({ ...prev, tracking: tracking }))
            }
          />
        );
      case 8:
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
