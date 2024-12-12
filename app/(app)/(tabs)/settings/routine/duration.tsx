import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { Redirect } from "expo-router";

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
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [initialDuration, setInitialDuration] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const handleSelectDuration = async (duration: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDuration(duration);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .update({ session_duration: selectedDuration })
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error(error);
        return;
      }

      console.log(data);

      setInitialDuration(selectedDuration);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (selectedDuration !== initialDuration) return true;
    return false;
  };

  useEffect(() => {
    const fetchDuration = async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("session_duration")
        .eq("user_id", user.id)
        .limit(1);

      if (error) {
        console.error(error);
        return;
      }

      console.log(data);

      if (data[0]?.session_duration) {
        setSelectedDuration(data[0]?.session_duration);
        setInitialDuration(data[0]?.session_duration);
      }
    };

    fetchDuration();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Session Duration</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !hasChanges() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges()}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 48,
  },
  saveButton: {
    backgroundColor: "#4A2318",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFE9D5",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A2318",
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
