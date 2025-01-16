import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { Redirect } from "expo-router";
import { createSchedule } from "@/lib/schedule";
import { Routine, ROUTINE_OPTIONS } from "@/components/select-routine";

export default function Page() {
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>();
  const [initialRoutine, setInitialRoutine] = useState<Routine | null>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const hasChanges = () => selectedRoutine !== initialRoutine;

  const handleSelectRoutine = async (routine: Routine) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoutine(routine);
    setError(null); // Clear any previous errors
  };

  const handleSave = async () => {
    Alert.alert(
      "Update Routine",
      "Updating your weekly sessions will delete all future scheduled workouts and create new ones. Are you sure you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Update",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSaving(true);
              setError(null);

              if (!selectedRoutine) throw new Error("No routine selected");

              // Update user preferences
              const { error: updateError } = await supabase
                .from("user_preferences")
                .update({ weekly_sessions: selectedRoutine })
                .eq("user_id", user.id);

              if (updateError) throw updateError;

              // Create new schedule
              const schedule = await createSchedule(user.id, "update");

              if (!schedule) {
                throw new Error("Failed to create schedule");
              }

              setInitialRoutine(selectedRoutine);

              // Show success feedback
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (error) {
              console.error(error);
              setError(
                error instanceof Error
                  ? error.message
                  : "Failed to update routine"
              );

              // Show error feedback
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("weekly_sessions")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data?.weekly_sessions) {
          setSelectedRoutine(data.weekly_sessions);
          setInitialRoutine(data.weekly_sessions);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to load routine preferences");
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
            isSaving && styles.saveButtonDisabled,
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

      {error && <Text style={styles.errorText}>{error}</Text>}

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
    fontFamily: "matolha-regular",
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
  errorText: {
    color: "red",
    marginBottom: 16,
  },
});
