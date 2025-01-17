import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("session", session);
      console.log("session.user", session?.user);
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("session", session);
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const deleteAccount = async () => {
    if (!state.user?.id) throw new Error("User ID is required");
    try {
      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        {
          body: { user_id: state.user.id },
        }
      );

      if (error) throw error;

      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
