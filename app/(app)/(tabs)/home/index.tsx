import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { createSchedule } from "@/lib/schedule";

export default function Page() {
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<any | undefined>();
  const [showOptions, setShowOptions] = useState(false);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        await createSchedule(user.id);
      } catch (error) {
        console.error(error);
      }
    };
    loadSchedule();
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      const { data: weekSchedule } = await supabase
        .from("weekly_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("week_start", new Date().toISOString())
        .limit(1)
        .single();
      setSchedule(weekSchedule.sessions);
    };
    loadSchedule();
  }, []);

  const onBegin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/home/modal");
  };

  const ProgressOptions = () => {
    if (!showOptions) return null;

    return (
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Handle image progress
            setShowOptions(false);
          }}
        >
          <FontAwesome6 name="image" size={18} color="#FFE9D5" />
          <Text style={styles.optionText}>Track Progress Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Handle note progress
            setShowOptions(false);
          }}
        >
          <FontAwesome6 name="note-sticky" size={18} color="#FFE9D5" />
          <Text style={styles.optionText}>Track Progress Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Handle custom session
            setShowOptions(false);
          }}
        >
          <FontAwesome6 name="mattress-pillow" size={18} color="#FFE9D5" />
          <Text style={styles.optionText}>Create Custom Workout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>coreflow</Text>
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowOptions(!showOptions);
            }}
          >
            <FontAwesome6 name="plus" size={18} color="#FFE9D5" />
            {/* <Text style={styles.addButtonText}>Add Progress</Text> */}
          </TouchableOpacity>
          <ProgressOptions />
        </View>
      </View>

      {/* Today's Workout */}
      <View style={styles.todayContainer}>
        <Text style={styles.day}>{todayWorkout?.day || "Rest Day"}</Text>
        <View style={styles.workoutRow}>
          <Text style={styles.workout}>
            {todayWorkout?.workout === "Rest"
              ? "Rest Day"
              : `${todayWorkout?.duration}m  ${todayWorkout?.workout}`}
          </Text>

          {todayWorkout?.workout !== "Rest" && (
            <TouchableOpacity style={styles.beginButton} onPress={onBegin}>
              <Text style={styles.beginButtonText}>begin</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Weekly Schedule */}
      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleTitle}>This Week 🗓️</Text>
        {schedule.map(({ scheduled_date, focus }) => (
          <View key={scheduled_date} style={styles.scheduleRow}>
            <Text style={styles.scheduleDay}>
              {scheduled_date} {">"}{" "}
            </Text>
            <Text style={styles.scheduleWorkout}>{focus}</Text>
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
    justifyContent: "center",
    backgroundColor: "#4A2318",
    width: 40,
    height: 40,
    borderRadius: 20,
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
  addButtonContainer: {
    position: "relative",
  },
  optionsContainer: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#4A2318",
    borderRadius: 10,
    // padding: 8,
    paddingHorizontal: 16,
    // paddingVertical: 8,
    marginTop: 8,
    width: 200,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 233, 213, 0.1)",
  },
  optionText: {
    color: "#FFE9D5",
    fontWeight: "bold",
    fontSize: 14,
  },
  workoutDuration: {
    color: "#4A2318",
    fontWeight: "bold",
    fontSize: 14,
  },
});
