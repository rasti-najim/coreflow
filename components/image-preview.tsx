import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { FontAwesome } from "@expo/vector-icons";

export const ImagePreviewModal = ({
  uri,
  isVisible,
  onClose,
}: {
  uri: string;
  isVisible: boolean;
  onClose: () => void;
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleBackdropPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.modalBackdrop, backdropStyle]} />
      <Animated.View style={[styles.modalContainer, modalStyle]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleBackdropPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="times" size={24} color="#FFE9D5" />
        </TouchableOpacity>
        <Image source={{ uri }} style={styles.fullScreenImage} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 3,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
