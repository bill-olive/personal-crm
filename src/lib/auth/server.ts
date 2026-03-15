import "server-only";

import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";

// Replicate auth config inline to avoid circular dependency with middleware
function getPrivateKey(): string {
  let raw = process.env.FIREBASE_ADMIN || process.env.FIREBASE_PRIVATE_KEY || "";
  if (!raw) return "";
  // Strip surrounding quotes (common Vercel paste issue)
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1);
  }
  if (raw.includes("-----BEGIN") && raw.includes("\n")) return raw;
  if (raw.includes("\\n")) return raw.replace(/\\n/g, "\n");
  if (!raw.includes("BEGIN") && raw.length > 100) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      if (decoded.includes("BEGIN")) return decoded;
    } catch { /* not base64 */ }
  }
  if (raw.includes("-----BEGIN") && !raw.includes("\n")) {
    return raw
      .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
      .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----\n");
  }
  return raw;
}

export interface ServerUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const tokens = await getTokens(cookieStore, {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      cookieName: process.env.AUTH_COOKIE_NAME || "__session",
      cookieSignatureKeys: (
        process.env.AUTH_COOKIE_SIGNATURE_KEYS || "secret1,secret2"
      ).split(","),
      serviceAccount: {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: getPrivateKey(),
      },
    });

    if (!tokens) return null;

    return {
      uid: tokens.decodedToken.uid,
      email: tokens.decodedToken.email || null,
      displayName: tokens.decodedToken.name || null,
      photoURL: tokens.decodedToken.picture || null,
      emailVerified: tokens.decodedToken.email_verified || false,
    };
  } catch {
    return null;
  }
}
