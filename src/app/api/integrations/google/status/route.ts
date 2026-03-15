import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerUser } from "@/lib/auth/server";

// GET — Check Google connection status
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ connected: false, reason: "unauthorized" });
    }

    const db = getAdminDb();
    const userDoc = await db.doc(`users/${user.uid}`).get();
    const orgId = userDoc.data()?.orgId;
    if (!orgId) {
      return NextResponse.json({ connected: false, reason: "no_org" });
    }

    const tokenDoc = await db.doc(`organizations/${orgId}/integrationTokens/google`).get();
    if (!tokenDoc.exists) {
      return NextResponse.json({ connected: false });
    }

    const data = tokenDoc.data();
    return NextResponse.json({
      connected: true,
      email: data?.metadata?.email || null,
      name: data?.metadata?.name || null,
      scopes: data?.scopes || [],
      connectedAt: data?.connectedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Google status error:", error);
    return NextResponse.json({ connected: false, error: String(error) });
  }
}
