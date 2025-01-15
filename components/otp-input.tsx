import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
  Text,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Cursor } from "./cursor";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export const OTPInput = ({ length = 6, value, onChange }: OTPInputProps) => {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    // Show keyboard when component mounts
    setTimeout(() => {
      inputRef.current?.focus();
      setFocused(true);
    }, 100);
  }, []);

  const handlePress = async () => {
    // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    inputRef.current?.focus();
    setFocused(true);
  };

  const handleChange = (text: string) => {
    // Remove any non-numeric characters
    const cleanText = text.replace(/[^0-9]/g, "").slice(0, length);

    // Trigger haptic feedback for backspace
    if (cleanText.length < value.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Trigger haptic feedback for adding numbers
    else if (cleanText.length > value.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onChange(cleanText);

    if (cleanText.length === length) {
      // Add a small delay before dismissing keyboard and removing focus
      setTimeout(() => {
        Keyboard.dismiss();
        setFocused(false);
      }, 100);
    }
  };

  const renderBoxes = () => {
    return Array(length)
      .fill(0)
      .map((_, index) => (
        <Pressable
          key={index}
          onPress={handlePress}
          style={[
            styles.box,
            value[index] ? styles.boxFilled : styles.boxEmpty,
            focused && index === value.length && styles.boxFocused,
          ]}
        >
          <Text style={styles.boxText}>{value[index]}</Text>
          {focused && index === value.length && !value[index] && <Cursor />}
        </Pressable>
      ));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.boxesContainer}>{renderBoxes()}</View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          style={styles.hiddenInput}
          maxLength={length}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  boxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  box: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  boxEmpty: {
    borderColor: "#4A231866",
  },
  boxFilled: {
    borderColor: "#4A2318",
    backgroundColor: "#FFE9D5",
    borderWidth: 2,
  },
  boxFocused: {
    borderWidth: 2,
    borderColor: "#4A231866",
    backgroundColor: "#FFE9D5",
  },
  boxText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#4A2318",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
});
