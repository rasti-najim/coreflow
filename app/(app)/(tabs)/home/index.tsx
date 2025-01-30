import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";
import { calculateConsistency, ConsistencyStats } from "@/lib/consistency";
import Superwall from "@superwall/react-native-superwall";
import { requestReview } from "@/lib/store-review";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import * as Notifications from "expo-notifications";
import { checkAndUpdateTimezone } from "@/lib/timezone";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStreak } from "@/lib/hooks/useStreaks";
import { usePostHog } from "posthog-react-native";

type Session = {
  focus: string;
  is_custom: boolean;
  scheduled_date: string;
  session_id: string;
  status: string;
};

type Streak = {
  count: number;
  level: string;
  emoji: string;
};

export default function Page() {
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const [schedule, setSchedule] = useState<Session[]>([]);
  const [todaySession, setTodaySession] = useState<Session | undefined>();
  const [showOptions, setShowOptions] = useState(false);
  const [duration, setDuration] = useState<string>("");
  const posthog = usePostHog();
  const { streak, isLoading: isStreakLoading } = useStreak();

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  // useEffect(() => {
  //   const setupNotifications = async () => {
  //     const token = await registerForPushNotificationsAsync();
  //     if (token) {
  //       setExpoPushToken(token);
  //       const { error } = await supabase
  //         .from("users")
  //         .update({ push_token: token })
  //         .eq("id", user.id);

  //       if (error) {
  //         console.error("Error saving push token:", error);
  //       }
  //     }
  //     requestReview(user.id);
  //   };

  //   setupNotifications();
  //   notificationListener.current =
  //     Notifications.addNotificationReceivedListener((notification) => {
  //       setNotification(notification);
  //     });

  //   responseListener.current =
  //     Notifications.addNotificationResponseReceivedListener((response) => {
  //       console.log(response);
  //     });

  //   return () => {
  //     notificationListener.current &&
  //       Notifications.removeNotificationSubscription(
  //         notificationListener.current
  //       );
  //     responseListener.current &&
  //       Notifications.removeNotificationSubscription(responseListener.current);
  //   };
  // }, []);

  useFocusEffect(
    useCallback(() => {
      const checkAndRequestReview = async () => {
        const shouldRequest = await AsyncStorage.getItem("shouldRequestReview");
        if (shouldRequest === "true") {
          await AsyncStorage.removeItem("shouldRequestReview");
          await requestReview(user.id);
        }
      };
      checkAndRequestReview();
    }, [])
  );

  useEffect(() => {
    console.log("user", user);
    const getDuration = async () => {
      const { data: duration } = await supabase
        .from("user_preferences")
        .select("session_duration")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      setDuration(duration?.session_duration || "15m");
    };
    getDuration();
  }, []);

  // useEffect(() => {
  //   const checkSchedule = async () => {
  //     const futureSessions = await checkScheduleStatus(user.id);
  //     console.log("futureSessions", futureSessions);
  //   };

  //   checkSchedule();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      const loadSchedule = async () => {
        try {
          const today = DateTime.now();
          const mondayOfThisWeek = today.startOf("week");
          const weekStartStr = mondayOfThisWeek.toISODate();

          const { data: weekSchedule } = await supabase
            .from("weekly_sessions")
            .select("*")
            .eq("user_id", user.id)
            .gte("week_start", weekStartStr)
            // .gte("week_start", weekStartStr)
            // .lte("week_end", weekEndStr)
            .order("week_start", { ascending: true })
            .limit(1)
            .single();

          console.log("weekSchedule", weekSchedule);

          if (weekSchedule) {
            setSchedule(weekSchedule.sessions);

            // Find today's workout from the sessions array
            const session = weekSchedule.sessions.find(
              (session: any) => session.scheduled_date === today.toISODate()
            );

            setTodaySession(session);
          }
        } catch (error) {
          console.error("Error loading schedule:", error);
        }
      };

      loadSchedule();
    }, [])
  );

  useEffect(() => {
    const updateTimezone = async () => {
      if (!user?.id) return;
      await checkAndUpdateTimezone(user.id);
    };

    updateTimezone();
  }, []);

  const onBegin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Superwall.shared.register("beginWorkoutSession").then(() => {
      posthog.capture("user_started_wscheduled_workout", {
        duration: duration,
        session_id: todaySession?.session_id,
      });
      router.push({
        pathname: "/home/session",
        params: {
          session_id: todaySession?.session_id,
          duration: duration,
          focus: todaySession?.focus,
        },
      });
    });
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

            Superwall.shared.register("trackProgressPhoto").then(() => {
              router.push("/home/track-picture");
            });
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

            Superwall.shared.register("trackProgressMood").then(() => {
              router.push("/home/track-mood");
            });
          }}
        >
          <FontAwesome6 name="note-sticky" size={18} color="#FFE9D5" />
          <Text style={styles.optionText}>Track Progress Note</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowOptions(false);

            Superwall.shared.register("startCustomWorkoutSession").then(() => {
              router.push("/home/custom");
            });
          }}
        >
          <FontAwesome6 name="mattress-pillow" size={18} color="#FFE9D5" />
          <Text style={styles.optionText}>Create Custom Workout</Text>
        </TouchableOpacity> */}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = DateTime.fromISO(dateString);
    return date.toFormat("EEE");
  };

  const handleStreakPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!streak?.count) {
      router.push({
        pathname: "/home/streak-level",
        params: {
          streak: 0,
          level: "Streaks",
          emoji: "🔥",
          nextLevel: 0,
        },
      });
    } else {
      router.push({
        pathname: "/home/streak-level",
        params: {
          streak: streak.count,
          level: streak.level,
          emoji: streak.emoji,
          nextLevel: 0,
        },
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFE9D5" }}>
      <ScrollView
        style={[styles.container, { paddingTop: safeArea.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>coreflow</Text>
          <TouchableOpacity
            style={styles.streakButton}
            onPress={handleStreakPress}
          >
            <Text style={styles.streakText}>
              {isStreakLoading
                ? "..."
                : `${streak?.count} 🔥${
                    streak?.emoji !== "🔥" ? ` ${streak?.emoji}` : ""
                  }`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Workout */}
        <View style={styles.todayContainer}>
          <Text style={styles.day}>{DateTime.now().toFormat("EEEE")} ✨</Text>
          <View style={styles.workoutRow}>
            <Text style={styles.workout}>
              {todaySession?.status === "completed"
                ? "🎉 You completed your workout!"
                : todaySession?.focus
                ? `${duration}m ${todaySession.focus}`
                : "No workout scheduled. Enjoy your day!"}
            </Text>

            {todaySession?.status !== "completed" &&
              (todaySession?.focus ? (
                <TouchableOpacity style={styles.beginButton} onPress={onBegin}>
                  <Text style={styles.beginButtonText}>begin</Text>
                </TouchableOpacity>
              ) : null)}
          </View>
        </View>

        {/* Weekly Schedule */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>This Week 🗓️</Text>
          {schedule.map(({ scheduled_date, focus, status }) => (
            <View key={scheduled_date} style={styles.scheduleRow}>
              <Text style={styles.scheduleDay}>
                {formatDate(scheduled_date)} {">"}
              </Text>
              <Text
                style={[
                  styles.scheduleWorkout,
                  // status === "completed" && styles.completedWorkout,
                  // status === "skipped" && styles.skippedWorkout,
                ]}
              >
                {focus}
              </Text>
              {status === "completed" && (
                <FontAwesome6
                  name="check"
                  size={16}
                  color="#40874C"
                  style={styles.statusIcon}
                />
              )}
              {status === "skipped" && (
                <FontAwesome6
                  name="xmark"
                  size={16}
                  color="#FF6B6B"
                  style={styles.statusIcon}
                />
              )}
            </View>
          ))}
        </View>

        {/* Consistency Tracking */}
        {/* <View style={styles.consistencyContainer}>
          <View style={styles.consistencyHeader}>
            <Text style={styles.consistencyTitle}>
              Patience & Persistence 🔑
            </Text>
          </View>
          <Text style={styles.consistencyText}>
            <Text style={{ textDecorationLine: "underline" }}>
              {consistency.weeklyStreak} weeks
            </Text>{" "}
            consistent
          </Text>
          <Text style={styles.consistencyText}>
            <Text style={{ textDecorationLine: "underline" }}>
              {consistency.currentWeekCount}{" "}
              {consistency.currentWeekCount === 1 ? "day" : "days"}
            </Text>{" "}
            consistent this week
          </Text>
          {/* <Text style={styles.consistencyText}>
            <Text style={{ textDecorationLine: "underline" }}>
              {consistency.dailyStreak}{" "}
              {consistency.dailyStreak === 1 ? "day" : "days"}
            </Text>{" "}
            daily streak
          </Text> */}
        {/* </View> */}

        <View style={styles.consistencyContainer}>
          <View style={styles.consistencyHeader}>
            <Text style={styles.consistencyTitle}>Custom Session</Text>
          </View>
          <TouchableOpacity
            style={styles.customSessionButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Superwall.shared
                .register("startCustomWorkoutSession")
                .then(() => {
                  posthog.capture("user_started_custom_workout");
                  router.push("/home/custom");
                });
            }}
          >
            <Text style={styles.customSessionButtonText}>
              Choose duration + focus
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowOptions(!showOptions);
          }}
        >
          <FontAwesome6 name="plus" size={18} color="#FFE9D5" />
        </TouchableOpacity>
        <ProgressOptions />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A2318",
    fontFamily: "matolha-regular",
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
    alignItems: "center",
  },
  scheduleDay: {
    fontWeight: "bold",
    fontSize: 18,
    opacity: 0.7,
    width: 80,
  },
  scheduleWorkout: {
    fontSize: 18,
    fontWeight: "bold",
    opacity: 0.7,
    marginRight: 8,
  },
  completedWorkout: {
    color: "#40874C",
  },
  skippedWorkout: {
    color: "#FF6B6B",
  },
  statusIcon: {
    marginLeft: 4,
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
    position: "absolute",
    bottom: 32,
    right: 32,
    zIndex: 1000,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A2318",
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionsContainer: {
    position: "absolute",
    bottom: "100%",
    right: 0,
    backgroundColor: "#4A2318",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
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
  customSessionButton: {
    backgroundColor: "#4A2318",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  customSessionButtonText: {
    color: "#FFE9D5",
    fontWeight: "bold",
    fontSize: 14,
  },
  streakButton: {
    backgroundColor: "#4A2318",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  streakText: {
    color: "#FFE9D5",
    fontWeight: "bold",
    fontSize: 16,
  },
});
