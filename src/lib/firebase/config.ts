export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Handle FIREBASE_ADMIN (private key) which may be:
// 1. Raw key with actual newlines
// 2. JSON-escaped with \\n literals
// 3. Base64-encoded (for Vercel compatibility)
function getPrivateKey(): string {
  // Support both FIREBASE_ADMIN and FIREBASE_PRIVATE_KEY naming
  const raw = process.env.FIREBASE_ADMIN || process.env.FIREBASE_PRIVATE_KEY || "";
  if (!raw) return "";

  // Try base64 decode first (if user base64-encoded the key for Vercel)
  if (!raw.includes("BEGIN") && !raw.includes("\\n") && raw.length > 100) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      if (decoded.includes("BEGIN")) return decoded;
    } catch {
      // Not base64, continue
    }
  }

  // Replace escaped newlines (JSON-style \\n) with actual newlines
  return raw.replace(/\\n/g, "\n");
}

export const authConfig = {
  cookieName: process.env.AUTH_COOKIE_NAME || "__session",
  cookieSignatureKeys: (
    process.env.AUTH_COOKIE_SIGNATURE_KEYS || "secret1,secret2"
  ).split(","),
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24, // 12 days
  },
  serviceAccount: {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: getPrivateKey(),
  },
};
