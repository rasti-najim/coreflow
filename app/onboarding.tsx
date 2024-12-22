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
import { createSchedule } from "@/lib/schedule";
import mixpanel from "@/lib/mixpanel";
import { DateTime } from "luxon";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { Routine, Duration } from "@/components/select-routine";
import Superwall from "@superwall/react-native-superwall";
interface OnboardingData {
  pilatesLevel: "beginner" | "intermediate" | "advanced" | null;
  goals: string[];
  routine: Routine | null;
  duration: Duration | null;
  goalDetails: string[];
  hasPurchased?: boolean;
  hasAccount?: boolean;
  phoneNumber?: string;
  email?: string;
  tracking: "picture" | "mood" | "neither" | null;
  mood?: string;
  photo?: ImagePicker.ImagePickerAsset | null;
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
    photo: null,
    otp: "",
  });
  const router = useRouter();

  const totalSteps = useMemo(() => 9, []); // Increased by 1 for account creation

  const handlePhoneSignIn = async (phoneNumber: string) => {
    console.log("Phone sign in with", phoneNumber);
    if (!phoneNumber) return;

    try {
      // Update the onboarding data with the phone number
      setOnboardingData((prev) => ({
        ...prev,
        phoneNumber: phoneNumber,
      }));

      await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
    }
  };

  const saveOnboardingData = async (userId: string) => {
    console.log("user id", userId);

    if (
      !onboardingData.routine ||
      !onboardingData.duration ||
      !onboardingData.tracking ||
      !onboardingData.pilatesLevel
    )
      throw new Error("Routine, duration, or tracking is required");

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
        // @ts-ignore
        user_id: userId,
        weekly_sessions: onboardingData.routine,
        session_duration: onboardingData.duration,
        tracking_method: onboardingData.tracking,
      });

    if (prefsError) throw prefsError;

    let pictureUrl = null;

    if (onboardingData.photo) {
      const { data, error } = await supabase.storage
        .from("progress")
        .upload(
          `${userId}/${DateTime.now().toISO()}.${
            onboardingData.photo?.fileName?.split(".")[1]
          }`,
          decode(onboardingData.photo?.base64 || ""),
          {
            contentType: `${onboardingData.photo?.mimeType}`,
          }
        );

      if (error) {
        console.error(error);
        return;
      }

      pictureUrl = data?.path?.split("/")[1];
    }

    if (
      onboardingData.tracking !== "neither" &&
      onboardingData.tracking !== null
    ) {
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .insert({
          user_id: userId,
          entry_type: onboardingData.tracking,
          mood_description: onboardingData.mood,
          picture_url: pictureUrl,
          added_on: DateTime.now().toISODate(),
        });

      if (progressError) throw progressError;
    }

    console.log("onboarding data saved", onboardingData);
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      if (step === 5 && onboardingData.tracking === "neither") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Superwall.shared.register("onboarding").then(async () => {
          setStep(step + 1);
        });
        return;
      }

      if (step === 6) {
        // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Superwall.shared.register("onboarding").then(async () => {
        //   setStep(step + 1);
        // });
        // return;
      }
      if (step === 8) {
        if (onboardingData.phoneNumber) {
          await handlePhoneSignIn(onboardingData.phoneNumber);
        }
        setStep(step + 1);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }
      if (step === 9) {
        if (onboardingData.phoneNumber) {
          await handleVerifyOTP();
        }
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

        const [onboardingError, scheduleError] = await Promise.all([
          saveOnboardingData(user.id),
          createSchedule(user.id, "create"),
        ]);

        if (onboardingError !== undefined) throw onboardingError;
        if (scheduleError !== undefined) throw scheduleError;

        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        mixpanel.identify(user.id);
        mixpanel.track("Sign Up");
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
        return !onboardingData.tracking;
      case 6:
        if (onboardingData.tracking === "neither") return false;
        if (onboardingData.tracking === "picture") return !onboardingData.photo;
        return !onboardingData.mood;
      // case 7:
      //   return !onboardingData.hasPurchased;
      case 7:
        return !onboardingData.phoneNumber;
      case 8:
        return !onboardingData.otp && !onboardingData.hasAccount;
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
        mixpanel.track("Verify OTP");
        await handleNext();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderStep = () => {
    // if (step === 7) {
    //   return (
    //     <PaywallScreen
    //       onPurchase={() => {
    //         setOnboardingData((prev) => ({ ...prev, hasPurchased: true }));
    //         handleNext();
    //       }}
    //       onSkip={() => {
    //         // Handle skip logic (e.g., show limited features)
    //         setOnboardingData((prev) => ({ ...prev, hasPurchased: false }));
    //         handleNext();
    //       }}
    //     />
    //   );
    // }

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
        return <GoalsDetails selectedGoals={onboardingData.goals} />;
      case 5:
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
      case 6:
        if (onboardingData.tracking === "picture") {
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
      case 7:
        return (
          <CreateAccount
            title="Create Your Account"
            onGoogleSignIn={async (user) => {
              // Handle Google sign in and skip OTP
              setOnboardingData((prev) => ({
                ...prev,
                email: user.email,
                hasAccount: true,
              }));
              mixpanel.track("Google Sign In");
              await handleNext();
            }}
            onAppleSignIn={async (user) => {
              // Handle Apple sign in and skip OTP
              setOnboardingData((prev) => ({
                ...prev,
                email: user.email,
                hasAccount: true,
              }));
              mixpanel.track("Apple Sign In");
              await handleNext();
            }}
            phoneNumber={onboardingData.phoneNumber || ""}
            onChangePhoneNumber={(phoneNumber) => {
              setOnboardingData((prev) => ({
                ...prev,
                phoneNumber,
                hasAccount: true,
              }));
              mixpanel.track("Phone Number");
            }}
          />
        );
      case 8:
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
      // showLayout={step !== 7}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
