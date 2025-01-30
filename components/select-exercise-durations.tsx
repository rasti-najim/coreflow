import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

interface Exercise {
  id: string;
  name: string;
  description: string;
  type: string;
  lottie_file_url: string;
  is_two_sided: boolean;
  duration?: number;
}

interface SelectExerciseDurationsProps {
  exercises: Exercise[];
  onUpdateDuration: (exerciseId: string, duration: number) => void;
}

const MIN_DURATION = 15; // 15 seconds
const MAX_DURATION = 1800; // 30 minutes

export const SelectExerciseDurations = ({
  exercises: initialExercises,
  onUpdateDuration,
}: SelectExerciseDurationsProps) => {
  const [exercises, setExercises] = useState(initialExercises);

  const getTotalDuration = () => {
    return exercises.reduce(
      (total, exercise) => total + (exercise.duration || MIN_DURATION),
      0
    );
  };

  const formatTotalDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return seconds > 0 ? `${minutes} min ${seconds} sec` : `${minutes} min`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds
      ? `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
      : `${minutes} min`;
  };

  const handleIncrement = async (exercise: Exercise) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentDuration = exercise.duration || MIN_DURATION;
    const newDuration = Math.min(currentDuration + 15, MAX_DURATION);

    // Update local state
    setExercises(
      exercises.map((ex) =>
        ex.id === exercise.id ? { ...ex, duration: newDuration } : ex
      )
    );

    onUpdateDuration(exercise.id, newDuration);
  };

  const handleDecrement = async (exercise: Exercise) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentDuration = exercise.duration || MIN_DURATION;
    const newDuration = Math.max(currentDuration - 15, MIN_DURATION);

    // Update local state
    setExercises(
      exercises.map((ex) =>
        ex.id === exercise.id ? { ...ex, duration: newDuration } : ex
      )
    );

    onUpdateDuration(exercise.id, newDuration);
  };

  const handleDragEnd = ({ data }: { data: Exercise[] }) => {
    setExercises(data);
    // Notify parent component about the new order
    data.forEach((exercise, index) => {
      onUpdateDuration(exercise.id, exercise.duration || MIN_DURATION);
    });
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Exercise>) => (
    <ScaleDecorator>
      <TouchableOpacity
        style={[styles.exerciseItem, isActive && { opacity: 0.7 }]}
        onLongPress={drag}
        activeOpacity={1}
      >
        <View style={styles.exerciseIcon}>
          <LottieView
            source={{ uri: item.lottie_file_url }}
            // autoPlay
            // loop
            style={styles.lottieIcon}
          />
        </View>

        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            {item.is_two_sided && (
              //     <View style={styles.twoSidedBadge}>
              //     <Text style={styles.twoSidedText}>2-sided</Text>
              //   </View>
              <FontAwesome6
                name="arrows-left-right"
                size={14}
                color="#4A2318"
              />
            )}
          </View>
          <Text style={styles.exerciseType}>{item.type}</Text>
        </View>

        <View style={styles.durationControls}>
          <TouchableOpacity
            onPress={() => handleDecrement(item)}
            style={styles.durationButton}
          >
            <FontAwesome name="minus" size={16} color="#4A2318" />
          </TouchableOpacity>

          <Text style={styles.durationText}>
            {formatDuration(item.duration || MIN_DURATION)}
          </Text>

          <TouchableOpacity
            onPress={() => handleIncrement(item)}
            style={styles.durationButton}
          >
            <FontAwesome name="plus" size={16} color="#4A2318" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  const ListHeader = () => (
    <>
      <Text style={styles.title}>Set exercise durations</Text>
      <Text style={styles.subtitle}>
        Adjust the time for each exercise in your workout
      </Text>
      <View style={styles.totalDurationContainer}>
        <Text style={styles.totalDurationLabel}>Total Duration:</Text>
        <Text style={styles.totalDurationValue}>
          {formatTotalDuration(getTotalDuration())}
        </Text>
      </View>
      <Text style={styles.hint}>Press and hold to reorder exercises</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={exercises}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        dragItemOverflow={true}
        dragHitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.contentContainer}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
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
  exerciseListContainer: {
    flex: 1,
    minHeight: 1, // This helps with nested scrolling
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 8,
    fontFamily: "matolha-regular",
  },
  subtitle: {
    fontSize: 16,
    color: "#4A2318",
    marginBottom: 24,
    opacity: 0.8,
  },
  exerciseList: {
    flex: 1,
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
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2318",
  },
  exerciseType: {
    fontSize: 14,
    color: "#4A2318",
    opacity: 0.6,
  },
  durationControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  durationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE9D5",
    borderWidth: 1,
    borderColor: "#4A2318",
    justifyContent: "center",
    alignItems: "center",
  },
  durationText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A2318",
    minWidth: 60,
    textAlign: "center",
  },
  hint: {
    fontSize: 14,
    color: "#4A2318",
    marginBottom: 16,
    opacity: 0.6,
    fontStyle: "italic",
  },
  totalDurationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE9D5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#4A2318",
  },
  totalDurationLabel: {
    fontSize: 16,
    color: "#4A2318",
    fontWeight: "bold",
    marginRight: 8,
  },
  totalDurationValue: {
    fontSize: 16,
    color: "#4A2318",
  },
});
