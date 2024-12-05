import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Arrow } from "@/components/arrow";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";

export default function Page() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>coreflow</Text>

      <View style={styles.textContainer}>
        <Text style={[styles.heading]}>Discover the</Text>
        <Text style={[styles.heading]}>perfect pilates</Text>
        <Text style={[styles.heading]}>routine for you</Text>
      </View>

      <TouchableOpacity
        style={styles.arrowButton}
        onPress={async () => {
          //   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          router.push("/onboarding");
        }}
      >
        <Arrow color="#4A2318" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#FFE4DA",
    backgroundColor: "#FFE9D5",
    padding: 24,
  },
  logo: {
    color: "#3D1D1D",
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 64,
    // marginBottom: 64,
    fontFamily: "Margin-DEMO",
  },
  textContainer: {
    alignItems: "flex-start",
    marginBottom: 64,
  },
  heading: {
    color: "#1A1A1A",
    fontSize: 36,
    fontFamily: "Apple-LiGothic-Medium",
    lineHeight: 48,
    textAlign: "left",
  },
  arrowButton: {
    marginTop: 32,
  },
});
