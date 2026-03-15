import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerUser } from "@/lib/auth/server";

// GET — Read saved integration settings (API keys, model preferences)
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    // Get user's org
    const userDoc = await db.doc(`users/${user.uid}`).get();
    const orgId = userDoc.data()?.orgId;
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Read settings
    const settingsDoc = await db.doc(`organizations/${orgId}/settings/apiKeys`).get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};

    // Mask API keys — only return last 4 chars
    const masked = {
      openai: {
        configured: !!settings?.openaiApiKey,
        keyHint: settings?.openaiApiKey ? `...${settings.openaiApiKey.slice(-4)}` : null,
        model: settings?.openaiModel || "gpt-4o",
      },
      anthropic: {
        configured: !!settings?.anthropicApiKey,
        keyHint: settings?.anthropicApiKey ? `...${settings.anthropicApiKey.slice(-4)}` : null,
        model: settings?.anthropicModel || "claude-sonnet-4-20250514",
      },
      gemini: {
        configured: !!settings?.geminiApiKey,
        keyHint: settings?.geminiApiKey ? `...${settings.geminiApiKey.slice(-4)}` : null,
        model: settings?.geminiModel || "gemini-2.0-flash",
      },
      browserbase: {
        configured: !!settings?.browserbaseApiKey,
        keyHint: settings?.browserbaseApiKey ? `...${settings.browserbaseApiKey.slice(-4)}` : null,
        projectId: settings?.browserbaseProjectId || null,
      },
    };

    return NextResponse.json(masked);
  } catch (error) {
    console.error("GET /api/settings/integrations error:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

// POST — Save API keys and settings
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    // Get user's org
    const userDoc = await db.doc(`users/${user.uid}`).get();
    const orgId = userDoc.data()?.orgId;
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, string | null> = {};

    // Only update fields that are provided (don't overwrite existing keys with empty)
    if (body.openaiApiKey !== undefined) updates.openaiApiKey = body.openaiApiKey || null;
    if (body.openaiModel !== undefined) updates.openaiModel = body.openaiModel;
    if (body.anthropicApiKey !== undefined) updates.anthropicApiKey = body.anthropicApiKey || null;
    if (body.anthropicModel !== undefined) updates.anthropicModel = body.anthropicModel;
    if (body.geminiApiKey !== undefined) updates.geminiApiKey = body.geminiApiKey || null;
    if (body.geminiModel !== undefined) updates.geminiModel = body.geminiModel;
    if (body.browserbaseApiKey !== undefined) updates.browserbaseApiKey = body.browserbaseApiKey || null;
    if (body.browserbaseProjectId !== undefined) updates.browserbaseProjectId = body.browserbaseProjectId || null;

    await db.doc(`organizations/${orgId}/settings/apiKeys`).set(updates, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/settings/integrations error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
