import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getServerUser, type ServerUser } from "./server";

/**
 * Ensures the authenticated user has a Firestore profile and organization.
 * If the user doc doesn't exist (e.g. signup didn't write to Firestore),
 * creates both the user profile and a default organization.
 *
 * Returns { user, orgId } or null if not authenticated.
 */
export async function ensureUserAndOrg(): Promise<{
  user: ServerUser;
  orgId: string;
} | null> {
  const user = await getServerUser();
  if (!user) return null;

  const db = getAdminDb();
  const userRef = db.doc(`users/${user.uid}`);
  const userDoc = await userRef.get();

  if (userDoc.exists && userDoc.data()?.orgId) {
    return { user, orgId: userDoc.data()!.orgId };
  }

  // User doc doesn't exist or has no orgId — create it
  const orgId = `${user.uid}_org`;
  const orgRef = db.doc(`organizations/${orgId}`);

  // Create org if it doesn't exist
  const orgDoc = await orgRef.get();
  if (!orgDoc.exists) {
    await orgRef.set({
      name: "My Organization",
      domain: user.email?.split("@")[1] || "",
      plan: "pro",
      settings: {
        defaultCurrency: "USD",
        timezone: "America/New_York",
        fiscalYearStart: 1,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // Create or update user doc
  await userRef.set(
    {
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      orgId,
      role: "admin",
      preferences: {
        theme: "system",
        notifications: true,
        emailDigest: true,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { user, orgId };
}
