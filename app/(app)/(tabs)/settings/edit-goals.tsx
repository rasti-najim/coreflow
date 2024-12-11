import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SelectGoals } from "@/components/select-goals";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { GoalSelector } from "@/components/goal-selector";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { Redirect } from "expo-router";

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
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const hasChanges = () => {
    if (selectedGoals.length !== initialGoals.length) return true;
    return !selectedGoals.every((goal) => initialGoals.includes(goal));
  };

  const handleSave = async () => {
    try {
      // Find goals to add (goals that are in selectedGoals but not in initialGoals)
      const goalsToAdd = selectedGoals.filter(
        (goal) => !initialGoals.includes(goal)
      );

      // Find goals to remove (goals that are in initialGoals but not in selectedGoals)
      const goalsToRemove = initialGoals.filter(
        (goal) => !selectedGoals.includes(goal)
      );

      console.log("goalsToAdd", goalsToAdd);
      console.log("goalsToRemove", goalsToRemove);

      // Insert new goals if any
      if (goalsToAdd.length > 0) {
        const { error: insertError } = await supabase.from("user_goals").insert(
          goalsToAdd.map((goal) => ({
            user_id: user.id,
            name: goal,
          }))
        );

        if (insertError) {
          console.error("Error inserting goals:", insertError);
          return;
        }
      }

      // Delete removed goals if any
      if (goalsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("user_goals")
          .delete()
          .eq("user_id", user.id)
          .in("name", goalsToRemove);

        if (deleteError) {
          console.error("Error deleting goals:", deleteError);
          return;
        }
      }

      // Update the initial state to match current selection
      setInitialGoals(selectedGoals);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchGoals = async () => {
      const { data: goals, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.id);
      console.log("user", user.id);
      console.log("goals", goals);

      if (error) {
        console.error(error);
      }

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
