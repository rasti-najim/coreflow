import supabase from "./supabase";

type WeeklySession = "1-2" | "3" | "5";
type Focus = "full body" | "upper body" | "lower body" | "core";
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
type ScheduleAction = "create" | "update" | "extend";

export interface ScheduledWorkout {
  date: Date;
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
  startDate: Date = new Date()
): Date {
  const today = startDate;
  const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(day);
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const targetDay = dayIndex + 1; // Add 1 because our days start from Monday=1

  const date = new Date(today);
  const daysToAdd = (targetDay + 7 - currentDay) % 7;
  // Add the week offset (0 for current week, 7 for next week, etc.)
  date.setDate(date.getDate() + daysToAdd + weekOffset * 7);
  return date;
}

export function createMonthlyRoutine(
  weekly_preference: WeeklySession,
  startDate: Date = new Date(),
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
  }

  return schedule;
}

export function createWeeklyRoutine(
  weekly_preference: WeeklySession,
  weekOffset: number = 0,
  startDate: Date = new Date()
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
  weekOffset: number = 0
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
    let startDate: Date;
    switch (action) {
      case "create":
        // Start from today for new schedules
        startDate = new Date();
        break;
      case "update":
        // Start from today for updates
        startDate = new Date();
        break;
      case "extend":
        // Get the last scheduled session date
        const { data: lastSession } = await supabase
          .from("sessions")
          .select("scheduled_date")
          .eq("user_id", userId)
          .order("scheduled_date", { ascending: false })
          .limit(1)
          .single();

        // Start from the day after the last session
        startDate = lastSession
          ? new Date(lastSession.scheduled_date)
          : new Date();
        startDate.setDate(startDate.getDate() + 1);
        break;
    }

    // Create a 4-week schedule
    const schedule = createMonthlyRoutine(
      data.weekly_sessions,
      startDate,
      weekOffset
    );

    if (action === "update" || action === "create") {
      // Delete any existing scheduled (not completed) sessions
      await supabase
        .from("sessions")
        .delete()
        .eq("user_id", userId)
        .eq("status", "scheduled")
        .gte("scheduled_date", new Date().toISOString().split("T")[0]);
    }

    // Create sessions for each day in the schedule
    for (const day of schedule) {
      const session = await createSession(data.session_duration, day.focus);
      if (!session) continue;

      const { warmup_exercise, target_exercises, cooldown_exercise } = session;

      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          user_id: userId,
          focus: day.focus,
          scheduled_date: day.date,
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
