import { Timestamp } from "firebase/firestore";

// ─── Organization ────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  plan: "free" | "pro" | "enterprise";
  settings: {
    defaultCurrency: string;
    timezone: string;
    fiscalYearStart: number; // month (1-12)
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string; // same as Firebase Auth UID
  email: string;
  displayName: string;
  avatarUrl?: string;
  orgId: string;
  role: "admin" | "member";
  title?: string;
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
    emailDigest: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Account (Company/Customer) ──────────────────────────────────────────────

export type AccountStage =
  | "prospect"
  | "qualified"
  | "poc"
  | "contract"
  | "customer"
  | "churned";

export type HealthPlanType =
  | "commercial"
  | "medicare"
  | "medicaid"
  | "dual_eligible"
  | "exchange"
  | "other";

export interface Account {
  id: string;
  name: string;
  domain?: string;
  industry: string;
  size: "startup" | "smb" | "mid_market" | "enterprise";
  healthPlanType?: HealthPlanType;
  stage: AccountStage;
  annualValue?: number;
  products: string[];
  region?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  primaryContactId?: string;
  ownerId: string;
  tags: string[];
  notes?: string;
  website?: string;
  linkedInUrl?: string;
  logoUrl?: string;
  memberCount?: number; // health plan member count
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  accountId: string;
  linkedInUrl?: string;
  avatarUrl?: string;
  tags: string[];
  notes?: string;
  lastContactedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Deal / Opportunity ──────────────────────────────────────────────────────

export type DealStage =
  | "discovery"
  | "demo"
  | "poc"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface Deal {
  id: string;
  title: string;
  accountId: string;
  contactIds: string[];
  stage: DealStage;
  value: number;
  currency: string;
  probability: number; // 0-100
  expectedCloseDate?: Timestamp;
  actualCloseDate?: Timestamp;
  products: string[]; // 1stUp Health products
  lossReason?: string;
  ownerId: string;
  notes?: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Activity ────────────────────────────────────────────────────────────────

export type ActivityType = "call" | "email" | "meeting" | "note" | "task";

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  accountId?: string;
  contactId?: string;
  dealId?: string;
  ownerId: string;
  metadata?: {
    duration?: number; // minutes for calls/meetings
    attendees?: string[];
    location?: string;
    meetingLink?: string;
  };
  createdAt: Timestamp;
}

// ─── Document ────────────────────────────────────────────────────────────────

export type DocumentType =
  | "proposal"
  | "deck"
  | "brief"
  | "contract"
  | "research"
  | "report"
  | "other";

export interface CRMDocument {
  id: string;
  title: string;
  type: DocumentType;
  storagePath: string; // Firebase Storage path
  downloadUrl?: string;
  mimeType: string;
  size: number; // bytes
  accountId?: string;
  dealId?: string;
  agentRunId?: string;
  tags: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Insight ─────────────────────────────────────────────────────────────────

export type InsightType =
  | "meeting_notes"
  | "research"
  | "competitive_intel"
  | "product_feedback"
  | "deployment_update"
  | "expansion_opportunity";

export type InsightSource = "manual" | "agent" | "import";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  content: string; // markdown
  summary?: string;
  accountId?: string;
  dealId?: string;
  contactId?: string;
  agentRunId?: string;
  source: InsightSource;
  tags: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Agent ───────────────────────────────────────────────────────────────────

export type AgentStatus = "active" | "paused" | "archived";

export interface AgentSchedule {
  enabled: boolean;
  cron: string; // e.g. "0 9 * * 1-5" (weekdays at 9am)
  timezone: string;
  lastRunAt?: Timestamp;
  nextRunAt?: Timestamp;
}

export interface AgentIntegrations {
  email: boolean;
  slack: boolean;
  drive: boolean;
  docs: boolean;
  calendar: boolean;
  browserbase: boolean;
}

export interface AgentContext {
  accountIds: string[];
  dealIds: string[];
  documentIds: string[];
  customInstructions?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string; // emoji or URL
  type: "custom" | "template";
  templateId?: string;
  systemPrompt: string;
  tools: string[];
  schedule?: AgentSchedule;
  integrations: AgentIntegrations;
  context: AgentContext;
  status: AgentStatus;
  totalRuns: number;
  lastRunAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Agent Run ───────────────────────────────────────────────────────────────

export type AgentRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentRunStep {
  id: string;
  toolName: string;
  input: string;
  output: string;
  status: "running" | "completed" | "failed";
  timestamp: Timestamp;
  durationMs: number;
}

export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  triggeredBy: "schedule" | "manual" | "webhook" | "chat";
  status: AgentRunStatus;
  input: string;
  output?: string; // markdown result
  steps: AgentRunStep[];
  tokensUsed?: number;
  costEstimate?: number;
  accountId?: string;
  dealId?: string;
  browserSessionId?: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  error?: string;
}

// ─── Agent Template ──────────────────────────────────────────────────────────

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: "sales" | "post_sales" | "research" | "communication" | "operations";
  systemPrompt: string;
  tools: string[];
  defaultIntegrations: AgentIntegrations;
  icon: string; // emoji
  isPublic: boolean;
  usageCount: number;
}

// ─── Agent Chat Message ──────────────────────────────────────────────────────

export interface AgentChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agentRunId?: string;
  metadata?: {
    toolCalls?: { name: string; result: string }[];
    tokensUsed?: number;
  };
  createdAt: Timestamp;
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType =
  | "agent_completed"
  | "agent_failed"
  | "deal_stage_changed"
  | "meeting_reminder"
  | "insight_generated"
  | "task_due"
  | "mention";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, string>;
  createdAt: Timestamp;
}

// ─── Integration Token ──────────────────────────────────────────────────────

export interface IntegrationToken {
  id: string; // service name: "google" | "slack"
  service: "google" | "slack";
  accessToken: string;
  refreshToken: string;
  expiresAt: Timestamp;
  scopes: string[];
  metadata?: {
    email?: string;
    workspaceName?: string;
    workspaceId?: string;
  };
  connectedAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── 1stUp Health Products ──────────────────────────────────────────────────

export const FIRSTUP_HEALTH_PRODUCTS = [
  "FHIR API Platform",
  "Electronic Prior Authorization",
  "Payer-to-Payer Data Exchange",
  "Provider Access API",
  "Patient Access Portal",
  "Provider Directory",
  "Formulary Management",
  "Analytics & Reporting",
  "Member Data Lakehouse",
  "CMS Compliance Suite",
] as const;

export type FirstUpHealthProduct = (typeof FIRSTUP_HEALTH_PRODUCTS)[number];

// ─── Pipeline Stage Metadata ─────────────────────────────────────────────────

export const DEAL_STAGES: Record<DealStage, { label: string; color: string; probability: number }> = {
  discovery: { label: "Discovery", color: "bg-slate-500", probability: 10 },
  demo: { label: "Demo", color: "bg-blue-500", probability: 25 },
  poc: { label: "POC", color: "bg-indigo-500", probability: 50 },
  proposal: { label: "Proposal", color: "bg-purple-500", probability: 65 },
  negotiation: { label: "Negotiation", color: "bg-amber-500", probability: 80 },
  closed_won: { label: "Closed Won", color: "bg-green-500", probability: 100 },
  closed_lost: { label: "Closed Lost", color: "bg-red-500", probability: 0 },
};

export const ACCOUNT_STAGES: Record<AccountStage, { label: string; color: string }> = {
  prospect: { label: "Prospect", color: "bg-slate-500" },
  qualified: { label: "Qualified", color: "bg-blue-500" },
  poc: { label: "POC", color: "bg-indigo-500" },
  contract: { label: "Contract", color: "bg-purple-500" },
  customer: { label: "Customer", color: "bg-green-500" },
  churned: { label: "Churned", color: "bg-red-500" },
};
