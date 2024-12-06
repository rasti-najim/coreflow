import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { ExerciseLayout } from "@/components/excercise-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Modal() {
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [type, setType] = useState<"Warmup" | "Cooldown" | "Target">("Warmup");

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase.from("exercises").select("*");

      if (error) {
        console.error("Error fetching exercises:", error);
        return;
      }

      if (data && data.length > 0) {
        // Get the public URL for the animation file
        const { data: publicURL } = supabase.storage
          .from("exercise_animations")
          .getPublicUrl(data[0].lottie_file_url);

        // Extract exercise type from URL
        const url = publicURL.publicUrl;
        let exerciseType: "Warmup" | "Cooldown" | "Target" = "Warmup";
        if (url.includes("/warmups/")) {
          exerciseType = "Warmup";
        } else if (url.includes("/cooldowns/")) {
          exerciseType = "Cooldown";
        } else if (url.includes("/targets/")) {
          exerciseType = "Target";
        }

        // Update the exercise data with the full URL and set the type
        const exerciseWithURL = {
          ...data[0],
          lottie_file_url: publicURL.publicUrl,
        };

        setExercises([exerciseWithURL]);
        setType(exerciseType);
      }
    };
    fetchExercises();
  }, []);

  if (exercises.length === 0) {
    return (
      <View style={[styles.container]}>
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

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <ExerciseLayout
        title={exercises[0].name}
        description={exercises[0].description}
        duration={20}
        animationSource={exercises[0].lottie_file_url}
        type={type}
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
  dismissButton: {
    padding: 8,
  },
});
