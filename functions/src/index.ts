import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { executeAgent } from "./agent/executor";

admin.initializeApp();

// HTTP-triggered agent execution (60 min timeout, 2GB RAM)
export const executeAgentRun = onRequest(
  {
    timeoutSeconds: 3600,
    memory: "2GiB",
    maxInstances: 10,
  },
  async (req, res) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const body = req.body as Record<string, unknown>;
      const orgId = body?.orgId as string | undefined;
      const runId = body?.runId as string | undefined;

      if (!orgId || !runId) {
        res.status(400).json({
          error: "Missing required fields",
          required: ["orgId", "runId"],
        });
        return;
      }

      await executeAgent(orgId, runId);

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json({
        success: true,
        orgId,
        runId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(500).json({
        error: "Agent execution failed",
        message,
      });
    }
  }
);

// Firestore trigger: when agent run is created with status "queued"
export const onAgentRunCreated = onDocumentCreated(
  {
    document: "organizations/{orgId}/agentRuns/{runId}",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const status = data?.status as string | undefined;

    if (status !== "queued") return;

    const orgId = event.params.orgId;
    const runId = event.params.runId;

    try {
      await executeAgent(orgId, runId);
    } catch (err) {
      const db = admin.firestore();
      await db.doc(`organizations/${orgId}/agentRuns/${runId}`).update({
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

// Scheduled trigger: check for due agent schedules
export const scheduledAgentCheck = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "America/New_York",
  },
  async () => {
    const db = admin.firestore();
    const now = new Date();

    const orgsSnap = await db.collection("organizations").get();

    for (const orgDoc of orgsSnap.docs) {
      const orgId = orgDoc.id;
      const agentsSnap = await db
        .collection(`organizations/${orgId}/agents`)
        .where("status", "==", "active")
        .get();

      for (const agentDoc of agentsSnap.docs) {
        const agentData = agentDoc.data();
        const schedule = agentData.schedule as
          | { enabled?: boolean; cron?: string; timezone?: string }
          | undefined;

        if (!schedule?.enabled || !schedule.cron) continue;

        if (!cronMatches(schedule.cron, now, schedule.timezone ?? "America/New_York")) {
          continue;
        }

        try {
          await db.collection(`organizations/${orgId}/agentRuns`).add({
            agentId: agentDoc.id,
            agentName: agentData.name ?? "Scheduled Agent",
            triggeredBy: "schedule",
            status: "queued",
            input: "Scheduled run",
            steps: [],
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (err) {
          console.error(`Failed to create scheduled run for agent ${agentDoc.id}:`, err);
        }
      }
    }
  }
);

/**
 * Check if a cron expression matches the current time.
 * Supports: minute hour dayOfMonth month dayOfWeek
 * e.g. "0 9 * * 1-5" = weekdays at 9:00 AM
 */
function cronMatches(
  cron: string,
  date: Date,
  timeZone: string
): boolean {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 5) return false;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    minute: "numeric",
    hour: "numeric",
    hour12: false,
    day: "numeric",
    month: "numeric",
    weekday: "short",
  });

  const parts2 = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts2.find((p) => p.type === type)?.value ?? "";

  const currentMinute = parseInt(get("minute"), 10);
  const currentHour = parseInt(get("hour"), 10);
  const currentDay = parseInt(get("day"), 10);
  const currentMonth = parseInt(get("month"), 10);
  const currentWeekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));

  const match = (expr: string, value: number, min: number, max: number): boolean => {
    if (expr === "*") return true;
    if (expr.includes(",")) {
      return expr.split(",").some((p) => match(p.trim(), value, min, max));
    }
    if (expr.includes("-")) {
      const [a, b] = expr.split("-").map((x) => parseInt(x.trim(), 10));
      return value >= a && value <= b;
    }
    if (expr.includes("/")) {
      const [base, step] = expr.split("/").map((x) => parseInt(x.trim(), 10));
      return (value - base) % step === 0;
    }
    return parseInt(expr, 10) === value;
  };

  return (
    match(minute, currentMinute, 0, 59) &&
    match(hour, currentHour, 0, 23) &&
    match(dayOfMonth, currentDay, 1, 31) &&
    match(month, currentMonth, 1, 12) &&
    match(dayOfWeek, currentWeekday, 0, 6)
  );
}
