import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { CustomCameraView } from "./camera-view";
import { DateTime } from "luxon";
import { Camera } from "expo-camera";
import { Toast } from "./toast";

interface StartingJourneyProps {
  onMoodChange?: (mood: string) => void;
}

export const StartingJourney = ({ onMoodChange }: StartingJourneyProps) => {
  const [mood, setMood] = useState("");

  const handleMoodChange = (text: string) => {
    setMood(text);
    onMoodChange?.(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starting Your Journey</Text>
      <Text style={styles.subtitle}>Describe your current mood:</Text>

      <TextInput
        style={styles.input}
        placeholder="I feel worried about xyz..."
        placeholderTextColor="#666666"
        value={mood}
        onChangeText={handleMoodChange}
        multiline
        autoFocus
      />
    </View>
  );
};

interface StartingJourneyPhotoProps {
  onPhotoSelect?: (asset: ImagePicker.ImagePickerAsset) => void;
}

export const StartingJourneyPhoto = ({
  onPhotoSelect,
}: StartingJourneyPhotoProps) => {
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    setShowCamera(true);
  };

  const handleSelectPhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0]);
      onPhotoSelect?.(result.assets[0]);
    }
  };

  if (showCamera) {
    return (
      <CustomCameraView
        onCapture={(uri, base64) => {
          setShowCamera(false);
          setPhoto({
            uri,
            base64,
            fileName: `${DateTime.now().toISO()}.jpg`,
            mimeType: "image/jpeg",
            width: 0,
            height: 0,
          });
          onPhotoSelect?.({
            uri,
            base64,
            fileName: `${DateTime.now().toISO()}.jpg`,
            mimeType: "image/jpeg",
            width: 0,
            height: 0,
          });
        }}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starting Your Journey</Text>
      <Text style={styles.subtitle}>
        Upload a picture of what you want to improve (i.e. abs, muscle tone,
        etc)
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleTakePhoto}>
          <Text style={styles.uploadButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleSelectPhoto}
        >
          <Text style={styles.uploadButtonText}>Choose from Library</Text>
        </TouchableOpacity>
      </View>

      {photo && (
        <Image source={{ uri: photo.uri }} style={styles.previewImage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#000000",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#000000",
  },
  input: {
    width: "100%",
    fontSize: 24,
    color: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#4A2318",
    paddingBottom: 8,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 24,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
  },
  uploadButton: {
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A2318",
    width: "100%",
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A2318",
    width: "100%",
    marginBottom: 24,
    backgroundColor: "#FFE9D5",
  },
  buttonDisabled: {
    borderColor: "#999999",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2318",
  },
  buttonTextDisabled: {
    color: "#999999",
  },
});
