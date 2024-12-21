import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

interface TrackingProps {
  selectedTracking: "picture" | "mood" | "neither" | null;
  onSelectTracking: (tracking: "picture" | "mood" | "neither") => void;
}

const TRACKING_OPTIONS = [
  {
    value: "picture" as const,
    label: "pictures",
  },
  {
    value: "mood" as const,
    label: "mood descriptions",
  },
  {
    value: "neither" as const,
    label: "neither",
  },
];

export const Tracking = ({
  selectedTracking,
  onSelectTracking,
}: TrackingProps) => {
  const handleSelectTracking = async (
    tracking: "picture" | "mood" | "neither"
  ) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectTracking(tracking);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracking</Text>
      <Text style={styles.subtitle}>
        How would you like to track your progress?
      </Text>

      <View style={styles.optionsContainer}>
        {TRACKING_OPTIONS.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.optionButton,
              selectedTracking === value && styles.selectedOption,
            ]}
            onPress={() => handleSelectTracking(value)}
          >
            <Text
              style={[
                styles.optionText,
                selectedTracking === value && styles.selectedOptionText,
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
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000000",
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 40,
    color: "#000000",
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
    fontWeight: "500",
    color: "#000000",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
});
