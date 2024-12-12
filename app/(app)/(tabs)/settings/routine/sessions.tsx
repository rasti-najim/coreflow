import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { Redirect } from "expo-router";

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
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>();
  const [initialRoutine, setInitialRoutine] = useState<string | null>();
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const hasChanges = () => {
    if (selectedRoutine !== initialRoutine) return true;
    return false;
  };

  const handleSelectRoutine = async (routine: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoutine(routine);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from("user_preferences")
        .update({ weekly_sessions: selectedRoutine })
        .eq("user_id", user.id)
        .select();
      if (error) {
        console.error(error);
        return;
      }

      console.log(data);

      setInitialRoutine(selectedRoutine);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("weekly_sessions")
          .eq("user_id", user.id)
          .limit(1);

        if (error) {
          console.error(error);
          return;
        }

        console.log(data);

        if (data[0]?.weekly_sessions) {
          setSelectedRoutine(data[0]?.weekly_sessions);
          setInitialRoutine(data[0]?.weekly_sessions);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoutine();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>routine</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !hasChanges() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges() || isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginTop: "auto",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFE9D5",
    fontSize: 16,
    fontWeight: "bold",
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
  subtitleText: {
    fontSize: 16,
    color: "#000000",
    marginTop: 4,
  },
});
