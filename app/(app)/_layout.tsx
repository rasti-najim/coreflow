import { Text } from "react-native";
import { Redirect, router, Slot } from "expo-router";
import { useAuth } from "@/components/auth-context";
import { useState } from "react";
import { useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";
import Superwall from "@superwall/react-native-superwall";

export default function AppLayout() {
  const { session, user, loading } = useAuth();

  useEffect(() => {
    Superwall.shared.getSubscriptionStatus().then((status) => {
      console.log("subscription status", status);
    });
  }, []);

  // const [session, setSession] = useState<Session | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     console.log("session", session);
  //     console.log("session.user", session?.user);
  //     setSession(session);
  //     setLoading(false);
  //   });

  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     console.log("session", session);
  //     setSession(session);
  //     setLoading(false);
  //   });
  // }, []);

  if (loading) {
    return null; // or a loading spinner
  }

  if (!session || !session.user) {
    return <Redirect href="/welcome" />;
  }

  return <Slot />;
}
