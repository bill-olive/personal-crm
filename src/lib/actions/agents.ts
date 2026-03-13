"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Agent, AgentRun } from "@/lib/db/schemas";

// ─── Agent CRUD ──────────────────────────────────────────────────────────────

export async function getAgents(orgId: string): Promise<Agent[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(`organizations/${orgId}/agents`)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Agent));
}

export async function getAgent(orgId: string, id: string): Promise<Agent | null> {
  const db = getAdminDb();
  const doc = await db.doc(`organizations/${orgId}/agents/${id}`).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Agent;
}

export async function createAgent(
  orgId: string,
  data: Omit<Agent, "id" | "createdAt" | "updatedAt" | "totalRuns" | "lastRunAt">
): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(`organizations/${orgId}/agents`).add({
    ...data,
    totalRuns: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateAgent(
  orgId: string,
  id: string,
  data: Partial<Agent>
): Promise<void> {
  const db = getAdminDb();
  await db.doc(`organizations/${orgId}/agents/${id}`).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteAgent(orgId: string, id: string): Promise<void> {
  const db = getAdminDb();
  await db.doc(`organizations/${orgId}/agents/${id}`).delete();
}

// ─── Agent Run CRUD ──────────────────────────────────────────────────────────

export async function getAgentRuns(
  orgId: string,
  agentId?: string
): Promise<AgentRun[]> {
  const db = getAdminDb();
  let query = db
    .collection(`organizations/${orgId}/agentRuns`)
    .orderBy("startedAt", "desc")
    .limit(50);

  if (agentId) {
    query = query.where("agentId", "==", agentId);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AgentRun));
}

export async function getAgentRun(
  orgId: string,
  runId: string
): Promise<AgentRun | null> {
  const db = getAdminDb();
  const doc = await db.doc(`organizations/${orgId}/agentRuns/${runId}`).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as AgentRun;
}

export async function createAgentRun(
  orgId: string,
  data: Omit<AgentRun, "id" | "startedAt">
): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(`organizations/${orgId}/agentRuns`).add({
    ...data,
    startedAt: FieldValue.serverTimestamp(),
  });

  // Increment agent run count
  await db.doc(`organizations/${orgId}/agents/${data.agentId}`).update({
    totalRuns: FieldValue.increment(1),
    lastRunAt: FieldValue.serverTimestamp(),
  });

  return ref.id;
}

export async function updateAgentRun(
  orgId: string,
  runId: string,
  data: Partial<AgentRun>
): Promise<void> {
  const db = getAdminDb();
  await db.doc(`organizations/${orgId}/agentRuns/${runId}`).update(data);
}
