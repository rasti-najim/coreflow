import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

interface CursorProps {
  color?: string;
  height?: number;
  width?: number;
}

export const Cursor = ({
  color = "#4A2318",
  height = 32,
  width = 2,
}: CursorProps) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    blinkAnimation.start();

    return () => blinkAnimation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cursor,
        {
          opacity,
          height,
          width,
          backgroundColor: color,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  cursor: {
    position: "absolute",
    opacity: 0.8,
  },
});
