import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { ensureUserAndOrg } from "@/lib/auth/ensure-user";

// POST — Disconnect Google (delete tokens)
export async function POST() {
  try {
    const auth = await ensureUserAndOrg();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = auth;
    const db = getAdminDb();

    await db.doc(`organizations/${orgId}/integrationTokens/google`).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
