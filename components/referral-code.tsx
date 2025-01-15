import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { LoadingAnimation } from "./loading-animation";
import { Toast, ToastProps } from "./toast";
import { FontAwesome } from "@expo/vector-icons";

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
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (code.length === 6) {
      setIsValidating(true);
      timeoutId = setTimeout(() => {
        validateCode();
      }, 500);
    } else {
      setIsValid(null);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [code]);

  const handleCodeChange = (text: string) => {
    const upperText = text.toUpperCase();
    setCode(upperText);
    if (upperText.length === 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const validateCode = async () => {
    if (code.length !== 6) return;

    try {
      // Call the parent's onCodeChange handler
      await onCodeChange?.(code);
      setIsValid(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error validating code:", error);
      setIsValid(false);
      setToast({
        message: "Invalid referral code",
        type: "error",
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsValidating(false);
    }
  };

  const renderStatus = () => {
    if (isValidating) {
      return (
        <View style={styles.statusContainer}>
          <LoadingAnimation />
        </View>
      );
    }

    if (isValid === true) {
      return (
        <View style={styles.statusContainer}>
          <FontAwesome name="check-circle" size={24} color="#4CAF50" />
        </View>
      );
    }

    if (isValid === false) {
      return (
        <View style={styles.statusContainer}>
          <FontAwesome name="times-circle" size={24} color="#F44336" />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isValid === true && styles.inputValid,
            isValid === false && styles.inputInvalid,
          ]}
          value={code}
          onChangeText={handleCodeChange}
          placeholder="Enter code"
          placeholderTextColor="#666666"
          autoCapitalize="characters"
          maxLength={6}
          editable={!isValidating}
        />
        {renderStatus()}
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
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#4A2318",
    paddingBottom: 8,
    letterSpacing: 2,
  },
  inputValid: {
    borderBottomColor: "#4CAF50",
  },
  inputInvalid: {
    borderBottomColor: "#F44336",
  },
  statusContainer: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
  },
});
