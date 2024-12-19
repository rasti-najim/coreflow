import supabase from "./supabase";
import { DateTime } from "luxon";

type WeeklySession = "1-2" | "3" | "5";
type Focus = "full body" | "upper body" | "lower body" | "core";
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
type ScheduleAction = "create" | "update" | "extend";

export interface ScheduledWorkout {
  date: DateTime;
  focus: Focus;
}

export const FOCUS_MAP = {
  "full body": [
    "Abs",
    "Arms",
    "Breathing",
    "Core",
    "Glutes",
    "Mobility & Flexibility",
    "Upper Body",
  ],
  "upper body": ["Arms", "Upper Body"],
  "lower body": ["Glutes", "Mobility & Flexibility"],
  core: ["Abs", "Core"],
} as const;

const EXERCISE_TIMING = {
  READ_TIME: 15, // seconds to read exercise
  PERFORM_TIME: 45, // seconds to perform exercise
  TOTAL_TIME: 60, // total time per exercise
  WARMUP_COOLDOWN_TIME: 120, // 2 minutes for warmup/cooldown combined
};

function getNextDate(
  day: Day,
  weekOffset: number = 0,
  startDate: DateTime = DateTime.now()
): DateTime {
  const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(day);
  const currentDay = startDate.weekday; // 1 = Monday, 7 = Sunday
  const targetDay = dayIndex + 1; // Add 1 because our days start from Monday=1

  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }

  return startDate.plus({ days: daysToAdd + weekOffset * 7 });
}

export function createMonthlyRoutine(
  weekly_preference: WeeklySession,
  startDate: DateTime = DateTime.now(),
  weeksToSchedule: number = 4
): ScheduledWorkout[] {
  const schedule: ScheduledWorkout[] = [];

  // Create 4 weeks of workouts
  for (let week = 0; week < weeksToSchedule; week++) {
    const weeklySchedule = createWeeklyRoutine(
      weekly_preference,
      week,
      startDate
    );
    schedule.push(...weeklySchedule);

    console.log("weeklySchedule", weeklySchedule);
  }

  return schedule;
}

export function createWeeklyRoutine(
  weekly_preference: WeeklySession,
  weekOffset: number = 0,
  startDate: DateTime = DateTime.now()
): ScheduledWorkout[] {
  const availableDays: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const schedule: ScheduledWorkout[] = [];

  switch (weekly_preference) {
    case "1-2": {
      // Randomly choose 1 or 2 sessions
      const sessionCount = Math.random() < 0.5 ? 1 : 2;
      const shuffledDays = shuffle(availableDays);
      const selectedDays = shuffledDays.slice(0, sessionCount);

      selectedDays.sort(
        (a, b) => availableDays.indexOf(a) - availableDays.indexOf(b)
      );

      selectedDays.forEach((day) => {
        schedule.push({
          date: getNextDate(day, weekOffset, startDate),
          focus: "full body",
        });
      });
      break;
    }

    case "3": {
      const workoutDays: Day[] = ["Mon", "Wed", "Fri"];
      const focuses: Focus[] = shuffle<Focus>([
        "full body",
        "upper body",
        "lower body",
        "core",
      ]).slice(0, 3);

      workoutDays.forEach((day, index) => {
        schedule.push({
          date: getNextDate(day, weekOffset, startDate),
          focus: focuses[index],
        });
      });
      break;
    }

    case "5": {
      const midWeekFocuses: Focus[] = shuffle([
        "upper body",
        "lower body",
        "core",
      ]);

      availableDays.forEach((day, index) => {
        let focus: Focus;
        if (index === 0 || index === 4) {
          focus = "full body";
        } else {
          focus = midWeekFocuses[index - 1];
        }

        schedule.push({
          date: getNextDate(day, weekOffset, startDate),
          focus,
        });
      });
      break;
    }
  }

  return schedule;
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function createSession(
  sessionDuration: number, // in minutes
  focus: Focus
): Promise<{
  warmup_exercise: string;
  target_exercises: string[];
  cooldown_exercise: string;
}> {
  const totalSessionSeconds = sessionDuration * 60;
  const availableTimeForTargets =
    totalSessionSeconds - EXERCISE_TIMING.WARMUP_COOLDOWN_TIME;
  const numberOfTargetExercises = Math.floor(
    availableTimeForTargets / EXERCISE_TIMING.TOTAL_TIME
  );

  // Get warmup exercise
  const { data: warmup_exercise } = await supabase
    .from("random_exercises")
    .select("id")
    .eq("type", "warmup")
    .limit(1)
    .single();

  // Get target exercises based on focus
  let targetQuery = supabase
    .from("random_exercises")
    .select("id")
    .eq("type", "target");

  // Add focus-specific filters using the FOCUS_MAP
  if (focus !== "full body") {
    targetQuery = targetQuery.overlaps("focus", FOCUS_MAP[focus]);
  }

  const { data: target_exercises } = await targetQuery.limit(
    numberOfTargetExercises
  );

  // Get cooldown exercise
  const { data: cooldown_exercise } = await supabase
    .from("random_exercises")
    .select("id")
    .eq("type", "cooldown")
    .limit(1)
    .single();

  return {
    warmup_exercise: warmup_exercise?.id ?? "",
    target_exercises: target_exercises?.map((ex) => ex.id) ?? [],
    cooldown_exercise: cooldown_exercise?.id ?? "",
  };
}

export async function createSchedule(
  userId: string,
  action: ScheduleAction = "create",
  weeksToSchedule: number = 4
) {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("weekly_sessions, session_duration")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    // Get the start date based on action
    let startDate: DateTime;
    switch (action) {
      case "create":
      case "update":
        startDate = DateTime.now();
        break;
      case "extend":
        const { data: lastSession } = await supabase
          .from("sessions")
          .select("scheduled_date")
          .eq("user_id", userId)
          .order("scheduled_date", { ascending: false })
          .limit(1)
          .single();

        startDate = lastSession
          ? DateTime.fromISO(lastSession.scheduled_date)
          : DateTime.now();
        startDate = startDate.plus({ days: 1 });
        break;
    }

    // Create a 4-week schedule
    const schedule = createMonthlyRoutine(
      data.weekly_sessions,
      startDate,
      weeksToSchedule
    );

    console.log("schedule", schedule);

    if (action === "update" || action === "create") {
      // Delete any existing scheduled (not completed) sessions
      await supabase
        .from("sessions")
        .delete()
        .eq("user_id", userId)
        .eq("status", "scheduled")
        .gte("scheduled_date", DateTime.now().toISODate());
    }

    // Create sessions for each day in the schedule
    for (const day of schedule) {
      const session = await createSession(data.session_duration, day.focus);
      if (!session) continue;

      const { warmup_exercise, target_exercises, cooldown_exercise } = session;

      console.log(warmup_exercise, target_exercises, cooldown_exercise);

      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          user_id: userId,
          focus: day.focus,
          scheduled_date: day.date.toISODate(),
          warmup_exercise: warmup_exercise,
          target_exercises: target_exercises,
          cooldown_exercise: cooldown_exercise,
          status: "scheduled",
          is_custom: false,
        })
        .select();

      if (sessionError) {
        throw sessionError;
      }

      console.log(sessionData);
    }

    return schedule;
  } catch (error) {
    console.error(error);
  }
}

export async function checkScheduleStatus(userId: string) {
  try {
    const today = DateTime.now().toISODate();

    const { data: futureSessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "scheduled")
      .eq("is_custom", false)
      .gte("scheduled_date", today)
      .order("scheduled_date", { ascending: true });

    if (error) {
      throw error;
    }

    if (!futureSessions || futureSessions.length === 0) {
      return await createSchedule(userId, "extend");
    }

    // Check if less than a week of sessions remaining
    const lastSessionDate = DateTime.fromISO(
      futureSessions[futureSessions.length - 1].scheduled_date
    );
    const daysRemaining = lastSessionDate.diff(DateTime.now(), "days").days;

    if (daysRemaining <= 7) {
      console.log("creating future sessions");
      return await createSchedule(userId, "extend");
    }

    console.log("no future sessions created");

    return futureSessions;
  } catch (error) {
    console.error(error);
  }
}
