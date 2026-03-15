import "server-only";

import {
  initializeApp,
  getApps,
  cert,
  getApp,
  App,
} from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

function getPrivateKey(): string {
  // Support both FIREBASE_ADMIN and FIREBASE_PRIVATE_KEY naming
  const raw = process.env.FIREBASE_ADMIN || process.env.FIREBASE_PRIVATE_KEY || "";
  if (!raw) return "";

  // Try base64 decode
  if (!raw.includes("BEGIN") && !raw.includes("\\n") && raw.length > 100) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      if (decoded.includes("BEGIN")) return decoded;
    } catch {
      // Not base64
    }
  }

  return raw.replace(/\\n/g, "\n");
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  // Support both FIREBASE_ADMIN_* and FIREBASE_* naming conventions
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey || !privateKey.includes("BEGIN")) {
    console.warn("Firebase Admin SDK: Missing or incomplete service account credentials. Using demo project.");
    return initializeApp({ projectId: projectId || "demo-project" });
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: Storage | null = null;

function ensureApp(): App {
  if (!_app) _app = getAdminApp();
  return _app;
}

export function getAdminAuth(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}

export function getAdminDb(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}

export function getAdminStorage(): Storage {
  if (!_storage) _storage = getStorage(ensureApp());
  return _storage;
}

export { type Auth, type Firestore, type Storage };
