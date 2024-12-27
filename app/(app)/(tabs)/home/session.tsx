import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { ExerciseLayout } from "@/components/excercise-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";
import mixpanel from "@/lib/mixpanel";
import { Loading } from "@/components/loading";
import { FOCUS_MAP } from "@/lib/schedule";
import { requestReview } from "@/lib/store-review";

export default function Modal() {
  const { user } = useAuth();
  const { session_id, duration, focus } = useLocalSearchParams();
  console.log("session_id", session_id);
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [animationSources, setAnimationSources] = useState<{
    [key: string]: string;
  }>({});
  const [voiceDescriptionSources, setVoiceDescriptionSources] = useState<{
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
        const [sessionUpdate, progressInsert] = await Promise.all([
          supabase
            .from("sessions")
            .update({ status: "completed" })
            .eq("id", session_id)
            .eq("user_id", user.id),
          supabase.from("progress").insert({
            user_id: user.id,
            entry_type: "session",
            added_on: DateTime.now().toISODate(),
          }),
        ]);

        const { data: sessionData, error: sessionError } = sessionUpdate;
        const { data: progressData, error: progressError } = progressInsert;

        if (sessionError) {
          console.error("Error updating session status:", sessionError);
        }

        if (progressError) {
          console.error("Error inserting progress:", progressError);
        }

        mixpanel.track("Session Completed", {
          duration: duration,
          session_id: session_id,
        });

        await requestReview(user.id);

        console.log("session updated", sessionData);
        console.log("progress inserted", progressData);
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
        .select(
          `
          *,
          warmup:exercises!sessions_warmup_exercise_fkey(*),
          cooldown:exercises!sessions_cooldown_exercise_fkey(*),
          target_exercises
        `
        )
        .eq("id", session_id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        return;
      }

      console.log("data", data);
      const allExercises = [];

      // Add warmup exercise
      if (data.warmup) {
        allExercises.push({ ...data.warmup, type: "Warmup" });
      }

      // Fetch target exercises in a single query
      if (data.target_exercises && data.target_exercises.length > 0) {
        const { data: targetData, error: targetError } = await supabase
          .from("exercises")
          .select("*")
          .in("id", data.target_exercises);

        if (targetError) {
          console.error("Error fetching target exercises:", targetError);
        } else {
          allExercises.push(
            ...targetData.map((exercise) => ({ ...exercise, type: "Target" }))
          );
        }
      }

      // Add cooldown exercise
      if (data.cooldown) {
        allExercises.push({ ...data.cooldown, type: "Cooldown" });
      }

      console.log("allExercises", allExercises, "length", allExercises.length);

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
    };

    fetchSession();
  }, [session_id, user.id]);

  // const handleDifferentExercise = async (
  //   currentExerciseId: string,
  //   type: "warmup" | "cooldown" | "target",
  //   focus: string
  // ) => {
  //   try {
  //     // Fetch random exercise based on type
  //     const baseQuery = supabase
  //       .from("random_exercises")
  //       .select("*")
  //       .eq("type", type);

  //     // Add focus filter for target exercises
  //     const query =
  //       type === "target"
  //         ? baseQuery.overlaps(
  //             "focus",
  //             FOCUS_MAP[focus as keyof typeof FOCUS_MAP]
  //           )
  //         : baseQuery;

  //     const { data: exercise, error } = await query.limit(1).single();

  //     if (error) throw error;
  //     if (!exercise?.lottie_file_url) throw new Error("No animation URL found");

  //     // Get animation URL
  //     const { data: animationUrl } = supabase.storage
  //       .from("exercise_animations")
  //       .getPublicUrl(exercise.lottie_file_url);

  //     // Update state in one batch
  //     setExercises((prev) => {
  //       const filtered = prev.filter((e) => e.id !== currentExerciseId);
  //       return [...filtered, exercise];
  //     });

  //     setAnimationSources((prev) => ({
  //       ...prev,
  //       [exercise.id]: animationUrl.publicUrl,
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching random exercise:", error);
  //   }
  // };

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
        <Loading />
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
        id={currentExercise.id}
        title={currentExercise.name}
        description={currentExercise.description}
        focus={currentExercise.focus}
        duration={2}
        animationSource={animationSources[currentExercise.id]}
        type={currentExercise.type}
        onNext={handleNext}
        onQuit={() => router.dismiss()}
        totalExercises={exercises.length}
        currentExercise={currentExerciseIndex + 1}
        // onDifferentExercise={handleDifferentExercise}
        voiceDescriptionSource={voiceDescriptionSources[currentExercise.id]}
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
