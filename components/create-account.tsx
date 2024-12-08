import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as Haptics from "expo-haptics";
import { AntDesign } from "@expo/vector-icons";

interface CreateAccountProps {
  onGoogleSignIn: () => void;
  phoneNumber: string;
  onChangePhoneNumber: (phoneNumber: string) => void;
}

export const CreateAccount = ({
  onGoogleSignIn,
  phoneNumber,
  onChangePhoneNumber,
}: CreateAccountProps) => {
  const handleGoogleSignIn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onGoogleSignIn();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Your{"\n"}Account</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <View style={styles.googleButtonContent}>
            <AntDesign name="google" size={24} style={{ paddingRight: 4 }} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        <View style={styles.phoneContainer}>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number"
            placeholderTextColor="#666666"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              onChangePhoneNumber(text);
            }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
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
    marginBottom: 40,
    color: "#000000",
    fontFamily: "Margin-DEMO",
  },
  googleButton: {
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A2318",
    marginBottom: 24,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
  },
  orText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  phoneInput: {
    paddingVertical: 16,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "#4A2318",
  },
  phoneContainer: {
    width: "100%",
  },
});
