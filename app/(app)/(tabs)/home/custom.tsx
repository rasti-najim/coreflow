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
  const [animationSources, setAnimationSources] = useState<{
    [key: string]: string;
  }>({});
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [session_id, setSessionId] = useState<string | null>(null);
  const currentExercise = exercises[currentExerciseIndex];
  const progress = `${currentExerciseIndex + 1}/${exercises.length}`;

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const handleCreateWorkout = async () => {
    if (!selectedDuration || !selectedFocus || !user) return;

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

      setSessionId(sessionData?.id);
    } catch (error) {
      console.error("Error creating custom workout:", error);
    }
  };

  const handleNext = async () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Workout completed
      try {
        await supabase.from("progress").insert({
          user_id: user.id,
          entry_type: "session",
          added_on: DateTime.now().toISODate(),
        });
        await supabase
          .from("sessions")
          .update({ status: "completed" })
          .eq("id", session_id)
          .eq("user_id", user.id);
        router.dismiss();
      } catch (error) {
        console.error("Error saving progress:", error);
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
          title={currentExercise.name}
          description={currentExercise.description}
          duration={2}
          animationSource={animationSources[currentExercise.id]}
          type={currentExercise.type}
          onNext={handleNext}
          onQuit={() => router.back()}
          totalExercises={exercises.length}
          currentExercise={currentExerciseIndex + 1}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={24} color="#4A2318" />
        </TouchableOpacity>
        <Text style={styles.title}>Custom Workout</Text>
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
          (!selectedDuration || !selectedFocus) && styles.createButtonDisabled,
        ]}
        onPress={handleCreateWorkout}
        disabled={!selectedDuration || !selectedFocus}
      >
        <Text style={styles.createButtonText}>Create Workout</Text>
      </TouchableOpacity>
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
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2318",
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
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
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 32,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFE9D5",
  },
});
