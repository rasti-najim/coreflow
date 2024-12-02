import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Arrow } from "./arrow";

interface GoalDetail {
  title: string;
  description: string;
}

const GOALS_DETAILS: Record<string, GoalDetail> = {
  "reduce stress": {
    title: "Reduce Stress",
    description:
      "Pilates combines mindful movement with controlled breathing, helping to calm your mind and reduce stress",
  },
  "lose weight": {
    title: "Lose Weight",
    description:
      "Pilates enhances muscle tone and boosts metabolism, supporting weight loss",
  },
  "dream body": {
    title: "Dream Body",
    description:
      "Regular Pilates sessions tone and lengthen muscles, helping you achieve a lean, sculpted look",
  },
  "strength w/o the gym": {
    title: "Strength w/o the Gym",
    description:
      "Pilates strengthens muscles with bodyweight & minimal-equipment exercises, making it perfect for home workouts",
  },
  "core strength (get abs)": {
    title: "Core Strength & Abs",
    description:
      "Pilates zeroes in on your core, helping you develop strong, defined abdominal muscles",
  },
  "muscle tone": {
    title: "Muscle Tone",
    description:
      "Pilates improves muscle tone across your entire body with controlled movements",
  },
  "flexibility & mobility": {
    title: "Flexibility & Mobility",
    description:
      "Pilates incorporates stretching and lengthening exercises, increasing your flexibility and joint mobility",
  },
  "better posture": {
    title: "Better Posture",
    description:
      "By strengthening your core and back muscles, Pilates promotes better posture and spinal alignment",
  },
};

interface GoalsDetailsProps {
  selectedGoals: string[];
}

export const GoalsDetails = ({ selectedGoals }: GoalsDetailsProps) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.mainTitle}>
        Pilates Helps You{"\n"}Achieve Your Goals
      </Text>

      <View style={styles.goalsContainer}>
        {selectedGoals.map((goalKey) => {
          const goal = GOALS_DETAILS[goalKey];
          return (
            <View key={goalKey} style={styles.goalItem}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
              <View style={styles.separator} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 24,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 40,
  },
  goalsContainer: {
    gap: 24,
  },
  goalItem: {
    gap: 8,
  },
  goalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
  goalDescription: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
  },
  separator: {
    height: 1,
    backgroundColor: "#4A2318",
    marginTop: 16,
  },
});
