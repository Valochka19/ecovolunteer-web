"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";
import type { RegisterData, Role, User } from "@/types";

// ─── Types ──────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ────────────────────────────────────────────────────

function profileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    city: profile.city,
    interests: profile.interests ?? [],
    role: profile.role,
    tokenBalance: profile.token_balance,
    verificationStatus: profile.verification_status,
  };
}

async function fetchProfile(
  userId: string
): Promise<ProfileRow | null> {
  try {
    const res = await fetch(`/api/get-profile?userId=${encodeURIComponent(userId)}`);
    const result = await res.json();

    if (res.ok && result.profile) {
      return result.profile as ProfileRow;
    }

    console.warn("Profile not found for user:", userId);
    return null;
  } catch (e) {
    console.warn("Error fetching profile:", e);
    return null;
  }
}

// ─── Provider ───────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // ── Sync auth state from Supabase ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoading(true);

      // 1. Check existing session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user && !cancelled) {
        const profile = await fetchProfile(session.user.id);
        if (profile && !cancelled) {
          setUser(profileToUser(profile));
        }
      }

      if (!cancelled) setIsLoading(false);
    }

    init();

        // 2. Subscribe to future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(session.user.id);

        if (profile) {
          setUser(profileToUser(profile));
                } else if (session.user.email) {
          // Fallback: profile not found (trigger might've failed).
          // Try to create it on the fly via API, then refetch.
          try {
            const res = await fetch("/api/create-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: session.user.id }),
            });
            const result = await res.json();
            console.log("Create-profile response:", result);

            if (res.ok) {
              // Wait a tick for DB consistency
              await new Promise((r) => setTimeout(r, 300));
              const retryProfile = await fetchProfile(session.user.id);
              if (retryProfile) {
                setUser(profileToUser(retryProfile));
              } else {
                console.warn("Profile still missing after creation attempt");
              }
            } else {
              console.warn("Create-profile API error:", result);
            }
          } catch (e) {
            console.warn("Failed to create missing profile:", e);
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ── Login ───────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Login error:", error.message);
        return false;
      }
      return true;
    },
    [supabase.auth]
  );

    // ── Register ────────────────────────────────────────────────────
  const register = useCallback(
    async (data: RegisterData): Promise<boolean> => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            city: data.city ?? "",
          },
        },
      });

      if (error) {
        console.error("Register error:", error.message);
        return false;
      }

      // Immediately create the profile in public.profiles via admin API
      // (bypasses the DB trigger which might fail)
      if (authData?.user) {
        try {
          await fetch("/api/create-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: authData.user.id }),
          });
        } catch (e) {
          console.warn("Profile creation after signup failed:", e);
        }
      }

      return true;
    },
    [supabase.auth]
  );

  // ── Logout ──────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  }, [supabase.auth, router]);

    // ── Switch role (dev only) ──────────────────────────────────────
  const switchRole = useCallback(
    async (role: Role) => {
      if (!user) return;

      try {
        const res = await fetch("/api/switch-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, role }),
        });

        const result = await res.json();

        if (result.ok) {
          setUser((prev) => (prev ? { ...prev, role: result.role } : prev));
          console.log(`Role switched to: ${role}`);
        } else {
          console.warn("Failed to switch role:", result.error);
        }
      } catch (e) {
        console.warn("Error switching role:", e);
      }
    },
    [user]
  );

  // ── Value ───────────────────────────────────────────────────────
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      switchRole,
    }),
    [user, isLoading, login, register, logout, switchRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
