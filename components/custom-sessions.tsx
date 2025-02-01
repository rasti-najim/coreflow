import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";
import * as Haptics from "expo-haptics";
import { FontAwesome6 } from "@expo/vector-icons";
import Superwall from "@superwall/react-native-superwall";
import { usePostHog } from "posthog-react-native";
import { useFocusEffect } from "expo-router";
import { CustomSessionsSkeleton } from "./custom-sessions-skeleton";

type CustomSession = {
  id: string;
  name: string;
  focus: string;
  created_at: string;
};

export const CustomSessions = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<CustomSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const posthog = usePostHog();

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  useFocusEffect(
    useCallback(() => {
      const fetchCustomSessions = async () => {
        try {
          const { data, error } = await supabase
            .from("sessions")
            .select("*")
            .eq("user_id", user?.id)
            .eq("is_custom", true)
            .order("created_at", { ascending: false });

          if (error) throw error;
          setSessions(data || []);
        } catch (error) {
          console.error("Error fetching custom sessions:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomSessions();
    }, [user])
  );

  const handleSessionPress = async (session: CustomSession) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Superwall.shared.register("startCustomWorkoutSession").then(() => {
      posthog.capture("user_started_custom_workout");
      router.push({
        pathname: "/home/session",
        params: {
          session_id: session.id,
          focus: session.focus,
        },
      });
    });
  };

  if (isLoading) {
    return <CustomSessionsSkeleton />;
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No custom workouts yet</Text>
        <Text style={styles.emptySubtext}>
          Tap the <FontAwesome6 name="plus" size={12} color="#4A2318" /> button
          to create your own workout
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sessions.map((session, index) => (
        <TouchableOpacity
          key={session.id}
          style={[
            styles.blob,
            index % 2 === 0 ? styles.blobLeft : styles.blobRight,
          ]}
          onPress={() => handleSessionPress(session)}
        >
          <View style={styles.blobContent}>
            <Text style={styles.sessionName}>{session.name}</Text>
            <Text style={styles.sessionDate}>
              Created {DateTime.fromISO(session.created_at).toRelative()}
            </Text>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color="#FFE9D5"
            style={styles.chevron}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  blob: {
    width: "48%",
    backgroundColor: "#4A2318",
    borderRadius: 24,
    padding: 16,
    flexDirection: "column",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  blobLeft: {
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: "-1deg" }],
  },
  blobRight: {
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    transform: [{ rotate: "1deg" }],
  },
  blobContent: {
    flex: 1,
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFE9D5",
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: "#FFE9D5",
    opacity: 0.8,
  },
  chevron: {
    alignSelf: "flex-end",
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#4A2318",
    opacity: 0.8,
    fontStyle: "italic",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#4A2318",
    opacity: 0.8,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
});
