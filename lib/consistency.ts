import supabase from "./supabase";
import { DateTime } from "luxon";

export type ConsistencyStats = {
  currentWeekCount: number;
  weeklyStreak: number;
  dailyStreak: number;
};

export async function calculateConsistency(
  userId: string
): Promise<ConsistencyStats> {
  try {
    const { data: weeklySessions, error } = await supabase
      .from("weekly_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("week_start", { ascending: true });

    if (error) {
      throw error;
    }

    const today = DateTime.now();
    const mondayOfThisWeek = today.startOf("week");
    const weekStartStr = mondayOfThisWeek.toISODate();

    // Get current week sessions
    const currentWeekSessions = weeklySessions.find(
      (session) => session.week_start >= weekStartStr
    );

    // Calculate current week consistency - only count consecutive completed sessions
    let currentWeekCount = 0;
    console.log("currentWeekSessions", currentWeekSessions);
    if (currentWeekSessions?.sessions) {
      const sortedSessions = [...currentWeekSessions.sessions].sort(
        (a, b) =>
          DateTime.fromISO(a.scheduled_date).toMillis() -
          DateTime.fromISO(b.scheduled_date).toMillis()
      );

      for (const session of sortedSessions) {
        if (session.status === "completed") {
          currentWeekCount++;
        } else if (session.status === "skipped") {
          // Break consistency if a session was skipped
          currentWeekCount = 0;
        } else if (
          session.status === "scheduled" &&
          session.scheduled_date < DateTime.now().toISODate()
        ) {
          // Break consistency if a session was scheduled in the past
          currentWeekCount = 0;
        }
      }
    }

    // Calculate weekly streak
    let weeklyStreak = 0;
    for (const weekSession of weeklySessions) {
      if (weekSession.completed_sessions >= weekSession.total_sessions) {
        weeklyStreak++;
      } else {
        break;
      }
    }

    const dailyStreak = await calculateDailyStreak(userId);

    return {
      currentWeekCount,
      weeklyStreak,
      dailyStreak,
    };
  } catch (error) {
    console.error(error);
    return {
      currentWeekCount: 0,
      weeklyStreak: 0,
      dailyStreak: 0,
    };
  }
}

async function calculateDailyStreak(userId: string) {
  const { data: allScheduledSessions, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_custom", false)
    .eq("status", "completed")
    .order("scheduled_date", { ascending: true });

  if (error || !allScheduledSessions) {
    console.error(error);
    return 0;
  }

  let dailyStreak = 0;
  let longestStreak = 0;
  let previousDate: DateTime | null = null;

  allScheduledSessions.forEach((session) => {
    const currentDate = DateTime.fromISO(session.scheduled_date!).startOf(
      "day"
    );

    if (!previousDate) {
      // First session in the list
      dailyStreak = 1;
    } else {
      // Compare currentDate with previousDate
      const diff = currentDate.diff(previousDate, "days").toObject().days;

      if (!diff) throw new Error("No difference between dates");

      if (diff === 1) {
        // Exactly 1 day apart -> increment streak
        dailyStreak += 1;
      } else if (diff > 1) {
        // More than 1 day gap -> reset streak
        dailyStreak = 1;
      }
      // If diff === 0, it means multiple sessions completed the same day
      // Typically, we don't increment the streak again because it's still the same day.
      // So do nothing in that case.
    }

    // Track the maximum streak if you want
    longestStreak = Math.max(longestStreak, dailyStreak);

    previousDate = currentDate;
  });

  return dailyStreak;
}
