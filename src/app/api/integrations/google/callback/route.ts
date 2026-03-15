import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerUser } from "@/lib/auth/server";
import { FieldValue } from "firebase-admin/firestore";

// GET — Google OAuth callback (exchanges code for tokens, stores in Firestore)
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings/integrations?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/settings/integrations?error=no_code", request.url)
      );
    }

    const user = await getServerUser();
    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/dashboard/settings/integrations?error=no_token", request.url)
      );
    }

    // Get user's org
    const db = getAdminDb();
    const userDoc = await db.doc(`users/${user.uid}`).get();
    const orgId = userDoc.data()?.orgId;
    if (!orgId) {
      return NextResponse.redirect(
        new URL("/dashboard/settings/integrations?error=no_org", request.url)
      );
    }

    // Get user email from Google
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Store tokens in Firestore
    await db.doc(`organizations/${orgId}/integrationTokens/google`).set({
      service: "google",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      scopes: tokens.scope ? tokens.scope.split(" ") : [],
      metadata: {
        email: userInfo.data.email || null,
        name: userInfo.data.name || null,
        picture: userInfo.data.picture || null,
      },
      connectedBy: user.uid,
      connectedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.redirect(
      new URL("/dashboard/settings/integrations?success=google", request.url)
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/settings/integrations?error=callback_failed`, request.url)
    );
  }
}
