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
interface CreateAccountProps {
  title: string;
  onGoogleSignIn: (user: User) => void;
  phoneNumber: string;
  onChangePhoneNumber: (phoneNumber: string) => void;
  onAppleSignIn: (user: User) => void;
}

export const CreateAccount = ({
  title = "Create Your Account",
  onGoogleSignIn,
  phoneNumber,
  onChangePhoneNumber,
  onAppleSignIn,
}: CreateAccountProps) => {
  GoogleSignin.configure({
    scopes: ["email", "profile"],
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);

      if (userInfo?.data?.idToken) {
        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });
        console.log(error, user);

        if (!error && user) {
          // User is signed in.
          console.log("google user", user);
          onGoogleSignIn(user);
        }
      } else {
        throw new Error("no ID token present!");
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
          onPress={async () => {
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
                const {
                  error,
                  data: { user },
                } = await supabase.auth.signInWithIdToken({
                  provider: "apple",
                  token: credential.identityToken,
                });
                console.log(JSON.stringify({ error, user }, null, 2));
                if (!error && user) {
                  // User is signed in.
                  console.log("apple user", user);
                  console.log("apple user email", user.email);
                  onAppleSignIn(user);
                }
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
          }}
        />

        <Text style={styles.orText}>Or</Text>

        <PhoneInput
          phoneNumber={phoneNumber}
          onChangePhoneNumber={onChangePhoneNumber}
        />
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
});
