"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Contact } from "@/lib/db/schemas";
import { FieldValue } from "firebase-admin/firestore";

const getCollectionPath = (orgId: string) =>
  `organizations/${orgId}/contacts`;

export async function getContacts(orgId: string): Promise<Contact[]> {
  const db = getAdminDb();
  const snapshot = await db.collection(getCollectionPath(orgId)).get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Contact[];
}

export async function getContact(
  orgId: string,
  id: string
): Promise<Contact | null> {
  const db = getAdminDb();
  const doc = await db.collection(getCollectionPath(orgId)).doc(id).get();
  if (!doc.exists) return null;
  return { ...doc.data(), id: doc.id } as Contact;
}

export async function createContact(
  orgId: string,
  data: Omit<Contact, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(getCollectionPath(orgId)).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateContact(
  orgId: string,
  id: string,
  data: Partial<Contact>
): Promise<void> {
  const db = getAdminDb();
  const { id: _id, createdAt, updatedAt, ...updateData } = data as Partial<
    Contact & { id?: string; createdAt?: unknown; updatedAt?: unknown }
  >;
  await db.collection(getCollectionPath(orgId)).doc(id).update({
    ...updateData,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteContact(orgId: string, id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(getCollectionPath(orgId)).doc(id).delete();
}

export async function getContactsByAccount(
  orgId: string,
  accountId: string
): Promise<Contact[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .where("accountId", "==", accountId)
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Contact[];
}
