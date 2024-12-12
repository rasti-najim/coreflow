// Types
type WeeklySession = "1-2" | "3" | "5";
type WorkoutFocus = "Core" | "Glutes" | "Arms & Shoulders" | "Legs" | "Hips";

interface ScheduleDay {
  day: string;
  workout: string | "Rest";
  duration: number;
  isHighlighted?: boolean;
  isToday?: boolean;
}

// Functions to generate schedule
function generateWeeklySchedule(
  weeklyPreference: WeeklySession,
  sessionDuration: number,
  goals: string[]
): ScheduleDay[] {
  const DAYS = ["Mon", "Tues", "Weds", "Thurs", "Fri", "Sat", "Sun"];
  const WORKOUTS: WorkoutFocus[] = [
    "Core",
    "Glutes",
    "Legs",
    "Arms & Shoulders",
    "Hips",
  ];

  // Define workout days based on preference
  const workoutDays = {
    "1-2": [1], // Tuesday
    "3": [0, 2, 4], // Mon, Wed, Fri
    "5": [0, 1, 2, 3, 4], // Mon-Fri
  }[weeklyPreference];

  const today = new Date().getDay();
  // Convert Sunday (0) to 6 for easier array mapping
  const adjustedToday = today === 0 ? 6 : today - 1;

  return DAYS.map((day, index) => {
    const isWorkoutDay = workoutDays.includes(index);
    const isToday = index === adjustedToday;

    return {
      day,
      workout: isWorkoutDay ? WORKOUTS[index % WORKOUTS.length] : "Rest",
      duration: isWorkoutDay ? sessionDuration : 0,
      isHighlighted: isWorkoutDay && index <= adjustedToday, // Highlight completed workouts
      isToday,
    };
  });
}

// Get today's workout
function getTodayWorkout(schedule: ScheduleDay[]) {
  return schedule.find((day) => day.isToday);
}

export { generateWeeklySchedule, getTodayWorkout, ScheduleDay };
