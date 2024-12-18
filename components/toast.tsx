import React, { useEffect } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface ToastProps {
  message: string;
  duration?: number;
  onHide?: () => void;
  type?: "success" | "error" | "info";
}

export function Toast({
  message,
  duration = 3000,
  onHide,
  type = "info",
}: ToastProps) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  }, [duration, onHide]);

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#40874C";
      case "error":
        return "#FF6B6B";
      default:
        return "#4A2318";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, backgroundColor: getBackgroundColor() },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: "#FFE9D5",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
