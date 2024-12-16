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

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const safeArea = useSafeAreaInsets();

  if (!user) {
    return <Redirect href="/welcome" />;
  }

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

    console.log(result);

    if (!result.canceled && result.assets[0].uri) {
      setPhoto(result.assets[0]);
      //   onPhotoSelect?.(result.assets[0].uri);
    }
  };

  const handleAddUpdate = async () => {
    console.log("uploading photo");

    try {
      const { data, error } = await supabase.storage
        .from("photo-progress")
        .upload(
          `${user.id}/${new Date().toISOString()}.${
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
          added_on: new Date().toISOString().split("T")[0],
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

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 40 }]}>
      <Text style={styles.title}>Add Photo Update</Text>
      <Text style={styles.subtitle}>
        Upload a picture of what you want to improve (i.e. abs, muscle tone,
        etc)
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={handleSelectPhoto}>
        <Text style={styles.uploadButtonText}>take or upload a picture</Text>
      </TouchableOpacity>

      {photo && (
        <Image source={{ uri: photo.uri }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.button} onPress={handleAddUpdate}>
        <Text style={styles.buttonText}>add update</Text>
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
  input: {
    width: "100%",
    fontSize: 24,
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
    marginBottom: 24,
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
    marginBottom: 40,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A2318",
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
