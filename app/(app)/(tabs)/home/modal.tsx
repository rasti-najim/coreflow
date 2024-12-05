import { Text, View, StyleSheet } from "react-native";
import { ExerciseLayout } from "@/components/excercise-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Modal() {
  const safeArea = useSafeAreaInsets();
  return (
    <View style={[styles.container]}>
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
});
