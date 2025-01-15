import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GoalSelector } from "./goal-selector";

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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <GoalSelector
        goals={GOALS}
        selectedGoals={selectedGoals}
        onSelectGoal={onSelectGoal}
      />
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
  subtitle: {
    fontSize: 18,
    color: "#000000",
    marginBottom: 32,
  },
});
