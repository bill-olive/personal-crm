import "server-only";

import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/config";

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
      cookieName: authConfig.cookieName,
      cookieSignatureKeys: authConfig.cookieSignatureKeys,
      serviceAccount: authConfig.serviceAccount,
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
