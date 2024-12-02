import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

interface PaywallScreenProps {
  onPurchase: () => void;
  onSkip: () => void;
}

export const PaywallScreen = ({ onPurchase, onSkip }: PaywallScreenProps) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/phone-mockup.png")}
        contentFit="cover"
        style={styles.mockup}
      />

      <LinearGradient
        colors={["transparent", "#4A2318", "#4A2318"]}
        style={styles.gradient}
        locations={[0, 0.4, 0.6]}
      />

      <View style={styles.contentOverlay}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Your Perfect Pilates{"\n"}Routine</Text>
          <Text style={styles.subtitle}>
            Exceed Your Physical & Mental Goals
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statText}>
              cheaper than average pilates membership
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statNumber}>90%</Text>
            <Text style={styles.statText}>
              of coreflow users see or feel results within two weeks
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statNumber}>63%</Text>
            <Text style={styles.statText}>
              of people who practice Pilates report reduced stress
            </Text>
          </View>
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity
            style={styles.priceButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPurchase();
            }}
          >
            <Text style={styles.priceAmount}>$8/Week</Text>
            <Text style={styles.priceInterval}>Paid Monthly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.priceButton, styles.bestValueButton]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPurchase();
            }}
          >
            <View style={styles.bestValueTag}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={styles.priceAmount}>$5/Week</Text>
            <Text style={styles.priceInterval}>Paid Yearly</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A2318",
  },
  mockup: {
    position: "absolute",
    width: "100%",
    height: "60%",
    top: "5%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "10%",
    height: "70%",
  },
  contentOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingTop: "50%",
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFE9D5",
    fontFamily: "serif",
    marginBottom: 24,
  },
  schedulePreview: {
    marginBottom: 40,
  },
  todaySession: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFE9D5",
    marginRight: 8,
  },
  sessionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFE9D5",
    flex: 1,
  },
  beginButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  beginButtonText: {
    color: "#4A2318",
    fontSize: 14,
    fontWeight: "bold",
  },
  weekSchedule: {
    gap: 8,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFE9D5",
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 16,
    color: "#FFE9D5",
    fontWeight: "bold",
  },
  textContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFE9D5",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFE9D5",
    textAlign: "center",
    marginBottom: 24,
  },
  statsContainer: {
    marginBottom: 40,
    width: "90%",
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFE9D5",
  },
  statText: {
    fontSize: 16,

    color: "#FFE9D5",
    flex: 1,
  },
  separator: {
    height: 2,
    backgroundColor: "#FFE9D5",
    width: "90%",
    marginBottom: 24,
  },
  pricingContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  priceButton: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 12,
  },
  bestValueButton: {
    position: "relative",
  },
  bestValueTag: {
    position: "absolute",
    top: -12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#4A2318",
    borderRadius: 16,
  },
  bestValueText: {
    color: "#FFE9D5",
    fontSize: 12,
    fontWeight: "bold",
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2318",
  },
  priceInterval: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A2318",
    marginTop: 4,
  },
});
