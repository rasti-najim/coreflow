import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Arrow } from "./arrow";

interface CustomSessionLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
  title: string;
  hideNextButton?: boolean;
}

export const CustomSessionLayout = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isNextDisabled = false,
  nextButtonText = "Next",
  title,
  hideNextButton = false,
}: CustomSessionLayoutProps) => {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <FontAwesome6 name="arrow-left" size={24} color="#513B2F" />
              </TouchableOpacity>
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / totalSteps) * 100}%` },
              ]}
            />
          </View> */}

            {children}

            <View style={styles.footer}>
              {!hideNextButton && (
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    isNextDisabled && styles.nextButtonDisabled,
                  ]}
                  onPress={onNext}
                  disabled={isNextDisabled}
                >
                  {/* <Text style={styles.nextButtonText}>{nextButtonText}</Text> */}
                  <Arrow color="#4A2318" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A2318",
    fontFamily: "matolha-regular",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#D9D0C7",
    borderRadius: 2,
    marginBottom: 32,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A2318",
    borderRadius: 2,
  },
  footer: {
    marginTop: "auto",
    // paddingVertical: 24,
    alignItems: "flex-end",
  },
  nextButton: {
    // backgroundColor: "#FFE9D5",
    // borderWidth: 1,
    borderColor: "#4A2318",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2318",
    marginRight: 8,
  },
});
