import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import * as Haptics from "expo-haptics";

const DURATION_OPTIONS = [
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

export default function Page() {
  const safeArea = useSafeAreaInsets();
  const [selectedDuration, setSelectedDuration] = useState<string>("15");

  const handleSelectDuration = async (duration: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDuration(duration);
  };

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <Text style={styles.title}>routine</Text>
      <Text style={styles.sectionTitle}>Session Duration</Text>

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
});
