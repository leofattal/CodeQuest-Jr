"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Student profile data from the database
 */
export interface StudentProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  coins: number;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  /**
   * Fetch student profile from database
   * Retries if profile doesn't exist yet (handles trigger delay)
   */
  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist yet and we haven't retried too many times, retry
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log(`Profile not found, retrying in ${(retryCount + 1) * 500}ms...`);
          setTimeout(() => fetchProfile(userId, retryCount + 1), (retryCount + 1) * 500);
          return;
        }
        throw error;
      }

      setProfile(data);
      setLoading(false); // Profile loaded successfully
    } catch (error: any) {
      // Better error logging
      if (error?.code === 'PGRST116') {
        console.warn(`Profile not found for user ${userId} after ${retryCount + 1} attempts`);
      } else {
        console.error("Error fetching profile:", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint
        });
      }

      // Only set to null if we've exhausted retries
      if (retryCount >= 3) {
        setProfile(null);
        setLoading(false); // Done trying
      }
    }
  };

  /**
   * Refresh profile data (useful after coin/XP updates)
   */
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  /**
   * Initialize auth state
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false); // No user, done loading
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false); // No user, done loading
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;

      // Profile will be auto-created by the trigger
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
