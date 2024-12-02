import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

const EXPERIENCE_LEVELS = [
  {
    level: "Beginner",
    description: "I have done Pilates once or twice",
  },
  {
    level: "Intermediate",
    description: "I have done Pilates fairly consistently",
  },
  {
    level: "Advanced",
    description: "I have done Pilates regularly for months or years",
  },
];

interface PilatesExperienceProps {
  selectedLevel: string | null;
  onSelectLevel: (level: string) => void;
  title?: string;
}

export const PilatesExperience = ({
  selectedLevel,
  onSelectLevel,
  title = "Pilates Experience:",
}: PilatesExperienceProps) => {
  const handleSelectLevel = async (level: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectLevel(level);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.levelsContainer}>
        {EXPERIENCE_LEVELS.map(({ level, description }) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.levelButton,
              selectedLevel === level && styles.selectedLevel,
            ]}
            onPress={() => handleSelectLevel(level)}
          >
            <Text
              style={[
                styles.levelText,
                selectedLevel === level && styles.selectedLevelText,
              ]}
            >
              {level}
            </Text>
            <Text
              style={[
                styles.descriptionText,
                selectedLevel === level && styles.selectedLevelText,
              ]}
            >
              {description}
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
    // paddingHorizontal: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
  levelsContainer: {
    gap: 12,
  },
  levelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A2318",
  },
  selectedLevel: {
    backgroundColor: "#4A2318",
  },
  levelText: {
    fontSize: 24,
    fontWeight: "medium",
  },
  descriptionText: {
    fontSize: 16,
  },
  selectedLevelText: {
    color: "#ffffff",
  },
});
