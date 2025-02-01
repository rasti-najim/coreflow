import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { FontAwesome } from "@expo/vector-icons";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import {
  createSession,
  Focus,
  FOCUS_MAP,
  getExercisesForSession,
} from "@/lib/schedule";
import { ExerciseLayout } from "@/components/excercise-layout";
import { DateTime } from "luxon";
import { requestReview } from "@/lib/store-review";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExerciseBottomSheet } from "@/components/exercise-bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { usePostHog } from "posthog-react-native";
import { CustomSessionLayout } from "@/components/custom-session-layout";
import { SelectExercises } from "@/components/select-exercises";
import { SelectExerciseDurations } from "@/components/select-exercise-durations";
import { ExerciseDetailsModal } from "@/components/exercise-details-modal";
import { SaveCustomWorkout } from "@/components/save-custom-workout";
import { saveWorkoutProgress } from "@/lib/progress";
const DURATION_OPTIONS = [
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "20", label: "20 minutes" },
  { value: "30", label: "30 minutes" },
];

const FOCUS_OPTIONS = [
  { value: "full body", label: "Full Body" },
  { value: "upper body", label: "Upper Body" },
  { value: "lower body", label: "Lower Body" },
  { value: "core", label: "Core" },
];

const SETUP_OPTIONS = [
  {
    value: "quick",
    label: "Quick Setup",
    description: "Choose duration and focus area",
  },
  { value: "custom", label: "Custom Setup", description: "Pick each exercise" },
];

export default function Page() {
  const posthog = usePostHog();
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [animationSources, setAnimationSources] = useState<{
    [key: string]: string;
  }>({});
  const [voiceDescriptionSources, setVoiceDescriptionSources] = useState<{
    [key: string]: string;
  }>({});
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [session_id, setSessionId] = useState<string | null>(null);
  const currentExercise = exercises[currentExerciseIndex];
  const [progress] = useState<string>(
    `${currentExerciseIndex + 1}/${exercises.length}`
  );
  const [autoPlay, setAutoPlay] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [setupType, setSetupType] = useState<"quick" | "custom" | null>(null);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState<
    any | null
  >(null);
  const exerciseDetailsRef = useRef<BottomSheet>(null);
  const [exerciseDurations, setExerciseDurations] = useState<{
    [key: string]: number;
  }>({});

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep === 0 && !setupType) return;

    if (setupType === "quick" && currentStep === 2) {
      await handleCreateWorkout();
      return;
    }

    if (setupType === "custom" && currentStep === 0) {
      setCurrentStep(2);
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (currentStep === 0) {
      router.back();
      return;
    }

    if (setupType === "custom" && currentStep === 2) {
      setCurrentStep(0);
      return;
    }

    setCurrentStep(currentStep - 1);
  };

  const handleCreateWorkout = async (
    isCustom = false,
    shouldSave = false,
    existingSessionId?: string
  ) => {
    if (!user) return;
    if (!isCustom && (!selectedDuration || !selectedFocus)) return;

    setIsLoading(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      let exercisesData;
      let sessionId: string | null = existingSessionId || null;

      if (isCustom) {
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .in("id", selectedExercises);

        if (error) throw error;
        exercisesData = data.map((ex) => ({
          ...ex,
          duration: exerciseDurations[ex.id] || 15,
        }));

        // Only create session if shouldSave is true AND we don't have an existing sessionId
        if (shouldSave && !existingSessionId) {
          const { data: sessionData, error: sessionError } = await supabase
            .from("sessions")
            .insert({
              user_id: user.id,
              name: "Custom Workout",
              focus: "full body",
              status: "scheduled",
              is_custom: true,
              scheduled_date: DateTime.now().toISODate(),
            })
            .select()
            .single();

          if (sessionError) throw sessionError;
          sessionId = sessionData.id;

          const sessionExercises = exercisesData.map((exercise, index) => ({
            session_id: sessionId as string,
            exercise_id: exercise.id,
            sequence: index + 1,
            duration: exercise.duration,
          }));

          const { error: exercisesError } = await supabase
            .from("session_exercises")
            .insert(sessionExercises);

          if (exercisesError) throw exercisesError;
        }
      } else {
        const { warmup, target, cooldown } = await getExercisesForSession(
          selectedFocus as Focus,
          selectedDuration ? parseInt(selectedDuration) : 45
        );

        console.log("Exercise data:", { warmup, target, cooldown });

        // Make sure each part is an array before spreading
        exercisesData = [
          ...(Array.isArray(warmup) ? warmup : [warmup]),
          ...(Array.isArray(target) ? target : []),
          ...(Array.isArray(cooldown) ? [cooldown] : []),
        ].filter(Boolean); // Remove any null/undefined values

        console.log("Combined exercises:", exercisesData);
      }

      // Get signed URLs for all exercises
      const [animationSignedUrls, voiceSignedUrls] = await Promise.all([
        Promise.all(
          exercisesData
            .filter((ex) => ex.lottie_file_url)
            .map((ex) =>
              supabase.storage
                .from("exercise-animations")
                .createSignedUrl(ex.lottie_file_url!, 3600)
                .then((res) => ({ id: ex.id, url: res.data?.signedUrl }))
            )
        ),
        Promise.all(
          exercisesData
            .filter((ex) => ex.voice_description_url)
            .map((ex) =>
              supabase.storage
                .from("exercise_sounds")
                .createSignedUrl(ex.voice_description_url!, 3600)
                .then((res) => ({ id: ex.id, url: res.data?.signedUrl }))
            )
        ),
      ]);

      // Convert arrays to objects for easier lookup
      const animationSourcesObj = Object.fromEntries(
        animationSignedUrls
          .filter((item) => item.url)
          .map((item) => [item.id, item.url!])
      );

      const voiceSourcesObj = Object.fromEntries(
        voiceSignedUrls
          .filter((item) => item.url)
          .map((item) => [item.id, item.url!])
      );

      setAnimationSources(animationSourcesObj);
      setVoiceDescriptionSources(voiceSourcesObj);
      setExercises(exercisesData);
      setIsWorkoutStarted(true);
      setSessionId(sessionId);

      posthog.capture("user_chose_quick_setup", {
        duration: selectedDuration,
        focus: selectedFocus,
        session_id: sessionId,
        is_custom: isCustom,
      });
    } catch (error) {
      console.error("Error creating workout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextWorkout = async () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Workout completed
      setIsSavingProgress(true);
      try {
        // Always save progress
        const { success: progressSuccess } = await saveWorkoutProgress(user.id);

        if (!progressSuccess) {
          console.error("Error saving progress:", progressSuccess);
        }

        posthog.capture("user_completed_workout", {
          duration: selectedDuration,
          session_id: session_id,
          is_custom: !!session_id,
        });

        // Set flag for review request
        await AsyncStorage.setItem("shouldRequestReview", "true");

        router.dismiss();
      } catch (error) {
        console.error("Error saving progress:", error);
      } finally {
        setIsSavingProgress(false);
      }
    }
  };

  const fetchAvailableExercises = async () => {
    setIsLoadingExercises(true);
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("type", { ascending: true });

      if (error) throw error;

      // Get signed URLs for all animations
      const animationUrls = data
        .filter((ex) => ex.lottie_file_url)
        .map((ex) => ({
          id: ex.id,
          path: ex.lottie_file_url,
        }));

      const signedUrls = await Promise.all(
        animationUrls.map((url) =>
          supabase.storage
            .from("exercise-animations")
            .createSignedUrl(url.path!, 3600)
            .then((res) => ({ id: url.id, url: res.data?.signedUrl }))
        )
      );

      // Create a lookup object for signed URLs
      const signedUrlsObj = Object.fromEntries(
        signedUrls
          .filter((item) => item.url)
          .map((item) => [item.id, item.url!])
      );

      // Attach signed URLs to exercises and set default duration
      const exercisesWithUrls = data.map((exercise: any) => ({
        ...exercise,
        duration: 15, // Always set to 15 since it's not in the DB
        lottie_file_url: signedUrlsObj[exercise.id] || exercise.lottie_file_url,
      }));

      setAvailableExercises(exercisesWithUrls || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  useEffect(() => {
    if (setupType === "custom" && currentStep === 2) {
      fetchAvailableExercises();
    }
  }, [setupType, currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              How would you like to create your workout?
            </Text>
            <View style={styles.optionsContainer}>
              {SETUP_OPTIONS.map(({ value, label, description }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.setupOptionButton,
                    setupType === value && styles.selectedOption,
                  ]}
                  onPress={() => setSetupType(value as "quick" | "custom")}
                >
                  <Text
                    style={[
                      styles.setupOptionTitle,
                      setupType === value && styles.selectedOptionText,
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[
                      styles.setupOptionDescription,
                      setupType === value && styles.selectedOptionText,
                    ]}
                  >
                    {description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        if (setupType === "quick") {
          return (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                How long do you want to work out?
              </Text>
              <View style={styles.optionsContainer}>
                {DURATION_OPTIONS.map(({ value, label }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.optionButton,
                      selectedDuration === value && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedDuration(value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedDuration === value && styles.selectedOptionText,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }
        return null;
      case 2:
        if (setupType === "quick") {
          return (
            <View style={styles.stepContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4A2318" />
                  <Text style={styles.loadingText}>
                    Creating your workout...
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.stepTitle}>
                    What would you like to focus on?
                  </Text>
                  <View style={styles.optionsContainer}>
                    {FOCUS_OPTIONS.map(({ value, label }) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.optionButton,
                          selectedFocus === value && styles.selectedOption,
                        ]}
                        onPress={() => setSelectedFocus(value)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedFocus === value &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        }
        if (setupType === "custom") {
          return (
            <SelectExercises
              availableExercises={availableExercises}
              selectedExercises={selectedExercises}
              onSelectExercise={async (exerciseId) => {
                await Haptics.selectionAsync();
                if (selectedExercises.includes(exerciseId)) {
                  setSelectedExercises(
                    selectedExercises.filter((id) => id !== exerciseId)
                  );
                } else {
                  setSelectedExercises([...selectedExercises, exerciseId]);
                }
              }}
              isLoading={isLoadingExercises}
              onShowExerciseDetails={(exercise) => {
                console.log("Showing exercise details:", exercise);
                setSelectedExerciseDetails(exercise);
                exerciseDetailsRef.current?.expand();
              }}
            />
          );
        }
        return null;
      case 3:
        return (
          <SelectExerciseDurations
            exercises={availableExercises.filter((ex) =>
              selectedExercises.includes(ex.id)
            )}
            onUpdateDuration={(exerciseId, duration) => {
              setExerciseDurations((prev) => ({
                ...prev,
                [exerciseId]: duration,
              }));
            }}
          />
        );

      case 4:
        return (
          <SaveCustomWorkout
            exercises={availableExercises
              .filter((ex) => selectedExercises.includes(ex.id))
              .map((ex) => ({
                ...ex,
                duration: exerciseDurations[ex.id] || 15,
              }))}
            onSave={async (name) => {
              try {
                // First create the session
                const { data, error } = await supabase
                  .from("sessions")
                  .insert({
                    user_id: user.id,
                    name: name,
                    focus: "full body",
                    status: "scheduled",
                    is_custom: true,
                    scheduled_date: DateTime.now().toISODate(),
                  })
                  .select()
                  .single();

                if (error) throw error;

                // Create session exercises directly here
                const sessionExercises = availableExercises
                  .filter((ex) => selectedExercises.includes(ex.id))
                  .map((exercise, index) => ({
                    session_id: data.id,
                    exercise_id: exercise.id,
                    sequence: index + 1,
                    duration: exerciseDurations[exercise.id] || 15,
                  }));

                const { error: exercisesError } = await supabase
                  .from("session_exercises")
                  .insert(sessionExercises);

                if (exercisesError) throw exercisesError;

                posthog.capture("user_saved_custom_workout", {
                  workout_name: name,
                  exercise_count: selectedExercises.length,
                });

                // Now start the workout with the existing session
                await handleCreateWorkout(true, false, data.id);
              } catch (error) {
                console.error("Error saving custom workout:", error);
              }
            }}
            onStartWithoutSaving={async () => {
              posthog.capture("user_started_custom_workout_without_saving", {
                exercise_count: selectedExercises.length,
              });
              await handleCreateWorkout(true, false);
            }}
          />
        );
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0) return !setupType;
    if (currentStep === 1) return !selectedDuration;
    if (currentStep === 2) {
      if (setupType === "quick") return !selectedFocus || isLoading;
      if (setupType === "custom") return selectedExercises.length === 0;
    }
    return false;
  };

  if (isWorkoutStarted && exercises.length > 0) {
    const currentExercise = exercises[currentExerciseIndex];
    return (
      <View style={[styles.container, { paddingTop: safeArea.top }]}>
        <View style={styles.progressHeader}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="times" size={24} color="#4A2318" />
          </TouchableOpacity>
          <Text style={styles.progressText}>{progress}</Text>
        </View>
        <ExerciseLayout
          id={currentExercise.id}
          title={currentExercise.name}
          description={currentExercise.description}
          focus={currentExercise.focus}
          type={currentExercise.type}
          animationSource={animationSources[currentExercise.id]}
          voiceDescriptionSource={voiceDescriptionSources[currentExercise.id]}
          duration={currentExercise.duration || 45}
          onNext={handleNextWorkout}
          onQuit={() => router.back()}
          totalExercises={exercises.length}
          currentExercise={currentExerciseIndex + 1}
          autoPlay={autoPlay}
          onAutoPlay={() => setAutoPlay(!autoPlay)}
          isSavingProgress={isSavingProgress}
          onShowDescription={() => bottomSheetRef.current?.expand()}
        />

        <ExerciseBottomSheet
          type={currentExercise.type}
          title={currentExercise.name}
          description={currentExercise.description}
          focus={currentExercise.focus}
          duration={currentExercise.duration}
          bottomSheetRef={bottomSheetRef}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomSessionLayout
        currentStep={currentStep}
        totalSteps={setupType === "quick" ? 3 : 4}
        onBack={handleBack}
        onNext={handleNext}
        isNextDisabled={isNextDisabled()}
        nextButtonText={
          setupType === "quick" && currentStep === 2 ? "Create Workout" : "Next"
        }
        title="Custom Workout"
        hideNextButton={currentStep === 4}
      >
        {renderStep()}
      </CustomSessionLayout>

      <ExerciseDetailsModal
        exercise={selectedExerciseDetails}
        bottomSheetRef={exerciseDetailsRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2318",
  },
  dismissButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2318",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 24,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4A2318",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#4A2318",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2318",
  },
  selectedOptionText: {
    color: "#FFE9D5",
  },
  createButton: {
    backgroundColor: "#4A2318",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 40,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFE9D5",
  },
  stepContainer: {
    flex: 1,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 32,
    // fontFamily: "matolha-regular",
  },
  setupOptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4A2318",
    alignItems: "center",
  },
  setupOptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2318",
  },
  setupOptionDescription: {
    fontSize: 14,
    color: "#4A2318",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#4A2318",
    marginTop: 16,
    textAlign: "center",
  },
  exerciseList: {
    flex: 1,
  },
  exerciseSection: {
    marginBottom: 24,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFE9D5",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#4A2318",
  },
  selectedExercise: {
    backgroundColor: "#4A2318",
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#4A2318",
    opacity: 0.8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#4A2318",
    marginBottom: 24,
    opacity: 0.8,
  },
});
