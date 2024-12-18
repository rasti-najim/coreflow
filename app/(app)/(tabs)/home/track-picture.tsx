import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { Redirect, useRouter } from "expo-router";
import { decode } from "base64-arraybuffer";
import { nanoid } from "nanoid";
import { DateTime } from "luxon";
import { CustomCameraView } from "@/components/camera-view";
import { Camera, CameraView } from "expo-camera";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const safeArea = useSafeAreaInsets();
  const [showCamera, setShowCamera] = useState(false);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const handleTakePhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    setShowCamera(true);
  };

  const handleSelectFromLibrary = async () => {
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
    }
  };

  const handleAddUpdate = async () => {
    console.log("uploading photo");

    try {
      const { data, error } = await supabase.storage
        .from("photo-progress")
        .upload(
          `${user.id}/${DateTime.now().toISO()}.${
            photo?.fileName?.split(".")[1]
          }`,
          decode(photo?.base64 || ""),
          {
            contentType: `${photo?.mimeType}`,
          }
        );

      if (error) {
        console.error(error);
      }

      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .insert({
          user_id: user.id,
          entry_type: "picture",
          picture_url: data?.path?.split("/")[1],
          added_on: DateTime.now().toISODate(),
        });

      if (progressError) {
        console.error(progressError);
      }

      console.log("photo uploaded", data);

      router.dismiss();
    } catch (error) {
      console.error(error);
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
        }}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeArea.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => router.dismiss()}
        >
          <FontAwesome name="times" size={24} color="#4A2318" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Add Photo Update</Text>
        <Text style={styles.subtitle}>
          Upload a picture of what you want to improve (i.e. abs, muscle tone,
          etc)
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleTakePhoto}
          >
            <Text style={styles.uploadButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleSelectFromLibrary}
          >
            <Text style={styles.uploadButtonText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>

        {photo && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photo.uri }} style={styles.previewImage} />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, !photo && styles.buttonDisabled]}
        onPress={handleAddUpdate}
        disabled={!photo}
      >
        <View style={styles.buttonContent}>
          <Text
            style={[styles.buttonText, !photo && styles.buttonTextDisabled]}
          >
            add update
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dismissButton: {
    padding: 8,
  },
  progressText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
    marginBottom: 24,
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
