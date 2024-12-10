import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";

interface VerifyOTPProps {
  phoneNumber: string;
  code: string;
  onChangeCode: (code: string) => void;
  onVerify: (code: string) => void;
  onResend: () => void;
}

export const VerifyOTP = ({
  phoneNumber,
  code,
  onChangeCode,
  onVerify,
  onResend,
}: VerifyOTPProps) => {
  const handleVerify = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onVerify(code);
  };

  const handleCodeChange = (text: string) => {
    onChangeCode(text);
    // If the code length is 6 (complete), automatically verify
    if (text.length === 6) {
      handleVerify();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 24,
      paddingHorizontal: 8,
      backgroundColor: "#FFE9D5",
    },
    title: {
      fontSize: 40,
      fontWeight: "bold",
      marginBottom: 24,
      color: "#000000",
    },
    subtitle: {
      fontSize: 18,
      color: "#666666",
      marginBottom: 32,
    },
    otpInput: {
      paddingVertical: 16,
      textAlign: "center",
      fontSize: 24,
      fontWeight: "500",
      borderWidth: 1,
      borderColor: "#4A2318",
      borderRadius: 10,
      marginBottom: 24,
      color: "#000000",
    },
    verifyButton: {
      paddingVertical: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#4A2318",
      backgroundColor: "#4A2318",
      marginBottom: 16,
      alignItems: "center",
    },
    verifyButtonDisabled: {
      opacity: 0.5,
    },
    verifyButtonText: {
      fontSize: 18,
      fontWeight: "500",
      color: "#FFFFFF",
    },
    resendButton: {
      alignItems: "center",
      paddingVertical: 8,
    },
    resendButtonText: {
      fontSize: 16,
      color: "#666666",
      textDecorationLine: "underline",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your{"\n"}Phone Number</Text>
      <Text style={styles.subtitle}>Enter the code sent to {phoneNumber}</Text>

      <TextInput
        style={styles.otpInput}
        placeholder="Enter verification code"
        placeholderTextColor="#666666"
        keyboardType="number-pad"
        value={code}
        onChangeText={handleCodeChange}
        maxLength={6}
      />

      <TouchableOpacity style={styles.resendButton} onPress={onResend}>
        <Text style={styles.resendButtonText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
};
