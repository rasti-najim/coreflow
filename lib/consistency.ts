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
      .order("week_start", { ascending: false });

    if (error) {
      throw error;
    }

    // Get current week sessions
    const currentWeekSessions = weeklySessions.find((session) =>
      session.week_start.includes(DateTime.now().toISODate())
    );

    // Calculate current week consistency - only count consecutive completed sessions
    let currentWeekCount = 0;
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
      if (weekSession.completed_sessions > 0) {
        weeklyStreak++;
      } else {
        break;
      }
    }

    // For now, return 0 for daily streak (can implement later)
    let dailyStreak = 0;

    for (const weekSession of weeklySessions) {
      if (weekSession.completed_sessions != weekSession.total_sessions) {
        break;
      } else {
        dailyStreak++;
      }
    }

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
