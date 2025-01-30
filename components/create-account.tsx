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
import * as AppleAuthentication from "expo-apple-authentication";
import supabase from "@/lib/supabase";
import { PhoneInput } from "./phone-input";
import { User } from "@supabase/supabase-js";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Toast, ToastProps } from "./toast";
import * as Linking from "expo-linking";
import { Buffer } from "buffer";

interface CreateAccountProps {
  title: string;
  onGoogleSignIn: (user: User) => void;
  phoneNumber: string;
  onChangePhoneNumber: (phoneNumber: string) => void;
  onAppleSignIn: (user: User) => void;
  type: "login" | "signup";
}

export const CreateAccount = ({
  title = "Create Your Account",
  onGoogleSignIn,
  phoneNumber,
  onChangePhoneNumber,
  onAppleSignIn,
  type,
}: CreateAccountProps) => {
  GoogleSignin.configure({
    scopes: ["email", "profile"],
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  const [toast, setToast] = useState<ToastProps | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);

      if (userInfo?.data?.idToken) {
        // User is signed in.
        const {
          data: { exists },
        } = await supabase.functions.invoke("check-auth", {
          body: { email: userInfo.data.user.email },
        });

        if (type === "login" && !exists) {
          setToast({
            message: "User does not exist. Please sign up instead.",
            type: "error",
          });
          return;
        }

        if (type === "signup" && exists) {
          setToast({
            message: "User already exists. Please sign in instead.",
            type: "error",
          });
          return;
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });
        console.log(error, user);

        if (error || !user) {
          throw new Error("Failed to sign in with Google.");
        }

        onGoogleSignIn(user);
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      console.log(credential);

      if (credential.identityToken) {
        // Try to get email from credential first
        let email = credential.email;

        if (!email) {
          // If email is private, try to decode it from the JWT token
          try {
            const tokenParts = credential.identityToken.split(".");
            // Use Buffer for more reliable base64 decoding
            const payload = JSON.parse(
              Buffer.from(tokenParts[1], "base64").toString()
            );
            email = payload.email;
          } catch (decodeError) {
            console.error("Error decoding JWT token:", decodeError);
          }
        }

        if (!email) {
          throw new Error("Could not get email from Apple sign in.");
        }

        const {
          data: { exists },
        } = await supabase.functions.invoke("check-auth", {
          body: { email },
        });

        if (type === "login" && !exists) {
          setToast({
            message: "User does not exist. Please sign up instead.",
            type: "error",
          });
          return;
        }
        if (type === "signup" && exists) {
          setToast({
            message: "User already exists. Please sign in instead.",
            type: "error",
          });
          return;
        }

        const {
          error,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        console.log(JSON.stringify({ error, user }, null, 2));

        if (error || !user) {
          throw new Error("Failed to sign in with Apple.");
        }

        // User is signed in.
        console.log("apple user", user);
        console.log("apple user email", user.email);

        onAppleSignIn(user);
      } else {
        throw new Error("No identityToken.");
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <View style={styles.googleButtonContent}>
            <AntDesign name="google" size={24} style={{ paddingRight: 4 }} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={styles.button}
          onPress={handleAppleSignIn}
        />

        <Text style={styles.orText}>Or</Text>

        <PhoneInput
          phoneNumber={phoneNumber}
          onChangePhoneNumber={onChangePhoneNumber}
        />

        {type === "signup" && (
          <Text style={styles.termsText}>
            By continuing, you agree to our{" "}
            <Text
              style={styles.termsLink}
              onPress={() =>
                Linking.openURL(
                  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                )
              }
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              style={styles.termsLink}
              onPress={() =>
                Linking.openURL("https://barnburnerllc.github.io/CoreFlow/")
              }
            >
              Privacy Policy
            </Text>
          </Text>
        )}

        {toast && (
          <Toast
            message={toast.message}
            onHide={() => setToast(null)}
            type={toast.type}
          />
        )}
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  googleButton: {
    paddingVertical: 12,
    borderRadius: 5,
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
  button: {
    // width: 200,
    height: 50,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: "#4A2318",
    textDecorationLine: "underline",
  },
});
