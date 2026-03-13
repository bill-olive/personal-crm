"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Account } from "@/lib/db/schemas";
import { FieldValue } from "firebase-admin/firestore";

const getCollectionPath = (orgId: string) =>
  `organizations/${orgId}/accounts`;

export async function getAccounts(orgId: string): Promise<Account[]> {
  const db = getAdminDb();
  const snapshot = await db.collection(getCollectionPath(orgId)).get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Account[];
}

export async function getAccount(
  orgId: string,
  id: string
): Promise<Account | null> {
  const db = getAdminDb();
  const doc = await db.collection(getCollectionPath(orgId)).doc(id).get();
  if (!doc.exists) return null;
  return { ...doc.data(), id: doc.id } as Account;
}

export async function createAccount(
  orgId: string,
  data: Omit<Account, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(getCollectionPath(orgId)).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateAccount(
  orgId: string,
  id: string,
  data: Partial<Account>
): Promise<void> {
  const db = getAdminDb();
  const { id: _id, createdAt, updatedAt, ...updateData } = data as Partial<
    Account & { id?: string; createdAt?: unknown; updatedAt?: unknown }
  >;
  await db.collection(getCollectionPath(orgId)).doc(id).update({
    ...updateData,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteAccount(orgId: string, id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(getCollectionPath(orgId)).doc(id).delete();
}
