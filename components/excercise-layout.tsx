import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio, AVPlaybackStatus } from "expo-av";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 375; // 375 is standard iPhone width

const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(Math.min(newSize, size * 1.2)); // Cap the maximum size
};

interface ExerciseLayoutProps {
  id: string;
  title: string;
  description: string;
  focus: string;
  type: "Warmup" | "Cooldown" | "Target";
  animationSource: string;
  voiceDescriptionSource: string;
  duration: number;
  onNext?: () => void;
  onQuit?: () => void;
  onDifferentExercise?: (
    id: string,
    type: "warmup" | "cooldown" | "target",
    focus: string
  ) => void;
  totalExercises?: number;
  currentExercise?: number;
  autoPlay?: boolean;
  onAutoPlay?: () => void;
  isSavingProgress?: boolean;
  isDescriptionExpanded?: boolean;
  onShowDescription?: () => void;
}

export const ExerciseLayout = ({
  id,
  title,
  description,
  focus,
  type,
  animationSource,
  voiceDescriptionSource,
  duration,
  onNext,
  onQuit,
  onDifferentExercise,
  totalExercises,
  currentExercise,
  autoPlay = false,
  onAutoPlay,
  isSavingProgress = false,
  onShowDescription,
}: ExerciseLayoutProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const animation = useRef<LottieView>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [onRepeat, setOnRepeat] = useState(false);
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

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
          if (time === 4) {
            handlePlayCountdown();
          }
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

  const handlePlayVoice = async () => {
    console.log("handlePlayVoice", voiceDescriptionSource);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (isPlaying) {
        await sound?.stopAsync();
        setIsPlaying(false);
        return;
      }

      // Unload any existing sound first
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: voiceDescriptionSource },
        { shouldPlay: true, isLooping: false }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound?.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          if (onRepeat) {
            // Add a delay before replaying
            setTimeout(async () => {
              try {
                await newSound.replayAsync();
              } catch (error) {
                console.error("Error replaying sound:", error);
              }
            }, 1000); // 1 second delay
          } else {
            setIsPlaying(false);
          }
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
      // Add user feedback here if needed
    }
  };

  const handlePlayCountdown = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/countdown.mp3")
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error playing countdown sound:", error);
    }
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

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    };

    setupAudio();
  }, []);

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
      <TouchableOpacity
        onPress={onShowDescription}
        style={styles.descriptionContainer}
      >
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <FontAwesome name="chevron-down" size={16} color="#4A2318" />
      </TouchableOpacity>

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
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={isSavingProgress}
        >
          <Text style={styles.nextButtonText}>
            {currentExercise === totalExercises
              ? "Finish"
              : isSavingProgress
              ? "Saving..."
              : "Next Exercise"}
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

      <View style={styles.audioControls}>
        <TouchableOpacity
          style={styles.playVoiceButton}
          onPress={handlePlayVoice}
        >
          <FontAwesome
            name={isPlaying ? "stop" : "play"}
            size={20}
            color="#4A2318"
          />
          <Text style={styles.playVoiceButtonText}>
            {isPlaying ? "Stop Voice" : "Play Voice"}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.repeatButton, onRepeat && styles.repeatButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setOnRepeat(!onRepeat);
          }}
        >
          <FontAwesome
            name="repeat"
            size={20}
            color={onRepeat ? "#FFE9D5" : "#4A2318"}
          />
        </TouchableOpacity> */}
      </View>

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

        {/* {!isCompleted && (
          <TouchableOpacity
            style={styles.differentExerciseButton}
            onPress={() =>
              onDifferentExercise?.(
                id,
                type.toLowerCase() as "warmup" | "cooldown" | "target",
                focus
              )
            }
          >
            <Text style={styles.differentExerciseButtonText}>
              different exercise
            </Text>
            <FontAwesome name="refresh" size={16} color="#4A2318" />
          </TouchableOpacity>
        )} */}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 8,
    marginBottom: 16,
  },
  description: {
    flex: 1,
    fontSize: normalize(16),
    color: "#4A2318",
    lineHeight: 20,
    marginRight: 8,
  },
  animation: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: "45%",
    minHeight: 250,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerText: {
    fontSize: normalize(48),
    fontFamily: "matolha-regular",
    color: "#4A2318",
    textAlign: "center",
  },
  completedText: {
    fontSize: normalize(48),
    fontFamily: "matolha-regular",
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
    fontSize: normalize(20),
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
    fontSize: normalize(18),
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
    fontSize: normalize(18),
    color: "#4A2318",
    fontWeight: "bold",
    textAlign: "center",
  },
  progress: {
    fontSize: normalize(18),
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
    fontSize: normalize(20),
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
    fontSize: normalize(16),
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
  playVoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4A2318",
  },
  playVoiceButtonText: {
    fontSize: normalize(18),
    color: "#4A2318",
    fontWeight: "bold",
    textAlign: "center",
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  repeatButton: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4A2318",
  },
  repeatButtonActive: {
    backgroundColor: "#4A2318",
  },
  bottomSheetBackground: {
    backgroundColor: "#FFE9D5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetIndicator: {
    backgroundColor: "#4A2318",
    width: 40,
    height: 4,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 24,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontSize: normalize(24),
    fontWeight: "bold",
    color: "#4A2318",
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  bottomSheetScrollView: {
    flex: 1,
  },
  bottomSheetDescription: {
    fontSize: normalize(18),
    lineHeight: 28,
    color: "#4A2318",
    marginBottom: 24,
  },
  bottomSheetDetails: {
    backgroundColor: "rgba(74, 35, 24, 0.05)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: normalize(16),
    color: "#4A2318",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: normalize(16),
    color: "#4A2318",
  },
});
