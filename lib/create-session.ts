import supabase from "./supabase";

export const createSession = async (
  goals: string[],
  sessionDuration: number,
  level: "beginner" | "intermediate" | "advanced"
) => {
  const { data: warmup } = await supabase
    .from("exercises")
    .select("*")
    .eq("type", "warmup");
};
