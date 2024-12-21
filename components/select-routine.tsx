import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

export type Routine = "1-2" | "3" | "5";
export type Duration = "5" | "10" | "15" | "20" | "30";

const ROUTINE_OPTIONS: { value: Routine; label: string }[] = [
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

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  {
    value: "5",
    label: "5 minutes",
  },
  {
    value: "10",
    label: "10 minutes",
  },
  {
    value: "15",
    label: "15 minutes",
  },
  {
    value: "20",
    label: "20 minutes",
  },
  {
    value: "30",
    label: "30 minutes",
  },
];

interface SelectRoutineProps {
  selectedRoutine: Routine | null;
  onSelectRoutine: (routine: Routine) => void;
  title?: string;
  subtitle?: string;
}

interface SelectDurationProps {
  selectedDuration: Duration | null;
  onSelectDuration: (duration: Duration) => void;
  title?: string;
  subtitle?: string;
}

export const SelectRoutine = ({
  selectedRoutine,
  onSelectRoutine,
  title = "Routine",
  subtitle = "How many times a week do you want to do Pilates?",
}: SelectRoutineProps) => {
  const handleSelectRoutine = async (routine: Routine) => {
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
  const handleSelectDuration = async (duration: Duration) => {
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
