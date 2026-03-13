"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function ensureApp(): FirebaseApp {
  if (!_app) _app = getFirebaseApp();
  return _app;
}

export function getClientAuth(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}

export function getClientDb(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}

export function getClientStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(ensureApp());
  return _storage;
}

// Legacy exports (lazy — will only init when accessed from client context)
export const auth = typeof window !== "undefined" ? getClientAuth() : (null as unknown as Auth);
export const db = typeof window !== "undefined" ? getClientDb() : (null as unknown as Firestore);
export const storage = typeof window !== "undefined" ? getClientStorage() : (null as unknown as FirebaseStorage);
