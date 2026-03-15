import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { ensureUserAndOrg } from "@/lib/auth/ensure-user";
import { FieldValue } from "firebase-admin/firestore";
import OpenAI from "openai";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const auth = await ensureUserAndOrg();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 });
    }

    const { user, orgId } = auth;
    const db = getAdminDb();
    const body = await request.json();
    const { agentId, input } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    // Load agent config (may not exist in Firestore — use default)
    const agentDoc = await db.doc(`organizations/${orgId}/agents/${agentId}`).get();
    const agentData = agentDoc.exists
      ? agentDoc.data()
      : {
          name: "AI Research Agent",
          systemPrompt:
            "You are a helpful AI assistant for 1stUp Health, a company selling HL7 FHIR interoperability solutions to health plans and payers. Help with sales research, meeting prep, competitive analysis, and customer insights. Be thorough and structured in your responses.",
        };

    // Get OpenAI API key — org settings first, then env var
    const settingsDoc = await db.doc(`organizations/${orgId}/settings/apiKeys`).get();
    const apiKey = settingsDoc.data()?.openaiApiKey || process.env.OPENAI_API_KEY;
    const model = settingsDoc.data()?.openaiModel || "gpt-4o";

    if (!apiKey) {
      return NextResponse.json(
        { error: "No OpenAI API key configured. Go to Settings → Integrations and add your OpenAI key, or set OPENAI_API_KEY env var on Vercel." },
        { status: 400 }
      );
    }

    // Create agent run document
    const runRef = await db.collection(`organizations/${orgId}/agentRuns`).add({
      agentId,
      agentName: agentData!.name || "AI Agent",
      triggeredBy: "manual",
      status: "running",
      input: input || "Run default agent task",
      steps: [],
      startedAt: FieldValue.serverTimestamp(),
    });

    // Execute with OpenAI
    const openai = new OpenAI({ apiKey });

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: agentData!.systemPrompt || "You are a helpful AI agent." },
          { role: "user", content: input || "Perform your default task and provide a comprehensive summary of findings." },
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
        steps: [{
          id: "step-1",
          toolName: "openai_completion",
          input: (input || "Default task").substring(0, 200),
          output: output.substring(0, 500),
          status: "completed",
          durationMs: 0,
        }],
      });

      // Also create an insight from the run
      await db.collection(`organizations/${orgId}/insights`).add({
        type: "research",
        title: `Agent Run: ${agentData!.name}`,
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
