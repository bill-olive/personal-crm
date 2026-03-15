import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { ensureUserAndOrg } from "@/lib/auth/ensure-user";

// GET — Check Google connection status
export async function GET() {
  try {
    const auth = await ensureUserAndOrg();
    if (!auth) {
      return NextResponse.json({ connected: false, reason: "unauthorized" });
    }

    const { orgId } = auth;
    const db = getAdminDb();

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
