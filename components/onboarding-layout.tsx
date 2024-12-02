import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { ArrowRight } from "lucide-react-native";
import { Arrow } from "./arrow";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
  showLayout?: boolean;
}

export const OnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isNextDisabled = false,
  nextButtonText = "Next",
  showLayout = true,
}: OnboardingLayoutProps) => {
  if (!showLayout) {
    return <>{children}</>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.scrollContent}>
          {/* <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              disabled={currentStep === 0}
            >
              <FontAwesome6
                name="arrow-left"
                size={24}
                color={currentStep === 0 ? "#D9D0C7" : "#513B2F"}
              />
            </TouchableOpacity>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / totalSteps) * 100}%` },
                ]}
              />
            </View>
          </View> */}

          {children}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                isNextDisabled && styles.nextButtonDisabled,
              ]}
              onPress={onNext}
              disabled={isNextDisabled}
            >
              <Arrow color="#4A2318" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: "#D9D0C7",
    borderRadius: 1.5,
    marginHorizontal: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#513B2F",
    borderRadius: 1.5,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 20,
  },
  nextButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginTop: 16,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
});
