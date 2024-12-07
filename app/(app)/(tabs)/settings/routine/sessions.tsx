import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useState } from "react";

const ROUTINE_OPTIONS = [
  {
    value: "1-2",
    label: "1-2",
    recommended: false,
  },
  {
    value: "3",
    label: "3",
    recommended: true,
  },
  {
    value: "5",
    label: "5",
    recommended: false,
  },
];

export default function Page() {
  const safeArea = useSafeAreaInsets();
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>("3");

  const handleSelectRoutine = async (routine: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoutine(routine);
  };

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <Text style={styles.title}>routine</Text>
      <Text style={styles.sectionTitle}>Sessions Per Week</Text>

      <View style={styles.optionsContainer}>
        {ROUTINE_OPTIONS.map(({ value, label, recommended }) => (
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
            {recommended && (
              <Text
                style={[
                  styles.subtitleText,
                  selectedRoutine === value && styles.selectedOptionText,
                ]}
              >
                recommended
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
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
  sectionTitle: {
    fontSize: 32,
    marginBottom: 24,
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
  subtitleText: {
    fontSize: 16,
    color: "#000000",
    marginTop: 4,
  },
});
