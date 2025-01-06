import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { FontAwesome } from "@expo/vector-icons";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { createSession } from "@/lib/schedule";
import { ExerciseLayout } from "@/components/excercise-layout";
import { DateTime } from "luxon";
import mixpanel from "@/lib/mixpanel";
import { requestReview } from "@/lib/store-review";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function Page() {
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
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
  const progress = `${currentExerciseIndex + 1}/${exercises.length}`;
  const [autoPlay, setAutoPlay] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const handleCreateWorkout = async () => {
    if (!selectedDuration || !selectedFocus || !user) return;
    setIsLoading(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Create a custom session
      const session = await createSession(
        parseInt(selectedDuration),
        selectedFocus as any
      );

      const allExercises = [];

      // Fetch warmup exercise
      const { data: warmupData } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", session.warmup_exercise)
        .limit(1)
        .single();

      if (warmupData) {
        allExercises.push({ ...warmupData, type: "Warmup" });
      }

      // Fetch target exercises
      for (const exerciseId of session.target_exercises) {
        const { data: exerciseData } = await supabase
          .from("exercises")
          .select("*")
          .eq("id", exerciseId)
          .limit(1)
          .single();

        if (exerciseData) {
          allExercises.push({ ...exerciseData, type: "Target" });
        }
      }

      // Fetch cooldown exercise
      const { data: cooldownData } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", session.cooldown_exercise)
        .limit(1)
        .single();

      if (cooldownData) {
        allExercises.push({ ...cooldownData, type: "Cooldown" });
      }

      // Get animation URLs
      for (const exercise of allExercises) {
        if (exercise.lottie_file_url) {
          const { data: animationUrl } = supabase.storage
            .from("exercise_animations")
            .getPublicUrl(exercise.lottie_file_url);

          setAnimationSources((prev) => ({
            ...prev,
            [exercise.id]: animationUrl.publicUrl,
          }));
        }

        if (exercise.voice_description_url) {
          const { data: voiceDescriptionUrl } = supabase.storage
            .from("exercise_sounds")
            .getPublicUrl(exercise.voice_description_url);

          setVoiceDescriptionSources((prev) => ({
            ...prev,
            [exercise.id]: voiceDescriptionUrl.publicUrl,
          }));
        }
      }

      setExercises(allExercises);
      setIsWorkoutStarted(true);

      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          scheduled_date: DateTime.now().toISODate(),
          status: "scheduled",
          is_custom: true,
          focus: selectedFocus,
        })
        .select()
        .limit(1)
        .single();

      if (sessionError) {
        console.error("Error creating custom workout:", sessionError);
      }

      mixpanel.track("Create Custom Workout Session", {
        duration: selectedDuration,
        focus: selectedFocus,
        session_id: sessionData?.id,
      });

      setSessionId(sessionData?.id);
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating custom workout:", error);
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Workout completed
      setIsSavingProgress(true);
      try {
        const [progress, session] = await Promise.all([
          supabase.from("progress").insert({
            user_id: user.id,
            entry_type: "session",
            session_id: session_id,
            added_on: DateTime.now().toISODate(),
          }),
          supabase
            .from("sessions")
            .update({ status: "completed" })
            .eq("id", session_id)
            .eq("user_id", user.id),
        ]);

        if (progress.error || session.error) {
          console.error(
            "Error saving progress:",
            progress.error || session.error
          );
        }

        mixpanel.track("Custom Workout Session Completed", {
          duration: selectedDuration,
          session_id: session_id,
        });

        await requestReview(user.id);

        router.dismiss();
      } catch (error) {
        console.error("Error saving progress:", error);
      } finally {
        setIsSavingProgress(false);
      }
    }
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
          duration={60}
          animationSource={animationSources[currentExercise.id]}
          type={currentExercise.type}
          focus={currentExercise.focus}
          onNext={handleNext}
          onQuit={() => router.back()}
          totalExercises={exercises.length}
          currentExercise={currentExerciseIndex + 1}
          autoPlay={autoPlay}
          onAutoPlay={() => setAutoPlay(!autoPlay)}
          isSavingProgress={isSavingProgress}
          voiceDescriptionSource={voiceDescriptionSources[currentExercise.id]}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: 16 }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={20} color="#4A2318" />
        </TouchableOpacity>
        <Text
          style={[
            styles.title,
            { flex: 1, textAlign: "center", marginLeft: -40 },
          ]}
        >
          Custom Workout
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Duration</Text>
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

      <Text style={styles.sectionTitle}>Focus Area</Text>
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
                selectedFocus === value && styles.selectedOptionText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.createButton,
          isLoading && styles.createButtonDisabled,
          (!selectedDuration || !selectedFocus) && styles.createButtonDisabled,
        ]}
        onPress={handleCreateWorkout}
        disabled={!selectedDuration || !selectedFocus || isLoading}
      >
        <Text style={styles.createButtonText}>
          {isLoading ? "Creating..." : "Create Workout"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    fontSize: 16,
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
    fontSize: 14,
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
});
