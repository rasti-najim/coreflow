import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button } from "react-native";
import * as Haptics from "expo-haptics";
import { LoadingAnimation } from "./loading-animation";
import { Toast, ToastProps } from "./toast";

interface ReferralCodeProps {
  title?: string;
  subtitle?: string;
  onCodeChange?: (code: string) => void;
}

export const ReferralCode = ({
  onCodeChange,
  title = "Referral Code",
  subtitle = "You can skip this step",
}: ReferralCodeProps) => {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const handleCodeChange = (text: string) => {
    const upperText = text.toUpperCase();
    setCode(upperText);
    if (upperText.length === 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const validateCode = async () => {
    if (code.length !== 6) return;

    setIsValidating(true);
    try {
      // Simulate validation delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Call the parent's onCodeChange handler
      onCodeChange?.(code);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error validating code:", error);
      setToast({
        message: "Error validating code",
        type: "error",
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={handleCodeChange}
          placeholder="Enter code"
          placeholderTextColor="#666666"
          autoCapitalize="characters"
          maxLength={6}
          editable={!isValidating}
        />

        {isValidating && (
          <View style={styles.loadingContainer}>
            <LoadingAnimation />
          </View>
        )}
      </View>

      {toast && (
        <Toast
          message={toast.message}
          onHide={() => setToast(null)}
          type={toast.type}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: "left",
  },
  input: {
    width: "100%",
    fontSize: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#4A2318",
    paddingBottom: 8,
    letterSpacing: 2,
  },
  inputContainer: {
    position: "relative",
  },
  loadingContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
});
