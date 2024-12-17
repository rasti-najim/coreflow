import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { ExerciseLayout } from "@/components/excercise-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";

export default function Modal() {
  const { user } = useAuth();
  const { session_id } = useLocalSearchParams();
  console.log("session_id", session_id);
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [animationSources, setAnimationSources] = useState<{
    [key: string]: string;
  }>({});

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const handleNext = async () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Session completed
      try {
        const { data, error } = await supabase
          .from("sessions")
          .update({ status: "completed" })
          .eq("id", session_id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating session status:", error);
        }

        console.log("session updated", data);
        router.dismiss();
      } catch (error) {
        console.error("Error updating session status:", error);
      }
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        return;
      }

      console.log("data", data);
      const allExercises = [];

      // Fetch warmup exercise
      const { data: warmupData, error: warmupError } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", data.warmup_exercise)
        .single();

      if (warmupError) {
        console.error("Error fetching warmup exercise:", warmupError);
      } else {
        allExercises.push({ ...warmupData, type: "Warmup" });
      }

      // Fetch target exercises
      for (const exerciseId of data.target_exercises) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from("exercises")
          .select("*")
          .eq("id", exerciseId)
          .single();

        if (exerciseError) {
          console.error("Error fetching target exercise:", exerciseError);
        } else {
          allExercises.push({ ...exerciseData, type: "Target" });
        }
      }

      // Fetch cooldown exercise
      const { data: cooldownData, error: cooldownError } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", data.cooldown_exercise)
        .single();

      if (cooldownError) {
        console.error("Error fetching cooldown exercise:", cooldownError);
      } else {
        allExercises.push({ ...cooldownData, type: "Cooldown" });
      }

      console.log("allExercises", allExercises, "length", allExercises.length);

      // After fetching all exercises, get signed URLs for their animations
      for (const exercise of allExercises) {
        if (exercise.lottie_file_url) {
          const { data: animationUrl } = supabase.storage
            .from("exercise_animations") // replace with your bucket name
            .getPublicUrl(exercise.lottie_file_url);

          console.log("animationUrl", animationUrl.publicUrl);
          setAnimationSources((prev) => ({
            ...prev,
            [exercise.id]: animationUrl.publicUrl,
          }));
        }
      }

      setExercises(allExercises);
    };

    fetchSession();
  }, [session_id, user.id]);

  if (exercises.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: safeArea.top }]}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="times" size={24} color="#4A2318" />
          </TouchableOpacity>
        </View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progress = `${currentExerciseIndex + 1}/${exercises.length}`;

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
        onQuit={() => router.dismiss()}
        totalExercises={exercises.length}
        currentExercise={currentExerciseIndex + 1}
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
});
