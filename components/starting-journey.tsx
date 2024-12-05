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
  onPhotoSelect?: (uri: string) => void;
}

export const StartingJourneyPhoto = ({
  onPhotoSelect,
}: StartingJourneyPhotoProps) => {
  const [photo, setPhoto] = useState<string | null>(null);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhoto(result.assets[0].uri);
      onPhotoSelect?.(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starting Your Journey</Text>
      <Text style={styles.subtitle}>
        Upload a picture of what you want to improve (i.e. abs, muscle tone,
        etc)
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={handleSelectPhoto}>
        <Text style={styles.uploadButtonText}>take or upload a picture</Text>
      </TouchableOpacity>

      {photo && <Image source={{ uri: photo }} style={styles.previewImage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 40,
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
  previewImage: {
    width: "100%",
    height: 300,
    marginTop: 24,
    borderRadius: 10,
  },
});
