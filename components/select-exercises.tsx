import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { ExerciseDetailsModal } from "./exercise-details-modal";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import BottomSheet from "@gorhom/bottom-sheet";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "warmup", label: "Warmup" },
  { value: "target", label: "Target" },
  { value: "cooldown", label: "Cooldown" },
];

interface Exercise {
  id: string;
  name: string;
  description: string;
  skill_level: string;
  focus: string[];
  is_two_sided: boolean;
  lottie_file_url: string;
  type: string;
}

interface SelectExercisesProps {
  availableExercises: Exercise[];
  selectedExercises: string[];
  onSelectExercise: (exerciseId: string) => void;
  isLoading: boolean;
  onShowExerciseDetails: (exercise: Exercise) => void;
}

export const SelectExercises = ({
  availableExercises,
  selectedExercises,
  onSelectExercise,
  isLoading,
  onShowExerciseDetails,
}: SelectExercisesProps) => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredExercises = availableExercises.filter((exercise) =>
    activeFilter === "all" ? true : exercise.type === activeFilter
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <Text style={styles.stepTitle}>Select your exercises</Text>
            <Text style={styles.stepSubtitle}>
              Choose at least 3 exercises for your workout
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {FILTER_OPTIONS.map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.filterButton,
                    activeFilter === value && styles.activeFilterButton,
                  ]}
                  onPress={() => setActiveFilter(value)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === value && styles.activeFilterText,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        data={filteredExercises}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: exercise }) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseItem,
              selectedExercises.includes(exercise.id) &&
                styles.selectedExercise,
            ]}
            onPress={() => onSelectExercise(exercise.id)}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onShowExerciseDetails(exercise);
            }}
            delayLongPress={200}
          >
            <View style={styles.exerciseIcon}>
              <LottieView
                source={{ uri: exercise.lottie_file_url }}
                // autoPlay
                // loop
                style={styles.lottieIcon}
              />
            </View>
            <View style={styles.exerciseInfo}>
              <View style={styles.exerciseHeader}>
                <Text
                  style={[
                    styles.exerciseTitle,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  {exercise.name}
                </Text>
                {exercise.is_two_sided && (
                  //   <View style={styles.twoSidedBadge}>
                  //   <Text style={styles.twoSidedText}>2-sided</Text>
                  // </View>
                  <FontAwesome6
                    name="arrows-left-right"
                    size={14}
                    color={
                      selectedExercises.includes(exercise.id)
                        ? "#FFE9D5"
                        : "#4A2318"
                    }
                  />
                )}
              </View>
              <Text
                style={[
                  styles.workoutName,
                  selectedExercises.includes(exercise.id) &&
                    styles.selectedText,
                ]}
              >
                {exercise.type}
              </Text>
              <Text
                style={[
                  styles.exerciseDescription,
                  selectedExercises.includes(exercise.id) &&
                    styles.selectedText,
                ]}
                numberOfLines={2}
              >
                {exercise.description}
              </Text>
            </View>
            <FontAwesome
              name={
                selectedExercises.includes(exercise.id)
                  ? "check-circle"
                  : "circle-o"
              }
              size={24}
              color={
                selectedExercises.includes(exercise.id) ? "#FFE9D5" : "#4A2318"
              }
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseList: {
    flex: 1,
  },
  exerciseSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFE9D5",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#4A2318",
  },
  selectedExercise: {
    backgroundColor: "#4A2318",
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2318",
    marginRight: 8,
  },
  workoutName: {
    fontSize: 12,
    color: "#4A2318",
    opacity: 0.6,
    marginBottom: 4,
    fontStyle: "italic",
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#4A2318",
    opacity: 0.8,
  },
  selectedText: {
    color: "#FFE9D5",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    alignItems: "center",
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#4A2318",
    borderRadius: 8,
    marginRight: 8,
    // minWidth: 80,
  },
  activeFilterButton: {
    backgroundColor: "#4A2318",
  },
  filterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2318",
  },
  activeFilterText: {
    color: "#FFE9D5",
  },
  exerciseIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#4A2318",
    borderRadius: 8,
    marginRight: 12,
    overflow: "hidden",
  },
  lottieIcon: {
    width: "100%",
    height: "100%",
  },
  twoSidedBadge: {
    backgroundColor: "#4A2318",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  twoSidedText: {
    color: "#FFE9D5",
    fontSize: 10,
    fontWeight: "bold",
  },
});
