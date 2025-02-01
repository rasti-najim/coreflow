import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Superwall from "@superwall/react-native-superwall";

interface ProgressOptionsProps {
  show: boolean;
  onClose: () => void;
}

export const ProgressOptions = ({ show, onClose }: ProgressOptionsProps) => {
  const router = useRouter();

  if (!show) return null;

  return (
    <View style={styles.optionsContainer}>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClose();
          Superwall.shared.register("createWorkout").then(() => {
            router.push("/home/custom");
          });
        }}
      >
        <FontAwesome6 name="dumbbell" size={18} color="#FFE9D5" />
        <Text style={styles.optionText}>Create Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClose();
          Superwall.shared.register("trackProgressPhoto").then(() => {
            router.push("/home/track-picture");
          });
        }}
      >
        <FontAwesome6 name="image" size={18} color="#FFE9D5" />
        <Text style={styles.optionText}>Track Progress Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClose();
          Superwall.shared.register("trackProgressMood").then(() => {
            router.push("/home/track-mood");
          });
        }}
      >
        <FontAwesome6 name="note-sticky" size={18} color="#FFE9D5" />
        <Text style={styles.optionText}>Track Progress Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    position: "absolute",
    bottom: "100%",
    right: 0,
    backgroundColor: "#4A2318",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    width: 200,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 233, 213, 0.1)",
  },
  optionText: {
    color: "#FFE9D5",
    fontWeight: "bold",
    fontSize: 14,
  },
});
