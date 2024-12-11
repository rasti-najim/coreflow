import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SelectGoals } from "@/components/select-goals";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { GoalSelector } from "@/components/goal-selector";
import supabase from "@/lib/supabase";

type Goal = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

const GOALS = [
  "reduce stress",
  "lose weight",
  "dream body",
  "strength w/o the gym",
  "core strength (get abs)",
  "muscle tone",
  "flexibility & mobility",
  "better posture",
];

export default function EditGoals() {
  const safeArea = useSafeAreaInsets();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [initialGoals, setInitialGoals] = useState<string[]>([]);

  const hasChanges = () => {
    if (selectedGoals.length !== initialGoals.length) return true;
    return !selectedGoals.every((goal) => initialGoals.includes(goal));
  };

  const handleSave = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user || !user.user) return;
      const { data, error } = await supabase
        .from("user_goals")
        .insert({ name: selectedGoals })
        .eq("user_id", user.user.id);
      if (error) {
        console.error(error);
      } else {
        setInitialGoals(selectedGoals);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchGoals = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user || !user.user) return;
      const { data: goals, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.user.id);
      if (goals) {
        const goalNames = goals.map((goal) => goal.name);
        setSelectedGoals(goalNames);
        setInitialGoals(goalNames);
      }
    };
    fetchGoals();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>goals</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !hasChanges() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges()}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      <GoalSelector
        goals={GOALS}
        selectedGoals={selectedGoals}
        onSelectGoal={setSelectedGoals}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A2318",
    fontFamily: "Margin-DEMO",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 48,
  },
  saveButton: {
    backgroundColor: "#4A2318",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFE9D5",
    fontSize: 16,
    fontWeight: "bold",
  },
});
