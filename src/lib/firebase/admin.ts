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

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    return initializeApp({ projectId: "demo-project" });
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

// Convenience re-exports for direct use
export { type Auth, type Firestore, type Storage };
