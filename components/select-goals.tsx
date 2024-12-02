import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

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

interface SelectGoalsProps {
  selectedGoals: string[];
  onSelectGoal: (goals: string[]) => void;
  title?: string;
  subtitle?: string;
}

export const SelectGoals = ({
  selectedGoals,
  onSelectGoal,
  title = "Select Your Goals:",
  subtitle,
}: SelectGoalsProps) => {
  const handleSelectGoal = async (goal: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Toggle selection
    const newSelectedGoals = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];

    onSelectGoal(newSelectedGoals);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.goalsContainer}>
        {GOALS.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.goalButton,
              selectedGoals.includes(goal) && styles.selectedGoal,
            ]}
            onPress={() => handleSelectGoal(goal)}
          >
            <Text
              style={[
                styles.goalText,
                selectedGoals.includes(goal) && styles.selectedGoalText,
              ]}
            >
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 32,
  },
  goalsContainer: {
    gap: 12,
  },
  goalButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A2318",
    alignItems: "center",
  },
  selectedGoal: {
    backgroundColor: "#4A2318",
  },
  goalText: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "medium",
  },
  selectedGoalText: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 18,
    color: "#000000",
    marginBottom: 32,
  },
});
