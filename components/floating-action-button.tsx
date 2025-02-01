import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ProgressOptions } from "./progress-options";

export const FloatingActionButton = () => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowOptions(!showOptions);
        }}
      >
        <FontAwesome6 name="plus" size={18} color="#FFE9D5" />
      </TouchableOpacity>
      <ProgressOptions
        show={showOptions}
        onClose={() => setShowOptions(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // position: "absolute",
    // bottom: 32,
    // right: 32,
    // zIndex: 1000,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A2318",
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
