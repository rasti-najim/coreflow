import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
export default function Page() {
  const { streak, emoji, level, nextLevel } = useLocalSearchParams<{
    streak: string;
    emoji: string;
    level: string;
    nextLevel: string;
  }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{level}</Text>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.streakText}>
          You have done{" "}
          <Text style={styles.streakNumber}>{parseInt(streak)}</Text> pilates
          sessions in a row.
        </Text>
        {/* <Text style={styles.nextLevelText}>
          Stay consistent for{" "}
          <Text style={styles.streakNumber}>{parseInt(nextLevel)}</Text> more
          day
          {parseInt(nextLevel) > 1 ? "s" : ""} to level up!
        </Text> */}
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.dismiss();
        }}
      >
        <Text style={styles.closeButtonText}>close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A2D1E",
    justifyContent: "space-between",
    padding: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    color: "#FFE9D5",
    textAlign: "center",
    marginBottom: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  streakText: {
    fontSize: 30,
    color: "#FFE9D5",
    textAlign: "center",
    marginBottom: 16,
  },
  nextLevelText: {
    fontSize: 20,
    color: "#FFE9D5",
    textAlign: "center",
    opacity: 0.8,
  },
  closeButton: {
    backgroundColor: "#FFE9D5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#4A2D1E",
    fontWeight: "bold",
  },
  streakNumber: {
    fontWeight: "bold",
  },
});
