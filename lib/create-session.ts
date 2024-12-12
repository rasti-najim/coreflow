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
      .eq("skill_level", level)
      .limit(1)
      .single(),
    supabase
      .from("random_exercises")
      .select("*")
      .eq("type", "target")
      .eq("skill_level", level)
      .limit(1)
      .single(),
    supabase
      .from("random_exercises")
      .select("*")
      .eq("type", "cooldown")
      .eq("skill_level", level)
      .limit(1)
      .single(),
  ]);

  console.log(
    `warmup: ${warmup.data?.name}, target: ${target.data?.name}, cooldown: ${cooldown.data?.name}`
  );

  return {
    warmup: warmup.data,
    target: target.data,
    cooldown: cooldown.data,
  };
};
