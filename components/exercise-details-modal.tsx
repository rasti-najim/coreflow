import React, { useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

interface ExerciseDetailsModalProps {
  exercise: {
    name: string;
    description: string;
    skill_level: string;
    focus: string[];
    is_two_sided: boolean;
    lottie_file_url: string;
    type: string;
  } | null;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

export const ExerciseDetailsModal = ({
  exercise,
  bottomSheetRef,
}: ExerciseDetailsModalProps) => {
  if (!exercise) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["80%"]}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
    >
      <BottomSheetView style={styles.modalContent}>
        <Text style={styles.title}>{exercise.name}</Text>

        <View style={styles.animationContainer}>
          <LottieView
            source={{ uri: exercise.lottie_file_url }}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.type}>{exercise.type}</Text>
          <Text style={styles.description}>{exercise.description}</Text>

          <View style={styles.metaContainer}>
            <Text style={styles.metaLabel}>Skill Level:</Text>
            <Text style={styles.metaValue}>{exercise.skill_level}</Text>
          </View>

          <View style={styles.metaContainer}>
            <Text style={styles.metaLabel}>Focus Areas:</Text>
            <Text style={styles.metaValue}>{exercise.focus.join(", ")}</Text>
          </View>

          {exercise.is_two_sided && (
            <Text style={styles.twoSided}>* Two-sided exercise</Text>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
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
  modalContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2318",
    marginBottom: 16,
  },
  animationContainer: {
    height: 200,
    marginBottom: 16,
    backgroundColor: "#4A2318",
    borderRadius: 12,
    overflow: "hidden",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    gap: 12,
  },
  type: {
    fontSize: 16,
    color: "#4A2318",
    opacity: 0.8,
    fontStyle: "italic",
  },
  description: {
    fontSize: 16,
    color: "#4A2318",
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A2318",
    width: 100,
  },
  metaValue: {
    fontSize: 14,
    color: "#4A2318",
    flex: 1,
  },
  twoSided: {
    fontSize: 14,
    color: "#4A2318",
    fontStyle: "italic",
    opacity: 0.8,
  },
});
