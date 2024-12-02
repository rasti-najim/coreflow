import { OnboardingLayout } from "@/components/onboarding-layout";
import { PilatesExperience } from "@/components/pilates-experience";
import { SelectGoals } from "@/components/select-goals";
import { SelectRoutine, SelectDuration } from "@/components/select-routine";
import { GoalsDetails } from "@/components/goals-details";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { PaywallScreen } from "@/components/paywall";

interface OnboardingData {
  pilatesLevel: string | null;
  goals: string[];
  routine: string | null;
  duration: string | null;
  goalDetails: string[];
  hasPurchased?: boolean;
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    pilatesLevel: null,
    goals: [],
    routine: null,
    duration: null,
    goalDetails: [],
  });
  const router = useRouter();

  const totalSteps = useMemo(() => 6, []); // Fixed number of steps for now

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Handle completion of onboarding
      console.log("Completed onboarding:", onboardingData);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Navigate to next screen
      //   router.push("/home"); // Update this to your desired route
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
