import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { ExerciseLayout } from "@/components/excercise-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function Modal() {
  const safeArea = useSafeAreaInsets();
  const router = useRouter();

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
      <ExerciseLayout
        title="20m Intermediate Core"
        description="20 minutes of core work"
        duration={20}
        animationSource="/Users/rastinajim/Downloads/coreflow/assets/excercise.json"
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
