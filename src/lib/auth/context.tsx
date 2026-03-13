"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firebaseAuth = getClientAuth();
    const unsubscribe = onIdTokenChanged(
      firebaseAuth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          // Sync token to cookie via API
          await fetch("/api/login", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
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
  }, []);

  const signOut = async () => {
    const firebaseAuth = getClientAuth();
    await firebaseSignOut(firebaseAuth);
    await fetch("/api/logout", { method: "GET" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
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
