import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { OTPInput } from "./otp-input";

interface VerifyOTPProps {
  phoneNumber: string;
  code: string;
  onChangeCode: (code: string) => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => void;
}

export const VerifyOTP = ({
  phoneNumber,
  code,
  onChangeCode,
  onVerify,
  onResend,
}: VerifyOTPProps) => {
  const handleVerify = async (otp: string) => {
    if (!otp || otp.length !== 6) {
      console.log("Invalid OTP length");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await onVerify(otp);
  };

  const handleCodeChange = async (text: string) => {
    onChangeCode(text);
    // Automatically verify when code length is 6
    // if (text.length === 6) {
    //   await handleVerify(text);
    // }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 24,
      paddingHorizontal: 8,
      backgroundColor: "#FFE9D5",
    },
    title: {
      fontSize: 32,
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

      <OTPInput value={code} onChange={handleCodeChange} />

      <TouchableOpacity style={styles.resendButton} onPress={onResend}>
        <Text style={styles.resendButtonText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
};
