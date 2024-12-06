import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";

interface ExerciseLayoutProps {
  title: string;
  description: string;
  type: "Warmup" | "Cooldown" | "Target";
  animationSource: string;
  duration: number; // in seconds
  onComplete?: () => void;
}

export const ExerciseLayout = ({
  title,
  description,
  type,
  animationSource,
  duration,
  onComplete,
}: ExerciseLayoutProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const animation = useRef<LottieView>(null);
  const [fontsLoaded] = useFonts({
    KeeponTruckin: require("../assets/fonts/KeeponTruckin.ttf"),
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval);
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(true);
    animation.current?.play();
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(false);
    animation.current?.pause();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type}: {title}
      </Text>
      <Text style={styles.description}>{description}</Text>

      <LottieView
        ref={animation}
        source={{ uri: animationSource }}
        autoPlay={true}
        loop={true}
        style={styles.animation}
      />

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{timeLeft} sec</Text>
      </View>

      {!isActive ? (
        <TouchableOpacity style={styles.beginButton} onPress={handleStart}>
          <Text style={styles.beginButtonText}>begin</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.beginButton} onPress={handleStop}>
          <Text style={styles.beginButtonText}>stop</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.quitButton}>
          <Text style={styles.quitButtonText}>quit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.differentExerciseButton}>
          <Text style={styles.differentExerciseButtonText}>
            different exercise
          </Text>
          <FontAwesome name="refresh" size={16} color="#4A2318" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  description: {
    fontSize: 18,
    color: "#4A2318",
    marginBottom: 32,
    alignSelf: "flex-start",
    lineHeight: 24,
  },
  animation: {
    width: "100%",
    height: 300,
    // marginBottom: 32,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerText: {
    fontSize: 48,
    fontFamily: "KeeponTruckin",
    color: "#4A2318",
    textAlign: "center",
  },
  beginButton: {
    backgroundColor: "#4A2318",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  beginButtonText: {
    color: "#FFE9D5",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
  },
  quitButton: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4A2318",
  },
  quitButtonText: {
    fontSize: 18,
    color: "#FF0000",
    fontWeight: "bold",
    textAlign: "center",
  },
  differentExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4A2318",
  },
  differentExerciseButtonText: {
    fontSize: 18,
    color: "#4A2318",
    fontWeight: "bold",
    textAlign: "center",
  },
});
