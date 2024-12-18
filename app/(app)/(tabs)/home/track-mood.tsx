import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/components/auth-context";
import supabase from "@/lib/supabase";
import { DateTime } from "luxon";
import { FontAwesome } from "@expo/vector-icons";
export default function Page() {
  const { user } = useAuth();
  const [mood, setMood] = useState("");
  const router = useRouter();
  const safeArea = useSafeAreaInsets();

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const handleAddUpdate = async () => {
    // Handle saving the mood update
    console.log("Mood update:", mood);

    try {
      const { data, error } = await supabase
        .from("progress")
        .insert({
          mood_description: mood,
          entry_type: "mood",
          user_id: user.id,
          added_on: DateTime.now().toISODate(),
        })
        .select();

      if (error) {
        console.error("Error adding mood update:", error);
      } else {
        console.log("Mood update added successfully:", data);
      }

      router.dismiss();
    } catch (error) {
      console.error("Error adding mood update:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: safeArea.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => router.dismiss()}
          >
            <FontAwesome name="times" size={24} color="#4A2318" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Add Text Update</Text>
        <Text style={styles.subtitle}>
          Describe your current mood or status:
        </Text>

        <TextInput
          style={styles.input}
          value={mood}
          onChangeText={setMood}
          multiline
          placeholder="I feel great and starting to see abs..."
          placeholderTextColor="#666666"
          autoFocus
        />

        <TouchableOpacity
          style={[styles.button, { opacity: mood.length > 0 ? 1 : 0.5 }]}
          onPress={handleAddUpdate}
          disabled={mood.length === 0}
        >
          <Text style={styles.buttonText}>add update</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dismissButton: {
    padding: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 40,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#4A2318",
    paddingBottom: 8,
    marginBottom: 40,
  },
  button: {
    borderWidth: 1,
    borderColor: "#4A2318",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
