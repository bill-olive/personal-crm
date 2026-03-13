"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Shield,
  MessageSquare,
  Lightbulb,
  Bot,
  User,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Insight, InsightType, InsightSource } from "@/lib/db/schemas";

const ts = (ms: number) => Timestamp.fromMillis(ms);
const now = Date.now();

const SAMPLE_INSIGHTS: Insight[] = [
  {
    id: "1",
    type: "meeting_notes",
    title: "CVS Health Q1 Strategy Discussion",
    summary: "Key takeaways from executive call: FHIR adoption timeline, prior auth automation priorities.",
    content: "",
    accountId: "1",
    source: "manual",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 3600000),
    updatedAt: ts(now - 3600000),
  },
  {
    id: "2",
    type: "research",
    title: "UnitedHealth API Integration Patterns",
    summary: "Analysis of UHC's current FHIR implementations and recommended approach.",
    content: "",
    accountId: "2",
    source: "agent",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 86400000),
    updatedAt: ts(now - 86400000),
  },
  {
    id: "3",
    type: "competitive_intel",
    title: "Anthem Vendor Evaluation Update",
    summary: "Competitive landscape for payer-to-payer data exchange solutions.",
    content: "",
    accountId: "3",
    source: "manual",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 172800000),
    updatedAt: ts(now - 172800000),
  },
  {
    id: "4",
    type: "product_feedback",
    title: "Humana Provider Directory Feedback",
    summary: "Feedback on directory sync performance and NPI validation.",
    content: "",
    accountId: "4",
    source: "import",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 259200000),
    updatedAt: ts(now - 259200000),
  },
  {
    id: "5",
    type: "meeting_notes",
    title: "Cigna Prior Auth Workflow Review",
    summary: "Discussed electronic prior auth integration with existing systems.",
    content: "",
    accountId: "5",
    source: "agent",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 345600000),
    updatedAt: ts(now - 345600000),
  },
  {
    id: "6",
    type: "research",
    title: "Aetna CMS Compliance Requirements",
    summary: "Research on CMS interoperability rules applicable to Aetna implementation.",
    content: "",
    accountId: "6",
    source: "manual",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 432000000),
    updatedAt: ts(now - 432000000),
  },
];

const ACCOUNT_NAMES: Record<string, string> = {
  "1": "CVS Health",
  "2": "UnitedHealth Group",
  "3": "Anthem",
  "4": "Humana",
  "5": "Cigna",
  "6": "Aetna",
};

const INSIGHT_ICONS: Record<InsightType, React.ElementType> = {
  meeting_notes: ClipboardList,
  research: Search,
  competitive_intel: Shield,
  product_feedback: MessageSquare,
  deployment_update: Lightbulb,
  expansion_opportunity: Lightbulb,
};

const INSIGHT_LABELS: Record<InsightType, string> = {
  meeting_notes: "Meeting Notes",
  research: "Research",
  competitive_intel: "Competitive Intel",
  product_feedback: "Product Feedback",
  deployment_update: "Deployment Update",
  expansion_opportunity: "Expansion Opportunity",
};

const SOURCE_ICONS: Record<InsightSource, React.ElementType> = {
  manual: User,
  agent: Bot,
  import: Lightbulb,
};

const SOURCE_LABELS: Record<InsightSource, string> = {
  manual: "Manual",
  agent: "Agent",
  import: "Import",
};

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "meeting_notes", label: "Meeting Notes" },
  { value: "research", label: "Research" },
  { value: "competitive_intel", label: "Competitive Intel" },
  { value: "product_feedback", label: "Product Feedback" },
];

function formatDate(t: Timestamp | undefined): string {
  if (!t) return "";
  const d = t.toDate ? t.toDate() : new Date((t as { seconds: number }).seconds * 1000);
  return d.toLocaleDateString();
}

export default function InsightsPage() {
  const [typeFilter, setTypeFilter] = useState("all");

  const getFilteredInsights = (filter: string) =>
    filter === "all"
      ? SAMPLE_INSIGHTS
      : SAMPLE_INSIGHTS.filter((i) => i.type === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="AI-generated and manual insights across your accounts"
        action={{
          label: "Add Insight",
          href: "/dashboard/insights/new",
        }}
      />

      <Tabs value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList>
          {TYPE_FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TYPE_FILTERS.map((f) => (
          <TabsContent key={f.value} value={f.value} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getFilteredInsights(f.value).map((insight) => {
                const TypeIcon = INSIGHT_ICONS[insight.type];
                const SourceIcon = SOURCE_ICONS[insight.source];
                return (
                  <Link key={insight.id} href={`/dashboard/insights/${insight.id}`}>
                    <Card
                      size="sm"
                      className="h-full transition-colors hover:bg-muted/50"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            <TypeIcon className="size-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {INSIGHT_LABELS[insight.type]}
                              </Badge>
                              <Badge variant="outline" className="text-xs gap-1">
                                <SourceIcon className="size-3" />
                                {SOURCE_LABELS[insight.source]}
                              </Badge>
                            </div>
                            <h3 className="font-medium mt-2 line-clamp-2">
                              {insight.title}
                            </h3>
                            {insight.summary && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {insight.summary}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {insight.accountId && (
                                <span>
                                  {ACCOUNT_NAMES[insight.accountId] || "Account"}
                                </span>
                              )}
                              <span>•</span>
                              <span>{formatDate(insight.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
