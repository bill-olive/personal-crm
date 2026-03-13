"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Activity, ActivityType } from "@/lib/db/schemas";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const getCollectionPath = (orgId: string) =>
  `organizations/${orgId}/activities`;

export async function getActivities(orgId: string): Promise<Activity[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Activity[];
}

export async function getActivity(
  orgId: string,
  id: string
): Promise<Activity | null> {
  const db = getAdminDb();
  const doc = await db.collection(getCollectionPath(orgId)).doc(id).get();
  if (!doc.exists) return null;
  return { ...doc.data(), id: doc.id } as Activity;
}

export async function createActivity(
  orgId: string,
  data: {
    type: ActivityType;
    subject: string;
    description?: string;
    accountId?: string;
    contactId?: string;
    dealId?: string;
    dueDate?: string;
    ownerId: string;
  }
): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(getCollectionPath(orgId)).add({
    type: data.type,
    subject: data.subject,
    description: data.description,
    accountId: data.accountId,
    contactId: data.contactId,
    dealId: data.dealId,
    dueDate: data.dueDate
      ? Timestamp.fromDate(new Date(data.dueDate))
      : undefined,
    ownerId: data.ownerId,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateActivity(
  orgId: string,
  id: string,
  data: Partial<Pick<Activity, "type" | "subject" | "description" | "dueDate" | "completedAt">>
): Promise<void> {
  const db = getAdminDb();
  const updateData: Record<string, unknown> = { ...data };
  if (data.dueDate !== undefined) {
    updateData.dueDate =
      typeof data.dueDate === "string"
        ? Timestamp.fromDate(new Date(data.dueDate))
        : data.dueDate;
  }
  await db.collection(getCollectionPath(orgId)).doc(id).update(updateData);
}

export async function deleteActivity(orgId: string, id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(getCollectionPath(orgId)).doc(id).delete();
}

export async function getActivitiesByAccount(
  orgId: string,
  accountId: string
): Promise<Activity[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .where("accountId", "==", accountId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Activity[];
}

export async function getActivitiesByDeal(
  orgId: string,
  dealId: string
): Promise<Activity[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .where("dealId", "==", dealId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Activity[];
}
