import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Arrow } from "@/components/arrow";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { usePostHog } from "posthog-react-native";

const features = [
  "Pilates sessions tailored to you",
  "Detailed Exercise Animations",
  "Listen to your music",
  "Customize your routine",
  "No equipment & ease of use",
];

export default function Page() {
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const posthog = usePostHog();
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>coreflow</Text>

      {/* <View style={styles.imageContainer}>
        <View style={styles.featureList}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureItem,
                { borderBottomWidth: index === features.length - 1 ? 0 : 2 },
              ]}
            >
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Image
          source={require("@/assets/images/phone-mockup.png")}
          style={styles.image}
          contentFit="cover"
        />
      </View> */}

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
          posthog.capture("onboarding_started");
          router.push("/onboarding");
        }}
      >
        <Arrow color="#4A2318" />
      </TouchableOpacity>

      <View style={[styles.loginButton, { marginBottom: safeArea.bottom }]}>
        <TouchableOpacity
          onPress={() => {
            router.push("/login");
          }}
        >
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 60,
    fontWeight: "bold",
    marginTop: 64,
    // marginBottom: 64,
    fontFamily: "matolha-regular",
  },
  textContainer: {
    alignItems: "flex-start",
    marginBottom: 64,
  },
  heading: {
    color: "#1A1A1A",
    fontSize: 36,
    // fontFamily: "Apple-LiGothic-Medium",
    // lineHeight: 48,
    // textAlign: "left",
  },
  arrowButton: {
    marginTop: 32,
  },
  loginButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  loginText: {
    color: "#4A2318",
    fontSize: 16,
    fontWeight: "bold",
    // fontFamily: "Apple-LiGothic-Medium",
    // lineHeight: 24,
    textAlign: "left",
  },
  featureList: {
    flex: 1,
    marginRight: 20,
  },
  featureText: {
    color: "#4A2318",
    fontSize: 24,
    // lineHeight: 24,
    // textAlign: "left",
  },
  featureItem: {
    // width: "60%",
    borderBottomWidth: 2,
    borderBottomColor: "#4A2318",
    paddingVertical: 16,
    // marginBottom: 12,
  },
  image: {
    width: "40%",
    height: "90%",
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    // marginBottom: 64,
  },
});
