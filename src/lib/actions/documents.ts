"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import type { CRMDocument, DocumentType } from "@/lib/db/schemas";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const getCollectionPath = (orgId: string) =>
  `organizations/${orgId}/documents`;

export async function getDocuments(orgId: string): Promise<CRMDocument[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as CRMDocument[];
}

export async function getDocument(
  orgId: string,
  id: string
): Promise<CRMDocument | null> {
  const db = getAdminDb();
  const doc = await db.collection(getCollectionPath(orgId)).doc(id).get();
  if (!doc.exists) return null;
  return { ...doc.data(), id: doc.id } as CRMDocument;
}

export async function createDocument(
  orgId: string,
  data: {
    title: string;
    type: DocumentType;
    storagePath: string;
    downloadUrl?: string;
    mimeType: string;
    size: number;
    accountId?: string;
    dealId?: string;
    tags?: string[];
    createdBy: string;
  }
): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(getCollectionPath(orgId)).add({
    title: data.title,
    type: data.type,
    storagePath: data.storagePath,
    downloadUrl: data.downloadUrl,
    mimeType: data.mimeType,
    size: data.size,
    accountId: data.accountId,
    dealId: data.dealId,
    tags: data.tags ?? [],
    createdBy: data.createdBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function deleteDocument(orgId: string, id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(getCollectionPath(orgId)).doc(id).delete();
}

export async function getDocumentsByAccount(
  orgId: string,
  accountId: string
): Promise<CRMDocument[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(getCollectionPath(orgId))
    .where("accountId", "==", accountId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as CRMDocument[];
}
