import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { CameraView, CameraType } from "expo-camera";
import * as Haptics from "expo-haptics";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CameraViewProps {
  onCapture: (uri: string, base64: string) => void;
  onClose: () => void;
}

export const CustomCameraView = ({ onCapture, onClose }: CameraViewProps) => {
  const [facing, setFacing] = useState<CameraType>("front");
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef(null);
  const safeArea = useSafeAreaInsets();

  const handleFlipCamera = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !isReady) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await (cameraRef.current as any).takePictureAsync({
        quality: 1,
        skipProcessing: true,
        base64: true,
      });
      onCapture(photo.uri, photo.base64);
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={() => setIsReady(true)}
      >
        <View style={[styles.topControls, { paddingTop: safeArea.top + 20 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <FontAwesome name="times" size={24} color="#FFE9D5" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={handleFlipCamera}
          >
            <FontAwesome name="refresh" size={24} color="#FFE9D5" />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.bottomControls,
            { paddingBottom: safeArea.bottom + 20 },
          ]}
        >
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  bottomControls: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
  },
  flipButton: {
    padding: 8,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 233, 213, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFE9D5",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFE9D5",
  },
});
