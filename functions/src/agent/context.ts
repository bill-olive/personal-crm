import type { Firestore } from "firebase-admin/firestore";
import type { Timestamp } from "firebase-admin/firestore";

export interface AgentContextConfig {
  accountIds: string[];
  dealIds: string[];
  documentIds: string[];
  customInstructions?: string;
}

interface FirestoreDoc {
  id: string;
  [key: string]: unknown;
}

/**
 * Build a structured markdown string with CRM context for the agent.
 * Fetches accounts, contacts, deals, activities, insights, and documents
 * based on the agent's context configuration.
 */
export async function buildContext(
  db: Firestore,
  orgId: string,
  config: AgentContextConfig
): Promise<string> {
  const sections: string[] = [];

  if (config.customInstructions) {
    sections.push("## Custom Instructions\n" + config.customInstructions);
  }

  const { accountIds, dealIds, documentIds } = config;

  // Fetch accounts (either specific IDs or all if empty means "all in scope")
  const accounts = await fetchAccounts(db, orgId, accountIds);
  if (accounts.length > 0) {
    sections.push(formatAccounts(accounts));
  }

  // Fetch contacts for those accounts
  const contactIds = new Set<string>();
  for (const acc of accounts) {
    const contacts = await fetchContactsByAccount(db, orgId, acc.id);
    contacts.forEach((c) => contactIds.add(c.id));
  }
  const contacts = await fetchContacts(db, orgId, Array.from(contactIds));
  if (contacts.length > 0) {
    sections.push(formatContacts(contacts));
  }

  // Fetch deals (specific IDs or those linked to accounts)
  const deals = await fetchDeals(db, orgId, dealIds, accounts.map((a) => a.id));
  if (deals.length > 0) {
    sections.push(formatDeals(deals));
  }

  // Fetch activities for accounts and deals
  const activityAccountIds = [...new Set([...accountIds, ...accounts.map((a) => a.id)])];
  const activityDealIds = [...new Set([...dealIds, ...deals.map((d) => d.id)])];
  const activities = await fetchActivities(db, orgId, activityAccountIds, activityDealIds);
  if (activities.length > 0) {
    sections.push(formatActivities(activities));
  }

  // Fetch insights for accounts and deals
  const insights = await fetchInsights(db, orgId, accountIds, dealIds);
  if (insights.length > 0) {
    sections.push(formatInsights(insights));
  }

  // Fetch documents
  const documents = await fetchDocuments(db, orgId, documentIds, accountIds, dealIds);
  if (documents.length > 0) {
    sections.push(formatDocuments(documents));
  }

  if (sections.length === 0) {
    return "No CRM context available for this agent run.";
  }

  return sections.join("\n\n");
}

async function fetchAccounts(
  db: Firestore,
  orgId: string,
  accountIds: string[]
): Promise<FirestoreDoc[]> {
  const basePath = `organizations/${orgId}/accounts`;
  if (accountIds.length === 0) {
    const snap = await db.collection(basePath).limit(50).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreDoc));
  }
  const results: FirestoreDoc[] = [];
  for (const id of accountIds.slice(0, 20)) {
    const doc = await db.doc(`${basePath}/${id}`).get();
    if (doc.exists) {
      results.push({ id: doc.id, ...doc.data() } as FirestoreDoc);
    }
  }
  return results;
}

async function fetchContacts(
  db: Firestore,
  orgId: string,
  contactIds: string[]
): Promise<FirestoreDoc[]> {
  if (contactIds.length === 0) return [];
  const basePath = `organizations/${orgId}/contacts`;
  const results: FirestoreDoc[] = [];
  for (const id of contactIds.slice(0, 50)) {
    const doc = await db.doc(`${basePath}/${id}`).get();
    if (doc.exists) {
      results.push({ id: doc.id, ...doc.data() } as FirestoreDoc);
    }
  }
  return results;
}

async function fetchContactsByAccount(
  db: Firestore,
  orgId: string,
  accountId: string
): Promise<FirestoreDoc[]> {
  const snap = await db
    .collection(`organizations/${orgId}/contacts`)
    .where("accountId", "==", accountId)
    .limit(20)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreDoc));
}

async function fetchDeals(
  db: Firestore,
  orgId: string,
  dealIds: string[],
  accountIds: string[]
): Promise<FirestoreDoc[]> {
  const basePath = `organizations/${orgId}/deals`;
  const seen = new Set<string>();
  const results: FirestoreDoc[] = [];

  for (const id of dealIds.slice(0, 20)) {
    if (seen.has(id)) continue;
    const doc = await db.doc(`${basePath}/${id}`).get();
    if (doc.exists) {
      const data = { id: doc.id, ...doc.data() } as FirestoreDoc;
      results.push(data);
      seen.add(id);
    }
  }

  for (const accountId of accountIds) {
    const snap = await db
      .collection(basePath)
      .where("accountId", "==", accountId)
      .limit(10)
      .get();
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        results.push({ id: d.id, ...d.data() } as FirestoreDoc);
        seen.add(d.id);
      }
    }
  }

  return results;
}

async function fetchActivities(
  db: Firestore,
  orgId: string,
  accountIds: string[],
  dealIds: string[]
): Promise<FirestoreDoc[]> {
  const basePath = `organizations/${orgId}/activities`;
  const seen = new Set<string>();
  const results: FirestoreDoc[] = [];

  for (const accountId of accountIds) {
    const snap = await db
      .collection(basePath)
      .where("accountId", "==", accountId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        results.push({ id: d.id, ...d.data() } as FirestoreDoc);
        seen.add(d.id);
      }
    }
  }

  for (const dealId of dealIds) {
    const snap = await db
      .collection(basePath)
      .where("dealId", "==", dealId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        results.push({ id: d.id, ...d.data() } as FirestoreDoc);
        seen.add(d.id);
      }
    }
  }

  return results.sort((a, b) => {
    const aTs = (a.createdAt as Timestamp)?.toMillis?.() ?? 0;
    const bTs = (b.createdAt as Timestamp)?.toMillis?.() ?? 0;
    return bTs - aTs;
  });
}

async function fetchInsights(
  db: Firestore,
  orgId: string,
  accountIds: string[],
  dealIds: string[]
): Promise<FirestoreDoc[]> {
  const basePath = `organizations/${orgId}/insights`;
  const seen = new Set<string>();
  const results: FirestoreDoc[] = [];

  for (const accountId of accountIds) {
    const snap = await db
      .collection(basePath)
      .where("accountId", "==", accountId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        results.push({ id: d.id, ...d.data() } as FirestoreDoc);
        seen.add(d.id);
      }
    }
  }

  for (const dealId of dealIds) {
    const snap = await db
      .collection(basePath)
      .where("dealId", "==", dealId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        results.push({ id: d.id, ...d.data() } as FirestoreDoc);
        seen.add(d.id);
      }
    }
  }

  return results.sort((a, b) => {
    const aTs = (a.createdAt as Timestamp)?.toMillis?.() ?? 0;
    const bTs = (b.createdAt as Timestamp)?.toMillis?.() ?? 0;
    return bTs - aTs;
  });
}

async function fetchDocuments(
  db: Firestore,
  orgId: string,
  documentIds: string[],
  accountIds: string[],
  dealIds: string[]
): Promise<FirestoreDoc[]> {
  const basePath = `organizations/${orgId}/documents`;
  const seen = new Set<string>();
  const results: FirestoreDoc[] = [];

  for (const id of documentIds.slice(0, 20)) {
    if (seen.has(id)) continue;
    const doc = await db.doc(`${basePath}/${id}`).get();
    if (doc.exists) {
      results.push({ id: doc.id, ...doc.data() } as FirestoreDoc);
      seen.add(id);
    }
  }

  for (const accountId of accountIds) {
    const snap = await db
      .collection(basePath)
      .where("accountId", "==", accountId)
      .limit(5)
      .get();
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        results.push({ id: d.id, ...d.data() } as FirestoreDoc);
        seen.add(d.id);
      }
    }
  }

  for (const dealId of dealIds) {
    const snap = await db
      .collection(basePath)
      .where("dealId", "==", dealId)
      .limit(5)
      .get();
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        results.push({ id: d.id, ...d.data() } as FirestoreDoc);
        seen.add(d.id);
      }
    }
  }

  return results;
}

function formatTimestamp(ts: unknown): string {
  if (!ts) return "—";
  if (typeof ts === "object" && ts !== null && "toDate" in ts) {
    return (ts as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  }
  if (typeof ts === "string") return ts.slice(0, 10);
  return String(ts);
}

function formatAccounts(accounts: FirestoreDoc[]): string {
  const lines = accounts.map((a) => {
    const stage = a.stage ?? "—";
    const value = a.annualValue != null ? `$${Number(a.annualValue).toLocaleString()}` : "—";
    const products = Array.isArray(a.products) ? a.products.join(", ") : "—";
    return `- **${a.name}** (id: ${a.id}) | Stage: ${stage} | Value: ${value} | Products: ${products}`;
  });
  return "## Accounts\n" + lines.join("\n");
}

function formatContacts(contacts: FirestoreDoc[]): string {
  const lines = contacts.map((c) => {
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown";
    const email = c.email ?? "—";
    const title = c.title ?? "—";
    return `- **${name}** (id: ${c.id}) | ${email} | ${title} | Account: ${c.accountId ?? "—"}`;
  });
  return "## Contacts\n" + lines.join("\n");
}

function formatDeals(deals: FirestoreDoc[]): string {
  const lines = deals.map((d) => {
    const value = d.value != null ? `$${Number(d.value).toLocaleString()}` : "—";
    const stage = d.stage ?? "—";
    const prob = d.probability != null ? `${d.probability}%` : "—";
    const closeDate = formatTimestamp(d.expectedCloseDate);
    return `- **${d.title}** (id: ${d.id}) | Stage: ${stage} | Value: ${value} | Prob: ${prob} | Close: ${closeDate}`;
  });
  return "## Deals\n" + lines.join("\n");
}

function formatActivities(activities: FirestoreDoc[]): string {
  const lines = activities.slice(0, 20).map((a) => {
    const type = a.type ?? "—";
    const date = formatTimestamp(a.createdAt);
    return `- [${type}] **${a.subject}** (id: ${a.id}) | ${date}`;
  });
  return "## Recent Activities\n" + lines.join("\n");
}

function formatInsights(insights: FirestoreDoc[]): string {
  const lines = insights.slice(0, 15).map((i) => {
    const type = i.type ?? "—";
    const summary = i.summary ?? (typeof i.content === "string" ? i.content.slice(0, 100) + "…" : "—");
    return `- [${type}] **${i.title}** (id: ${i.id})\n  ${summary}`;
  });
  return "## Insights\n" + lines.join("\n");
}

function formatDocuments(documents: FirestoreDoc[]): string {
  const lines = documents.map((d) => {
    const type = d.type ?? "—";
    return `- **${d.title}** (id: ${d.id}) | Type: ${type}`;
  });
  return "## Documents\n" + lines.join("\n");
}
