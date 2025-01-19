import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { FontAwesome } from "@expo/vector-icons";

interface ExerciseBottomSheetProps {
  type?: string;
  title?: string;
  description?: string;
  focus?: string;
  duration?: number;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

export const ExerciseBottomSheet = ({
  type,
  title,
  description,
  focus,
  duration,
  bottomSheetRef,
}: ExerciseBottomSheetProps) => {
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["60%"]}
      enablePanDownToClose
      style={{ zIndex: 1000 }}
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
      <BottomSheetView style={styles.bottomSheetContent}>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>
            {type}: {title}
          </Text>
          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.close()}
            style={styles.closeButton}
          >
            <FontAwesome name="times" size={24} color="#4A2318" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.bottomSheetScrollView}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.bottomSheetDescription}>{description}</Text>
          <View style={styles.bottomSheetDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Focus Area</Text>
              <Text style={styles.detailValue}>{focus}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{duration} seconds</Text>
            </View>
          </View>
        </ScrollView>
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
    fontSize: 24,
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
    fontSize: 18,
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
    fontSize: 16,
    color: "#4A2318",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
    color: "#4A2318",
  },
});
