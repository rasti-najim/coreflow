import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

interface GoalSelectorProps {
  goals: string[];
  selectedGoals: string[];
  onSelectGoal: (goals: string[]) => void;
}

export const GoalSelector = ({
  goals,
  selectedGoals,
  onSelectGoal,
}: GoalSelectorProps) => {
  const handleSelectGoal = async (goal: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Toggle selection
    const newSelectedGoals = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];

    onSelectGoal(newSelectedGoals);
  };

  return (
    <View style={styles.goalsContainer}>
      {goals.map((goal) => (
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
  );
};

const styles = StyleSheet.create({
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
});
