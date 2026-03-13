"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Deal, DealStage } from "@/lib/db/schemas";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const getCollectionPath = (orgId: string) =>
  `organizations/${orgId}/deals`;

export async function getDeals(orgId: string): Promise<Deal[]> {
  const db = getAdminDb();
  const snapshot = await db.collection(getCollectionPath(orgId)).get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Deal[];
}

export async function getDeal(
  orgId: string,
  id: string
): Promise<Deal | null> {
  const db = getAdminDb();
  const doc = await db.collection(getCollectionPath(orgId)).doc(id).get();
  if (!doc.exists) return null;
  return { ...doc.data(), id: doc.id } as Deal;
}

type CreateDealInput = Omit<Deal, "id" | "createdAt" | "updatedAt" | "expectedCloseDate"> & {
  expectedCloseDate?: Date | string | Timestamp;
};

export async function createDeal(
  orgId: string,
  data: CreateDealInput
): Promise<string> {
  const db = getAdminDb();
  const { expectedCloseDate, ...rest } = data;
  const expectedCloseDateTimestamp = expectedCloseDate
    ? typeof expectedCloseDate === "string"
      ? Timestamp.fromDate(new Date(expectedCloseDate))
      : expectedCloseDate instanceof Date
        ? Timestamp.fromDate(expectedCloseDate)
        : expectedCloseDate
    : undefined;
  const ref = await db.collection(getCollectionPath(orgId)).add({
    ...rest,
    expectedCloseDate: expectedCloseDateTimestamp,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateDeal(
  orgId: string,
  id: string,
  data: Partial<Deal>
): Promise<void> {
  const db = getAdminDb();
  const { id: _id, createdAt, updatedAt, ...updateData } = data as Partial<
    Deal & { id?: string; createdAt?: unknown; updatedAt?: unknown }
  >;
  await db.collection(getCollectionPath(orgId)).doc(id).update({
    ...updateData,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteDeal(orgId: string, id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(getCollectionPath(orgId)).doc(id).delete();
}

export async function getDealsByAccount(
  orgId: string,
  accountId: string
): Promise<Deal[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .where("accountId", "==", accountId)
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Deal[];
}

export async function getDealsByStage(
  orgId: string,
  stage: DealStage
): Promise<Deal[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .where("stage", "==", stage)
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Deal[];
}
