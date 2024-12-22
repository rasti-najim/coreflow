import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

interface ReferralCodeProps {
  title?: string;
  subtitle?: string;
  onCodeSubmit?: (code: string) => void;
}

export const ReferralCode = ({
  onCodeSubmit,
  title = "Referral Code",
  subtitle = "You can skip this step",
}: ReferralCodeProps) => {
  const [code, setCode] = useState("");

  const handleCodeChange = (text: string) => {
    const upperText = text.toUpperCase();
    setCode(upperText);
    if (upperText.length === 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onCodeSubmit?.(upperText);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={handleCodeChange}
        placeholder="Enter code"
        placeholderTextColor="#666666"
        autoCapitalize="characters"
        maxLength={6}
        autoFocus
      />
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
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    fontSize: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#4A2318",
    paddingBottom: 8,
    letterSpacing: 2,
  },
});
