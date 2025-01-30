import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface SaveCustomWorkoutProps {
  exercises: any[];
  onSave: (name: string) => void;
  onStartWithoutSaving: () => void;
}

export const SaveCustomWorkout = ({
  exercises,
  onSave,
  onStartWithoutSaving,
}: SaveCustomWorkoutProps) => {
  const [workoutName, setWorkoutName] = useState<string>("");

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>Save Your Workout</Text>
        <Text style={styles.stepSubtitle}>
          Give your custom workout a name to save it for later, or start right
          away
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning Energizer"
            placeholderTextColor="#4A231880"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>

        <View style={styles.exerciseList}>
          <Text style={styles.sectionTitle}>Workout Summary</Text>
          {exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Text style={styles.duration}>{exercise.duration}s</Text>
              </View>
              <FontAwesome name="check" size={20} color="#4A2318" />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStartWithoutSaving}
        >
          <Text style={styles.startButtonText}>Start Without Saving</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, !workoutName && styles.saveButtonDisabled]}
          onPress={() => workoutName && onSave(workoutName)}
          disabled={!workoutName}
        >
          <Text style={styles.saveButtonText}>Save & Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 8,
    fontFamily: "matolha-regular",
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#4A2318",
    marginBottom: 24,
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#FFE9D5",
    borderWidth: 1,
    borderColor: "#4A2318",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#4A2318",
  },
  exerciseList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFE9D5",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#4A2318",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: "#4A2318",
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
  },
  startButton: {
    backgroundColor: "#FFE9D5",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4A2318",
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2318",
  },
  saveButton: {
    backgroundColor: "#4A2318",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFE9D5",
  },
});
