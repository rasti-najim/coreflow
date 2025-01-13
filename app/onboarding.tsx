import { OnboardingLayout } from "@/components/onboarding-layout";
import { PilatesExperience } from "@/components/pilates-experience";
import { SelectGoals } from "@/components/select-goals";
import { SelectRoutine, SelectDuration } from "@/components/select-routine";
import { GoalsDetails } from "@/components/goals-details";
import { CreateAccount } from "@/components/create-account";
import { useState, useMemo, useEffect } from "react";
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
import { ReferralCode } from "@/components/referral-code";
import { OnboardingLoading } from "@/components/onboarding-loading";
import { Reminders } from "@/components/reminders";
import { Notifications } from "@/components/notifications";

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
  referralCode?: string;
  pushToken?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string;
  reminderOffset?: number;
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
    referralCode: "",
    pushToken: "",
  });
  const router = useRouter();

  const totalSteps = useMemo(() => 12, []);

  const handlePhoneSignIn = async (phoneNumber: string) => {
    console.log("Phone sign in with", phoneNumber);
    if (!phoneNumber) return;

    try {
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

  const saveOnboardingData = async (userId: string) => {
    console.log("user id", userId);

    if (
      !onboardingData.routine ||
      !onboardingData.duration ||
      !onboardingData.tracking ||
      !onboardingData.pilatesLevel
    )
      throw new Error("Routine, duration, or tracking is required");

    console.log("onboarding email", onboardingData.email);

    if (!onboardingData.phoneNumber && !onboardingData.email) {
      throw new Error("Phone number or email is required");
    }

    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      phone_number: onboardingData.phoneNumber
        ? onboardingData.phoneNumber
        : null,
      email: onboardingData.email ? onboardingData.email : null,
      experience_level: onboardingData.pilatesLevel,
    });

    if (userError) throw userError;

    // Goals insertion
    const { error: goalsError } = await supabase.from("user_goals").insert(
      onboardingData.goals.map((goal) => ({
        user_id: userId,
        name: goal,
      }))
    );

    if (goalsError) throw goalsError;

    // Preferences insertion
    const { error: prefsError } = await supabase
      .from("user_preferences")
      .insert({
        user_id: userId,
        weekly_sessions: onboardingData.routine,
        session_duration: onboardingData.duration,
        tracking_method: onboardingData.tracking,
      });

    if (prefsError) throw prefsError;

    // Handle photo upload and progress tracking if needed
    if (
      onboardingData.tracking !== "neither" &&
      onboardingData.tracking !== null
    ) {
      let pictureUrl = null;

      if (onboardingData.photo) {
        const fileExtension = onboardingData.photo?.fileName?.split(".")[1];
        const filePath = `${userId}/${DateTime.now().toISO()}.${fileExtension}`;

        const { data, error } = await supabase.storage
          .from("photo-progress")
          .upload(filePath, decode(onboardingData.photo?.base64 || ""), {
            contentType: onboardingData.photo?.mimeType,
          });

        if (!error) {
          pictureUrl = data?.path?.split("/")[1];
        }
      }

      const { error: progressError } = await supabase.from("progress").insert({
        user_id: userId,
        entry_type: onboardingData.tracking === "pictures" ? "picture" : "mood",
        mood_description: onboardingData.mood ? onboardingData.mood : null,
        picture_url: pictureUrl,
        added_on: DateTime.now().toISODate(),
      });

      if (progressError) throw progressError;
    }

    console.log("onboarding data saved", onboardingData);
  };

  const handleNext = async () => {
    try {
      if (step < totalSteps - 1) {
        // if ((step === 5 && onboardingData.tracking === "neither") || step === 6) {
        //   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        //   Superwall.shared.register("onboarding").then(async () => {
        //     setStep(step + 1);
        //   });
        //   return;
        // }

        if (step === 5 && onboardingData.tracking === "neither") {
          setStep(step + 2);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return;
          // } else if (step === 7) {
          //   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          //   Superwall.shared.register("onboarding").then(async () => {
          //     setStep(step + 1);
          //   });
          //   return;
        } else if (step === 8) {
          if (onboardingData.phoneNumber) {
            const result = await handlePhoneSignIn(onboardingData.phoneNumber);
            if (!result?.success) {
              return;
            }
          }
          if (onboardingData.email) {
            setStep(step + 2);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return;
          }
        } else if (step === 9) {
          await handleVerifyOTP(onboardingData.otp || "");
        }

        setStep(step + 1);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // else {
      //   try {
      //     const {
      //       data: { user },
      //       error: userError,
      //     } = await supabase.auth.getUser();

      //     if (userError) throw userError;
      //     if (!user) throw new Error("No user found");

      //     // console.log("onboarding data", onboardingData);

      //     await saveOnboardingData(user.id);
      //     await createSchedule(user.id, "create");

      //     await Haptics.notificationAsync(
      //       Haptics.NotificationFeedbackType.Success
      //     );
      //     mixpanel.identify(user.id);
      //     mixpanel.track("Sign Up");
      //     router.push("/(app)/(tabs)/home");
      //   } catch (error: any) {
      //     console.error("Failed to save onboarding data:", error.message);
      //     // Here you might want to show an error message to the user
      //   }
      // }
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      if (step === 7 && onboardingData.tracking === "neither") {
        setStep(5);
        return;
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
      // case 7:
      //   return !onboardingData.hasPurchased;
      case 9:
        return false;
      case 10:
        return !onboardingData.phoneNumber && !onboardingData.email;
      case 11:
        return !onboardingData.otp && !onboardingData.hasAccount;
      default:
        return false;
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!otp || otp.length !== 6) {
      console.log("Invalid OTP:", otp);
      return;
    }

    if (!onboardingData.phoneNumber) {
      console.log("No phone number available");
      return;
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
        return;
      }

      console.log("OTP verified successfully");
      setOnboardingData((prev) => ({ ...prev, hasAccount: true }));
      mixpanel.track("Verify OTP");

      // Proceed to next step
      // await handleNext();
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  useEffect(() => {
    if (step === 10) {
      handleNext();
    }
  }, [step]);

  useEffect(() => {
    if (step === 8 && onboardingData.email) {
      handleNext();
    }
  }, [onboardingData.email]);

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
                reminderOffset: time.reminder_offset,
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
        return <ReferralCode />;
      case 10:
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
      case 11:
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
      case 12:
        return <OnboardingLoading onboardingData={onboardingData} />;

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
      showLayout={step !== 10}
      hideArrow={step == 4}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
