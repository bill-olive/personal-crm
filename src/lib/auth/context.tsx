"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  // Sync the Firebase ID token to a server-side cookie via the middleware /api/login endpoint
  const syncSession = useCallback(async (idToken: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/login", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        console.error("Session sync failed:", response.status, await response.text().catch(() => ""));
        return false;
      }
      return true;
    } catch (err) {
      console.error("Session sync error:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const firebaseAuth = getClientAuth();
    const unsubscribe = onIdTokenChanged(
      firebaseAuth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          // Try to sync — don't block user state on cookie sync success
          syncSession(idToken);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [syncSession]);

  const signOut = async () => {
    const firebaseAuth = getClientAuth();
    await firebaseSignOut(firebaseAuth);
    // Clear server session cookie
    try {
      await fetch("/api/logout", { method: "GET" });
    } catch {
      // Ignore logout fetch errors
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
