import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerUser } from "@/lib/auth/server";

// POST — Disconnect Google (delete tokens)
export async function POST() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const userDoc = await db.doc(`users/${user.uid}`).get();
    const orgId = userDoc.data()?.orgId;
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    await db.doc(`organizations/${orgId}/integrationTokens/google`).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
