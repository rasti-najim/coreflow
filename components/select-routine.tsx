import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

const ROUTINE_OPTIONS = [
  {
    value: "1-2",
    label: "1-2",
  },
  {
    value: "3",
    label: "3",
  },
  {
    value: "5",
    label: "5",
  },
];

const DURATION_OPTIONS = [
  {
    value: "5-10",
    label: "5-10 minutes",
  },
  {
    value: "10-20",
    label: "10-20 minutes",
  },
  {
    value: "30-45",
    label: "30-45 minutes",
  },
  {
    value: "60-75",
    label: "60-75 minutes",
  },
];

interface SelectRoutineProps {
  selectedRoutine: string | null;
  onSelectRoutine: (routine: string) => void;
  title?: string;
  subtitle?: string;
}

interface SelectDurationProps {
  selectedDuration: string | null;
  onSelectDuration: (duration: string) => void;
  title?: string;
  subtitle?: string;
}

export const SelectRoutine = ({
  selectedRoutine,
  onSelectRoutine,
  title = "Routine",
  subtitle = "How many times a week do you want to do Pilates?",
}: SelectRoutineProps) => {
  const handleSelectRoutine = async (routine: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectRoutine(routine);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.optionsContainer}>
        {ROUTINE_OPTIONS.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.optionButton,
              selectedRoutine === value && styles.selectedOption,
            ]}
            onPress={() => handleSelectRoutine(value)}
          >
            <Text
              style={[
                styles.optionText,
                selectedRoutine === value && styles.selectedOptionText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const SelectDuration = ({
  selectedDuration,
  onSelectDuration,
  title = "Routine",
  subtitle = "How much time do you want to spend in a session?",
}: SelectDurationProps) => {
  const handleSelectDuration = async (duration: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDuration(duration);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.optionsContainer}>
        {DURATION_OPTIONS.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.optionButton,
              selectedDuration === value && styles.selectedOption,
            ]}
            onPress={() => handleSelectDuration(value)}
          >
            <Text
              style={[
                styles.optionText,
                selectedDuration === value && styles.selectedOptionText,
              ]}
            >
              {label}
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
    alignItems: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "left",
  },
  optionsContainer: {
    gap: 12,
    width: "100%",
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A2318",
    width: "100%",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#4A2318",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
});
