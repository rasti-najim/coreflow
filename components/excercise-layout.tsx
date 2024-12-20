import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// import { Audio } from "expo-av";

interface ExerciseLayoutProps {
  title: string;
  description: string;
  type: "Warmup" | "Cooldown" | "Target";
  animationSource: string;
  duration: number;
  onNext?: () => void;
  onQuit?: () => void;
  onDifferentExercise?: () => void;
  totalExercises?: number;
  currentExercise?: number;
  autoPlay?: boolean;
  onAutoPlay?: () => void;
}

export const ExerciseLayout = ({
  title,
  description,
  type,
  animationSource,
  duration,
  onNext,
  onQuit,
  onDifferentExercise,
  totalExercises,
  currentExercise,
  autoPlay = false,
  onAutoPlay,
}: ExerciseLayoutProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const animation = useRef<LottieView>(null);
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    KeeponTruckin: require("../assets/fonts/KeeponTruckin.ttf"),
  });

  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(false);
    setIsCompleted(false);

    // Reset animation
    if (animation.current) {
      animation.current.reset();
    }

    // Add a small delay before auto-starting the next exercise
    if (autoPlay) {
      const timer = setTimeout(() => {
        handleStart();
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [currentExercise, duration, animationSource]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval);
            setIsActive(false);
            setIsCompleted(true);
            if (autoPlay) {
              handleNext();
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(true);
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(false);
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext?.();
  };

  // const playCompletionSound = async () => {
  //   try {
  //     const { sound } = await Audio.Sound.createAsync(
  //       require("../assets/sounds/exercise-complete.mp3")
  //     );
  //     setSound(sound);
  //     await sound.playAsync();
  //   } catch (error) {
  //     console.error("Error playing sound:", error);
  //   }
  // };

  // useEffect(() => {
  //   return sound
  //     ? () => {
  //         console.log("Unloading Sound");
  //         sound.unloadAsync();
  //       }
  //     : undefined;
  // }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      {totalExercises && currentExercise && (
        <Text style={styles.progress}>
          Exercise {currentExercise} of {totalExercises}
        </Text>
      )}

      <Text style={styles.title}>
        {type}: {title}
      </Text>
      <Text style={styles.description}>{description}</Text>

      <LottieView
        key={animationSource}
        ref={animation}
        source={{ uri: animationSource }}
        autoPlay
        loop
        style={styles.animation}
      />

      <View style={styles.timerContainer}>
        <Text style={isCompleted ? styles.completedText : styles.timerText}>
          {isCompleted ? "Complete!" : `${timeLeft} sec`}
        </Text>
      </View>

      {isCompleted ? (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentExercise === totalExercises ? "Finish" : "Next Exercise"}
          </Text>
        </TouchableOpacity>
      ) : !isActive ? (
        <TouchableOpacity style={styles.beginButton} onPress={handleStart}>
          <Text style={styles.beginButtonText}>begin</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.beginButton} onPress={handleStop}>
          <Text style={styles.beginButtonText}>stop</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>quit</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          style={[
            styles.autoPlayButton,
            autoPlay && styles.autoPlayButtonActive,
          ]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAutoPlay?.();
          }}
        >
          <View style={styles.autoPlayContent}>
            <FontAwesome
              name="forward"
              size={14}
              color={autoPlay ? "#FFE9D5" : "#4A2318"}
            />
            <Text
              style={[
                styles.autoPlayText,
                autoPlay && styles.autoPlayTextActive,
              ]}
            >
              {autoPlay ? "auto-advance" : "auto-advance"}
            </Text>
          </View>
        </TouchableOpacity> */}

        {!isCompleted && (
          <TouchableOpacity
            style={styles.differentExerciseButton}
            onPress={onDifferentExercise}
          >
            <Text style={styles.differentExerciseButtonText}>
              different exercise
            </Text>
            <FontAwesome name="refresh" size={16} color="#4A2318" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    // paddingVertical: 32,
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
    flex: 1,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // backgroundColor: "red",
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
  completedText: {
    fontSize: 48,
    fontFamily: "KeeponTruckin",
    color: "#2E8B57",
    textAlign: "center",
  },
  beginButton: {
    backgroundColor: "#4A2318",
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  progress: {
    fontSize: 18,
    color: "#4A2318",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  nextButton: {
    backgroundColor: "#4A2318",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  nextButtonText: {
    color: "#FFE9D5",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  autoPlayContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  autoPlayButton: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4A2318",
  },
  autoPlayButtonActive: {
    backgroundColor: "#4A2318",
  },
  autoPlayText: {
    fontSize: 16,
    color: "#4A2318",
    fontWeight: "bold",
  },
  autoPlayTextActive: {
    color: "#FFE9D5",
  },
  autoPlayContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
