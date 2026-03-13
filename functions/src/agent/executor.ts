import OpenAI from "openai";
import * as admin from "firebase-admin";
import type { OAuth2Client } from "google-auth-library";
import { WebClient } from "@slack/web-api";
import { buildContext } from "./context";
import { getToolDefinitions } from "./tools";

interface AgentConfig {
  systemPrompt: string;
  tools: string[];
  integrations: Record<string, boolean>;
  context: {
    accountIds: string[];
    dealIds: string[];
    documentIds: string[];
    customInstructions?: string;
  };
}

interface AgentRunData {
  agentId: string;
  agentName?: string;
  input: string;
  status: string;
  ownerId?: string;
}

const MAX_ITERATIONS = 20;

export async function executeAgent(orgId: string, runId: string): Promise<void> {
  const db = admin.firestore();
  const runRef = db.doc(`organizations/${orgId}/agentRuns/${runId}`);

  try {
    // 1. Load agent run document
    const runDoc = await runRef.get();
    if (!runDoc.exists) {
      throw new Error(`Agent run ${runId} not found`);
    }

    const runData = runDoc.data() as AgentRunData;
    const { agentId, input, ownerId } = runData;

    if (!agentId || !input) {
      throw new Error("Missing agentId or input in run document");
    }

    // 2. Load agent config
    const agentDoc = await db.doc(`organizations/${orgId}/agents/${agentId}`).get();
    if (!agentDoc.exists) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const config = agentDoc.data() as AgentConfig;
    if (!config.systemPrompt || !config.tools) {
      throw new Error("Invalid agent config: missing systemPrompt or tools");
    }

    // 3. Build context from CRM data
    const contextStr = await buildContext(db, orgId, config.context);

    // 4. Update status to "running"
    await runRef.update({
      status: "running",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 5. Initialize OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    const openai = new OpenAI({ apiKey });

    // 6. Execute with tool calling loop
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          config.systemPrompt +
          "\n\n## CRM Context:\n" +
          contextStr +
          "\n\nYou have access to tools. Use them when needed to gather context or perform actions.",
      },
      { role: "user", content: input },
    ];

    let steps: Array<{
      id: string;
      toolName: string;
      input: string;
      output: string;
      status: "completed" | "failed";
      timestamp: admin.firestore.FieldValue;
      durationMs: number;
    }> = [];
    let continueLoop = true;
    let iteration = 0;
    let lastResponse: OpenAI.Chat.ChatCompletion | null = null;

    const toolDefs = getToolDefinitions(config.tools);

    while (continueLoop && iteration < MAX_ITERATIONS) {
      iteration++;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
        tool_choice: toolDefs.length > 0 ? "auto" : "none",
      });

      lastResponse = response;
      const choice = response.choices[0];

      if (!choice?.message) {
        await runRef.update({
          status: "failed",
          error: "No response from model",
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
      }

      if (choice.finish_reason === "tool_calls" && choice.message.tool_calls?.length) {
        for (const toolCall of choice.message.tool_calls) {
          const stepStart = Date.now();
          let result: unknown;
          try {
            const args =
              typeof toolCall.function.arguments === "string"
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.function.arguments;
            result = await executeTool(
              db,
              orgId,
              toolCall.function.name,
              args,
              config.integrations,
              ownerId
            );
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            result = { error: errMsg };
          }

          const durationMs = Date.now() - stepStart;
          steps.push({
            id: `step-${steps.length}`,
            toolName: toolCall.function.name,
            input: toolCall.function.arguments,
            output: JSON.stringify(result),
            status: (result as { error?: string }).error ? "failed" : "completed",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            durationMs,
          });

          await runRef.update({
            steps,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          messages.push(choice.message);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
      } else {
        // Final response
        const output = choice.message.content ?? "";
        await runRef.update({
          status: "completed",
          output,
          steps,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          tokensUsed: response.usage?.total_tokens,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        continueLoop = false;
      }
    }

    if (continueLoop && iteration >= MAX_ITERATIONS) {
      await runRef.update({
        status: "completed",
        output:
          "Agent reached maximum iterations. Partial results may be available in steps.",
        steps,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        tokensUsed: lastResponse?.usage?.total_tokens,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await runRef.update({
      status: "failed",
      error: errMsg,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    throw err;
  }
}

async function executeTool(
  db: admin.firestore.Firestore,
  orgId: string,
  toolName: string,
  args: Record<string, unknown>,
  integrations: Record<string, boolean>,
  ownerId?: string
): Promise<unknown> {
  const basePath = (collection: string) => `organizations/${orgId}/${collection}`;

  switch (toolName) {
    case "crm_read": {
      const entity = args.entity as string;
      const ids = args.ids as string[] | undefined;
      const accountId = args.accountId as string | undefined;
      const dealId = args.dealId as string | undefined;

      const collection = entity;
      const path = basePath(collection);

      if (ids?.length) {
        const results: unknown[] = [];
        for (const id of ids.slice(0, 20)) {
          const doc = await db.doc(`${path}/${id}`).get();
          if (doc.exists) results.push({ id: doc.id, ...doc.data() });
        }
        return { results };
      }

      let query = db.collection(path).limit(50) as admin.firestore.Query;
      if (entity === "contacts" || entity === "deals") {
        if (accountId) query = query.where("accountId", "==", accountId);
      } else if (entity === "activities" || entity === "insights" || entity === "documents") {
        if (accountId) query = query.where("accountId", "==", accountId);
        else if (dealId) query = query.where("dealId", "==", dealId);
      }

      const snap = await query.get();
      return { results: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
    }

    case "crm_write_activity": {
      const { type, subject, description, accountId, contactId, dealId, dueDate, ownerId: oid } =
        args as Record<string, unknown>;
      const ref = await db.collection(basePath("activities")).add({
        type,
        subject,
        description: description ?? undefined,
        accountId: accountId ?? undefined,
        contactId: contactId ?? undefined,
        dealId: dealId ?? undefined,
        dueDate: dueDate ? admin.firestore.Timestamp.fromDate(new Date(dueDate as string)) : undefined,
        ownerId: ownerId ?? oid ?? "system",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { id: ref.id, created: true };
    }

    case "crm_write_insight": {
      const { type, title, content, summary, accountId, dealId, contactId, tags, createdBy } =
        args as Record<string, unknown>;
      const ref = await db.collection(basePath("insights")).add({
        type,
        title,
        content,
        summary: summary ?? undefined,
        accountId: accountId ?? undefined,
        dealId: dealId ?? undefined,
        contactId: contactId ?? undefined,
        source: "agent",
        tags: tags ?? [],
        createdBy: createdBy ?? ownerId ?? "system",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { id: ref.id, created: true };
    }

    case "email_search":
    case "email_draft":
    case "email_send": {
      if (!integrations.email) return { error: "Email integration not enabled" };
      const auth = await getGoogleAuth(db, orgId);
      if (!auth) return { error: "Google not connected" };
      const { GmailConnector } = await import("../integrations/gmail");
      const gmail = new GmailConnector(auth);

      if (toolName === "email_search") {
        const results = await gmail.listEmails(
          (args.query as string) ?? "",
          (args.maxResults as number) ?? 20
        );
        return { emails: results };
      }
      if (toolName === "email_draft") {
        const draftId = await gmail.draftEmail(
          args.to as string,
          args.subject as string,
          args.body as string
        );
        return { draftId, created: true };
      }
      const msgId = await gmail.sendEmail(
        args.to as string,
        args.subject as string,
        args.body as string
      );
      return { messageId: msgId, sent: true };
    }

    case "calendar_list":
    case "calendar_create":
    case "calendar_find_slots": {
      if (!integrations.calendar) return { error: "Calendar integration not enabled" };
      const auth = await getGoogleAuth(db, orgId);
      if (!auth) return { error: "Google not connected" };
      const { CalendarConnector } = await import("../integrations/calendar");
      const cal = new CalendarConnector(auth);

      if (toolName === "calendar_list") {
        const events = await cal.listEvents(
          args.timeMin as string,
          args.timeMax as string,
          args.query as string | undefined
        );
        return { events };
      }
      if (toolName === "calendar_create") {
        const event = await cal.createEvent(
          args.summary as string,
          args.start as string,
          args.end as string,
          (args.attendees as string[]) ?? [],
          args.description as string | undefined
        );
        return { event };
      }
      const slots = await cal.findFreeSlots(
        (args.attendeeEmails as string[]) ?? [],
        (args.durationMinutes as number) ?? 30,
        {
          start: args.dateRangeStart as string,
          end: args.dateRangeEnd as string,
        }
      );
      return { slots };
    }

    case "drive_search":
    case "drive_download":
    case "drive_upload": {
      if (!integrations.drive) return { error: "Drive integration not enabled" };
      const auth = await getGoogleAuth(db, orgId);
      if (!auth) return { error: "Google not connected" };
      const { DriveConnector } = await import("../integrations/drive");
      const drive = new DriveConnector(auth);

      if (toolName === "drive_search") {
        const files = await drive.listFiles(
          args.query as string,
          args.folderId as string | undefined,
          args.mimeType as string | undefined
        );
        return { files };
      }
      if (toolName === "drive_download") {
        const buf = await drive.downloadFile(args.fileId as string);
        return { content: buf.toString("base64"), mimeType: "application/octet-stream" };
      }
      const file = await drive.uploadFile(
        args.name as string,
        args.content as string,
        args.mimeType as string,
        args.folderId as string | undefined
      );
      return { file };
    }

    case "docs_read":
    case "docs_create":
    case "docs_append": {
      if (!integrations.docs) return { error: "Docs integration not enabled" };
      const auth = await getGoogleAuth(db, orgId);
      if (!auth) return { error: "Google not connected" };
      const { DocsConnector } = await import("../integrations/docs");
      const docs = new DocsConnector(auth);

      if (toolName === "docs_read") {
        const doc = await docs.getDocument(args.documentId as string);
        return { document: doc };
      }
      if (toolName === "docs_create") {
        const doc = await docs.createDocument(args.title as string, args.content as string);
        return { document: doc };
      }
      await docs.appendToDocument(args.documentId as string, args.content as string);
      return { updated: true };
    }

    case "slack_search":
    case "slack_post":
    case "slack_list_channels": {
      if (!integrations.slack) return { error: "Slack integration not enabled" };
      const token = await getSlackToken(db, orgId);
      if (!token) return { error: "Slack not connected" };
      const slack = new WebClient(token);

      if (toolName === "slack_search") {
        const res = await slack.search.messages({
          query: args.query as string,
          count: (args.count as number) ?? 20,
        });
        return { messages: res.messages?.matches ?? [] };
      }
      if (toolName === "slack_post") {
        const res = await slack.chat.postMessage({
          channel: args.channel as string,
          text: args.text as string,
        });
        return { ts: res.ts, posted: true };
      }
      const res = await slack.conversations.list({
        types: "public_channel,private_channel",
        limit: 200,
      });
      return { channels: res.channels ?? [] };
    }

    case "web_search": {
      const apiKey = process.env.SERPER_API_KEY;
      if (!apiKey) return { error: "Web search not configured (SERPER_API_KEY)" };
      const query = args.query as string;
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, num: (args.maxResults as number) ?? 10 }),
      });
      const data = (await res.json()) as { organic?: Array<{ title: string; snippet: string; link: string }> };
      return { results: data.organic ?? [] };
    }

    case "browserbase_navigate":
    case "browserbase_extract": {
      return { error: "Browserbase integration not yet implemented in Cloud Functions" };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

async function getGoogleAuth(
  db: admin.firestore.Firestore,
  orgId: string
): Promise<OAuth2Client | null> {
  const doc = await db.doc(`organizations/${orgId}/integrationTokens/google`).get();
  if (!doc.exists) return null;
  const data = doc.data();
  const accessToken = data?.accessToken;
  const refreshToken = data?.refreshToken;
  if (!accessToken || !refreshToken) return null;

  const { createAuthenticatedClient } = await import("../integrations/google");
  return createAuthenticatedClient(accessToken, refreshToken);
}

async function getSlackToken(db: admin.firestore.Firestore, orgId: string): Promise<string | null> {
  const doc = await db.doc(`organizations/${orgId}/integrationTokens/slack`).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return data?.accessToken ?? null;
}
