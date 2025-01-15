import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { SelectRoutine, SelectDuration } from "@/components/select-routine";
import { Link } from "expo-router";

export default function Page() {
  const safeArea = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 24 }]}>
      <Text style={styles.title}>routine</Text>

      <View style={styles.menuContainer}>
        <Link href="/settings/routine/sessions" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Edit Sessions Per Week</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings/routine/duration" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Edit Session Duration</Text>
          </TouchableOpacity>
        </Link>
      </View>
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
    marginBottom: 48,
    fontFamily: "matolha-regular",
  },
  sectionTitle: {
    fontSize: 32,
    color: "#000000",
    marginBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: "#4A2318",
    marginVertical: 32,
  },
  menuContainer: {
    gap: 24,
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 32,
  },
});
