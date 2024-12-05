import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExerciseLayout } from "@/components/excercise-layout";
import { Link } from "expo-router";

const WEEKLY_SCHEDULE = [
  { day: "Mon", workout: "Glutes", isHighlighted: true },
  { day: "Tues", workout: "Core", isHighlighted: true },
  { day: "Weds", workout: "Legs" },
  { day: "Thurs", workout: "Arms & Shoulders" },
  { day: "Fri", workout: "Hips" },
  { day: "Sat", workout: "Rest" },
  { day: "Sun", workout: "Rest" },
];

export default function Page() {
  const safeArea = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>coreflow</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
          <Text style={styles.addButtonText}>Add Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Workout */}
      <View style={styles.todayContainer}>
        <Text style={styles.day}>Tuesday</Text>
        <View style={styles.workoutRow}>
          <Text style={styles.workout}>20m Intermediate Core</Text>
          <Link href="/home/modal" asChild>
            <TouchableOpacity style={styles.beginButton}>
              <Text style={styles.beginButtonText}>begin</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Weekly Schedule */}
      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleTitle}>This Week 🗓️</Text>
        {WEEKLY_SCHEDULE.map(({ day, workout, isHighlighted }) => (
          <View key={day} style={styles.scheduleRow}>
            <Text
              style={[styles.scheduleDay, isHighlighted && styles.highlighted]}
            >
              {day} {">"}
            </Text>
            <Text
              style={[
                styles.scheduleWorkout,
                isHighlighted && styles.highlighted,
              ]}
            >
              {workout}
            </Text>
          </View>
        ))}
      </View>

      {/* Consistency Tracking */}
      <View style={styles.consistencyContainer}>
        <View style={styles.consistencyHeader}>
          <Text style={styles.consistencyTitle}>Patience & Persistence 🔑</Text>
        </View>
        <Text style={styles.consistencyText}>
          <Text style={{ textDecorationLine: "underline" }}>3 weeks</Text>{" "}
          consistent
        </Text>
        <Text style={styles.consistencyText}>
          <Text style={{ textDecorationLine: "underline" }}>1 day(s)</Text>{" "}
          consistent this week
        </Text>
      </View>

      {/* Navigation Bar */}
      {/* <View style={styles.navbar}>
        <TouchableOpacity>
          <FontAwesome name="plus" size={24} color="#4A2318" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="calendar" size={24} color="#4A2318" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="cog" size={24} color="#4A2318" />
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
    marginTop: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A2318",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    // paddingTop: 8,
    backgroundColor: "#4A2318",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  addButtonText: {
    fontWeight: "bold",
    color: "#FFE9D5",
  },
  todayContainer: {
    marginBottom: 40,
  },
  day: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  workoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workout: {
    fontSize: 20,
    fontWeight: "bold",
  },
  beginButton: {
    backgroundColor: "#4A2318",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  beginButtonText: {
    color: "#FFE9D5",
    fontWeight: "bold",
  },
  scheduleContainer: {
    marginBottom: 40,
  },
  scheduleTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 16,
  },
  scheduleRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  scheduleDay: {
    fontWeight: "bold",
    fontSize: 18,
    // color: "#4A2318",
    opacity: 0.7,
    width: 80,
  },
  scheduleWorkout: {
    fontSize: 18,
    fontWeight: "bold",
    opacity: 0.7,
  },
  highlighted: {
    color: "#40874C",
    fontWeight: "bold",
  },
  consistencyContainer: {
    marginBottom: 40,
  },
  consistencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  consistencyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2318",
  },
  consistencyText: {
    fontSize: 18,
    fontWeight: "bold",
    opacity: 0.7,
    marginBottom: 4,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
});
