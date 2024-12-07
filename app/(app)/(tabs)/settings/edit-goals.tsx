import { View, Text, StyleSheet } from "react-native";
import { SelectGoals } from "@/components/select-goals";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { GoalSelector } from "@/components/goal-selector";

const GOALS = [
  "reduce stress",
  "lose weight",
  "dream body",
  "strength w/o the gym",
  "core strength (get abs)",
  "muscle tone",
  "flexibility & mobility",
  "better posture",
];

export default function EditGoals() {
  const safeArea = useSafeAreaInsets();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["muscle tone"]);

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <Text style={styles.title}>goals</Text>
      <GoalSelector
        goals={GOALS}
        selectedGoals={selectedGoals}
        onSelectGoal={setSelectedGoals}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 48,
    fontFamily: "Margin-DEMO",
  },
});
