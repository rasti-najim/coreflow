import supabase from "./supabase";
import { DateTime } from "luxon";

type WeeklySession = "3" | "5" | "everyday";
type Focus = "full body" | "upper body" | "lower body" | "core";
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
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
  startDate: DateTime = DateTime.now(),
  includeToday: boolean = false
): DateTime {
  const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
    day
  );
  const currentDay = startDate.weekday; // 1 = Monday, 7 = Sunday
  const targetDay = dayIndex + 1; // Add 1 because our days start from Monday=1

  // If we want to include today and it matches the target day
  if (includeToday && currentDay === targetDay && weekOffset === 0) {
    return startDate;
  }

  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }

  return startDate.plus({ days: daysToAdd + weekOffset * 7 });
}

export function createMonthlyRoutine(
  weekly_preference: WeeklySession,
  startDate: DateTime = DateTime.now(),
  weeksToSchedule: number = 4,
  includeToday: boolean = false
): ScheduledWorkout[] {
  const schedule: ScheduledWorkout[] = [];

  for (let week = 0; week < weeksToSchedule; week++) {
    const weeklySchedule = createWeeklyRoutine(
      weekly_preference,
      week,
      startDate,
      includeToday && week === 0 // Only include today for the first week
    );
    schedule.push(...weeklySchedule);
  }

  return schedule;
}

export function createWeeklyRoutine(
  weekly_preference: WeeklySession,
  weekOffset: number = 0,
  startDate: DateTime = DateTime.now(),
  includeToday: boolean = false
): ScheduledWorkout[] {
  // Define both weekday and full week arrays
  const weekdays: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const fullWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Choose which array to use based on preference
  const availableDays = weekly_preference === "everyday" ? fullWeek : weekdays;
  const schedule: ScheduledWorkout[] = [];

  switch (weekly_preference) {
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
          date: getNextDate(day as Day, weekOffset, startDate, includeToday),
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

      weekdays.forEach((day, index) => {
        let focus: Focus;
        if (index === 0 || index === 4) {
          focus = "full body";
        } else {
          focus = midWeekFocuses[index - 1];
        }

        schedule.push({
          date: getNextDate(day, weekOffset, startDate, includeToday),
          focus,
        });
      });
      break;
    }

    case "everyday": {
      const focuses: Focus[] = [
        "full body",
        "upper body",
        "lower body",
        "core",
        "full body",
        "upper body",
        "lower body",
      ];

      availableDays.forEach((day, index) => {
        schedule.push({
          date: getNextDate(day as Day, weekOffset, startDate, includeToday),
          focus: focuses[index % focuses.length], // Use modulo to cycle through focuses
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
  focus: Focus,
  userId: string,
  date: DateTime = DateTime.now()
): Promise<string> {
  // Returns the session ID
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

  // Create session first
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      focus: focus,
      scheduled_date: date.toISODate(),
      status: "scheduled",
      is_custom: false,
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Create session exercises
  const exercises = [
    {
      session_id: session.id,
      exercise_id: warmup_exercise?.id,
      sequence: 1,
      duration: EXERCISE_TIMING.TOTAL_TIME,
    },
    ...(target_exercises?.map((ex, index) => ({
      session_id: session.id,
      exercise_id: ex.id,
      sequence: index + 2,
      duration: EXERCISE_TIMING.TOTAL_TIME,
    })) ?? []),
    {
      session_id: session.id,
      exercise_id: cooldown_exercise?.id,
      sequence: (target_exercises?.length ?? 0) + 2,
      duration: EXERCISE_TIMING.TOTAL_TIME,
    },
  ].filter(
    (
      ex
    ): ex is {
      session_id: string;
      exercise_id: string;
      sequence: number;
      duration: number;
    } => Boolean(ex.exercise_id)
  );

  // Insert all session exercises in a single query
  const { error: exercisesError } = await supabase
    .from("session_exercises")
    .insert(exercises);

  if (exercisesError) throw exercisesError;

  return session.id;
}

export async function createSchedule(
  userId: string,
  action: ScheduleAction = "create",
  weeksToSchedule: number = 4
) {
  try {
    // Get user preferences and last session in a single query
    const [preferencesResponse, lastSessionResponse] = await Promise.all([
      supabase
        .from("user_preferences")
        .select("weekly_sessions, session_duration")
        .eq("user_id", userId)
        .limit(1)
        .single(),
      action === "extend"
        ? supabase
            .from("sessions")
            .select("scheduled_date")
            .eq("user_id", userId)
            .order("scheduled_date", { ascending: false })
            .limit(1)
            .single()
        : Promise.resolve(null),
    ]);

    if (preferencesResponse.error) throw preferencesResponse.error;

    // Determine start date
    const startDate =
      action === "extend" && lastSessionResponse?.data
        ? DateTime.fromISO(lastSessionResponse.data.scheduled_date).plus({
            days: 1,
          })
        : DateTime.now();

    // Create schedule
    const schedule = createMonthlyRoutine(
      preferencesResponse.data.weekly_sessions,
      startDate,
      weeksToSchedule,
      action === "create"
    );

    // Delete existing scheduled sessions if needed
    if (action === "update" || action === "create") {
      await supabase
        .from("sessions")
        .delete()
        .eq("user_id", userId)
        .eq("status", "scheduled")
        .gte("scheduled_date", DateTime.now().toISODate());
    }

    // Create all sessions in parallel
    const sessionPromises = schedule.map(async (day) => {
      await createSession(
        preferencesResponse.data.session_duration,
        day.focus,
        userId,
        day.date
      );
    });

    await Promise.all(sessionPromises);

    return schedule;
  } catch (error) {
    console.error("Error in createSchedule:", error);
    throw error; // Re-throw to handle in calling function
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
