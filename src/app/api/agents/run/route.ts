import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerUser } from "@/lib/auth/server";
import { FieldValue } from "firebase-admin/firestore";
import OpenAI from "openai";

export const maxDuration = 60; // Vercel Pro: 60s max

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { agentId, input } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    // Load agent config
    const agentDoc = await db.doc(`organizations/${orgId}/agents/${agentId}`).get();
    let agentData = agentDoc.exists ? agentDoc.data() : null;

    // If no agent in Firestore, use sample agent data
    if (!agentData) {
      agentData = {
        name: "AI Agent",
        systemPrompt: "You are a helpful AI assistant for 1stUp Health, a company selling HL7 FHIR interoperability solutions to health plans and payers. Help the user with sales research, meeting prep, and customer analysis.",
        tools: [],
      };
    }

    // Get OpenAI API key — first check org settings, fall back to env var
    const settingsDoc = await db.doc(`organizations/${orgId}/settings/apiKeys`).get();
    const apiKey = settingsDoc.data()?.openaiApiKey || process.env.OPENAI_API_KEY;
    const model = settingsDoc.data()?.openaiModel || "gpt-4o";

    if (!apiKey) {
      return NextResponse.json(
        { error: "No OpenAI API key configured. Add one in Settings → API Keys or set OPENAI_API_KEY env var." },
        { status: 400 }
      );
    }

    // Create agent run document
    const runRef = await db.collection(`organizations/${orgId}/agentRuns`).add({
      agentId,
      agentName: agentData.name || "AI Agent",
      triggeredBy: "manual",
      status: "running",
      input: input || "Run default agent task",
      steps: [],
      startedAt: FieldValue.serverTimestamp(),
    });

    // Update agent run count
    if (agentDoc.exists) {
      await agentDoc.ref.update({
        totalRuns: FieldValue.increment(1),
        lastRunAt: FieldValue.serverTimestamp(),
      });
    }

    // Execute with OpenAI
    const openai = new OpenAI({ apiKey });

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: agentData.systemPrompt || "You are a helpful AI agent." },
          { role: "user", content: input || "Perform your default task and provide a summary of findings." },
        ],
        max_tokens: 4096,
      });

      const output = completion.choices[0]?.message?.content || "No output generated.";
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Update run as completed
      await runRef.update({
        status: "completed",
        output,
        tokensUsed,
        completedAt: FieldValue.serverTimestamp(),
        steps: [
          {
            id: "step-1",
            toolName: "openai_completion",
            input: input || "Default task",
            output: output.substring(0, 500) + (output.length > 500 ? "..." : ""),
            status: "completed",
            durationMs: 0,
          },
        ],
      });

      // Also create an insight from the run
      await db.collection(`organizations/${orgId}/insights`).add({
        type: "research",
        title: `Agent Run: ${agentData.name}`,
        content: output,
        summary: output.substring(0, 200),
        source: "agent",
        agentRunId: runRef.id,
        tags: ["agent-generated"],
        createdBy: user.uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        runId: runRef.id,
        status: "completed",
        output: output.substring(0, 500),
        tokensUsed,
      });
    } catch (aiError) {
      // Update run as failed
      await runRef.update({
        status: "failed",
        error: String(aiError),
        completedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        { error: "Agent execution failed", details: String(aiError), runId: runRef.id },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("POST /api/agents/run error:", error);
    return NextResponse.json(
      { error: "Failed to run agent", details: String(error) },
      { status: 500 }
    );
  }
}
