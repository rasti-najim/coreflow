import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";

export const CustomSessionsSkeleton = () => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 750 }),
        withTiming(0.3, { duration: 750 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.blob,
            index % 2 === 0 ? styles.blobLeft : styles.blobRight,
            animatedStyle,
          ]}
        >
          <View style={styles.blobContent}>
            <View style={styles.titleSkeleton} />
            <View style={styles.dateSkeleton} />
          </View>
          <View style={styles.chevronSkeleton} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  blob: {
    width: "48%",
    backgroundColor: "#4A2318",
    borderRadius: 24,
    padding: 16,
    flexDirection: "column",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  blobLeft: {
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: "-1deg" }],
  },
  blobRight: {
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    transform: [{ rotate: "1deg" }],
  },
  blobContent: {
    flex: 1,
    marginBottom: 8,
    width: "100%",
  },
  titleSkeleton: {
    height: 16,
    backgroundColor: "#FFE9D5",
    borderRadius: 4,
    marginBottom: 8,
    width: "80%",
    opacity: 0.3,
  },
  dateSkeleton: {
    height: 12,
    backgroundColor: "#FFE9D5",
    borderRadius: 4,
    width: "60%",
    opacity: 0.3,
  },
  chevronSkeleton: {
    height: 16,
    width: 16,
    backgroundColor: "#FFE9D5",
    borderRadius: 4,
    alignSelf: "flex-end",
    opacity: 0.3,
  },
});
