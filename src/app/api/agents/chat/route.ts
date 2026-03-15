import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { ensureUserAndOrg } from "@/lib/auth/ensure-user";
import OpenAI from "openai";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const auth = await ensureUserAndOrg();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 });
    }

    const { orgId } = auth;
    const db = getAdminDb();

    const body = await request.json();
    const { agentId, messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Load agent config for system prompt
    let systemPrompt = "You are a helpful AI assistant for 1stUp Health, a company selling HL7 FHIR interoperability solutions to health plans and payers.";

    if (agentId) {
      const agentDoc = await db.doc(`organizations/${orgId}/agents/${agentId}`).get();
      if (agentDoc.exists) {
        systemPrompt = agentDoc.data()?.systemPrompt || systemPrompt;
      }
    }

    // Get OpenAI API key
    const settingsDoc = await db.doc(`organizations/${orgId}/settings/apiKeys`).get();
    const apiKey = settingsDoc.data()?.openaiApiKey || process.env.OPENAI_API_KEY;
    const model = settingsDoc.data()?.openaiModel || "gpt-4o";

    if (!apiKey) {
      return NextResponse.json(
        { error: "No OpenAI API key configured. Add one in Settings → API Keys." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 4096,
    });

    const reply = completion.choices[0]?.message?.content || "No response generated.";

    return NextResponse.json({
      role: "assistant",
      content: reply,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("POST /api/agents/chat error:", error);
    return NextResponse.json(
      { error: "Chat failed", details: String(error) },
      { status: 500 }
    );
  }
}
