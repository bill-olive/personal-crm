"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Insight, InsightType, InsightSource } from "@/lib/db/schemas";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const getCollectionPath = (orgId: string) =>
  `organizations/${orgId}/insights`;

export async function getInsights(orgId: string): Promise<Insight[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Insight[];
}

export async function getInsight(
  orgId: string,
  id: string
): Promise<Insight | null> {
  const db = getAdminDb();
  const doc = await db.collection(getCollectionPath(orgId)).doc(id).get();
  if (!doc.exists) return null;
  return { ...doc.data(), id: doc.id } as Insight;
}

export async function createInsight(
  orgId: string,
  data: {
    type: InsightType;
    title: string;
    content: string;
    summary?: string;
    accountId?: string;
    dealId?: string;
    contactId?: string;
    source: InsightSource;
    tags?: string[];
    createdBy: string;
  }
): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(getCollectionPath(orgId)).add({
    type: data.type,
    title: data.title,
    content: data.content,
    summary: data.summary,
    accountId: data.accountId,
    dealId: data.dealId,
    contactId: data.contactId,
    source: data.source,
    tags: data.tags ?? [],
    createdBy: data.createdBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateInsight(
  orgId: string,
  id: string,
  data: Partial<Pick<Insight, "type" | "title" | "content" | "summary" | "tags">>
): Promise<void> {
  const db = getAdminDb();
  await db.collection(getCollectionPath(orgId)).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteInsight(orgId: string, id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(getCollectionPath(orgId)).doc(id).delete();
}

export async function getInsightsByAccount(
  orgId: string,
  accountId: string
): Promise<Insight[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .where("accountId", "==", accountId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Insight[];
}
