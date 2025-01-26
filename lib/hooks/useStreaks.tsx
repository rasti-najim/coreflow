import { useEffect, useState } from "react";
import supabase from "../supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Streak = {
  count: number;
  level: string;
  emoji: string;
};

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) {
        setStreak(null);
        setIsLoading(false);
        return;
      }

      try {
        // Get user's timezone from AsyncStorage
        const userTimezone = await AsyncStorage.getItem(`timezone_${user.id}`);

        // First get the user's last check-in date and current streak
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("last_checkin_date, current_streak")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        // Check if the user has missed a day using user's timezone
        const lastCheckin = userData?.last_checkin_date
          ? DateTime.fromISO(userData.last_checkin_date, {
              zone: userTimezone || "local",
            })
          : null;
        const today = DateTime.now()
          .setZone(userTimezone || "local")
          .startOf("day");
        const hasSkippedDay =
          lastCheckin && today.diff(lastCheckin, "days").days > 1;

        // If user has skipped a day, their streak is 0
        const effectiveStreak = hasSkippedDay
          ? 0
          : userData?.current_streak || 0;

        // Get the streak level based on the effective streak
        const { data: streakLevel, error: streakError } = await supabase
          .from("streak_levels")
          .select("name, emoji")
          .lte("streak_count", effectiveStreak)
          .order("streak_count", { ascending: false })
          .limit(1)
          .single();

        if (streakError) throw streakError;

        setStreak({
          count: effectiveStreak,
          level: streakLevel?.name || "",
          emoji: streakLevel?.emoji || "",
        });

        // If streak should be 0 but isn't in the database, update it
        if (hasSkippedDay && userData?.current_streak > 0) {
          await supabase
            .from("users")
            .update({ current_streak: 0 })
            .eq("id", user.id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch streak")
        );
        console.error("Error fetching streak:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, [user]);

  return { streak, isLoading, error };
}
