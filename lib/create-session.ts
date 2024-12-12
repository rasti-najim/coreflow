import supabase from "./supabase";

export const createSession = async (
  goals: string[],
  level: "beginner" | "intermediate" | "advanced"
) => {
  const [warmup, target, cooldown] = await Promise.all([
    supabase
      .from("random_exercises")
      .select("*")
      .eq("type", "warmup")
      .eq("experience_level", level),
    supabase
      .from("random_exercises")
      .select("*")
      .eq("type", "target")
      .eq("experience_level", level),
    supabase
      .from("random_exercises")
      .select("*")
      .eq("type", "cooldown")
      .eq("experience_level", level),
  ]);

  console.log(warmup, target, cooldown);

  return {
    warmup: warmup.data,
    target: target.data,
    cooldown: cooldown.data,
  };
};
