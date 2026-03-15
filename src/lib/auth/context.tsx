"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  onIdTokenChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  syncSession: (idToken: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  syncSession: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Track whether we've explicitly triggered a login (vs. background token refresh)
  const manualLoginRef = useRef(false);

  const syncSession = useCallback(async (idToken: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/login", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("Session sync failed:", response.status, text);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Session sync error:", err);
      return false;
    }
  }, []);

  // Mark that a manual login is happening (called from login/signup pages)
  const markManualLogin = useCallback(() => {
    manualLoginRef.current = true;
  }, []);

  useEffect(() => {
    const firebaseAuth = getClientAuth();
    const unsubscribe = onIdTokenChanged(
      firebaseAuth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });

          // Only auto-sync cookies if this was triggered by a manual login action,
          // NOT on initial page load from cached Firebase auth state.
          // The login/signup pages will explicitly call syncSession themselves.
          if (manualLoginRef.current) {
            manualLoginRef.current = false;
            const idToken = await firebaseUser.getIdToken();
            syncSession(idToken);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [syncSession, markManualLogin]);

  const signOut = async () => {
    const firebaseAuth = getClientAuth();
    await firebaseSignOut(firebaseAuth);
    try {
      await fetch("/api/logout", { method: "GET" });
    } catch {
      // Ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, syncSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
