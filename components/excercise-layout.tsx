import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";

interface ExerciseLayoutProps {
  title: string;
  description: string;
  animationSource: string;
  duration: number; // in seconds
  onComplete?: () => void;
}

export const ExerciseLayout = ({
  title,
  description,
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
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.animationContainer}>
        <LottieView
          ref={animation}
          // source={animationSource}
          source={require("../assets/excercise.json")}
          autoPlay={isActive}
          loop={isActive}
          style={styles.animation}
        />
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.outerCircle}>
          {/* <View style={styles.timerTrack} /> */}
          <View
            style={[
              styles.progressTrack,
              { transform: [{ rotate: `${(timeLeft / duration) * 360}deg` }] },
            ]}
          />
          <View style={styles.innerCircle}>
            <Text style={styles.timerText}>{timeLeft}</Text>
            <Text style={styles.secondsText}>sec</Text>
          </View>
        </View>
      </View>

      {!isActive ? (
        <TouchableOpacity style={styles.beginButton} onPress={handleStart}>
          <Text style={styles.beginButtonText}>begin</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.beginButton, styles.stopButton]}
          onPress={handleStop}
        >
          <Text style={styles.beginButtonText}>stop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    // marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A2318",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  animationContainer: {
    // width: "100%",
    // height: 200,
    marginBottom: 40,
  },
  animation: {
    width: 200,
    height: 200,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  outerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#4A2318",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  timerTrack: {
    position: "absolute",
    width: "50%",
    height: "50%",
    borderRadius: 80,
    borderWidth: 10,
    borderColor: "#FFE9D5",
  },
  progressTrack: {
    position: "absolute",
    width: "140%",
    height: "140%",
    borderRadius: 112,
    borderWidth: 20,
    borderColor: "#FFE9D5",
    opacity: 0.2,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ scale: 0.8 }],
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4A2318",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "#FFE9D5",
    opacity: 0.9,
  },
  timerText: {
    fontSize: 48,
    fontFamily: "KeeponTruckin",
    fontWeight: "bold",
    color: "#FFE9D5",
  },
  secondsText: {
    fontSize: 16,
    color: "#FFE9D5",
    marginTop: -5,
  },
  beginButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "#4A2318",
    borderRadius: 10,
  },
  beginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFE9D5",
  },
  stopButton: {
    backgroundColor: "#FF4A4A",
  },
});
