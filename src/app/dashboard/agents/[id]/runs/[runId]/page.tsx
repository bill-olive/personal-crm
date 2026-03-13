"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowLeft, CheckCircle, XCircle, Loader2, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLE_RUN = {
  id: "r1",
  agentId: "1",
  status: "completed" as const,
  duration: "2m 8s",
  triggeredBy: "manual" as const,
  startedAt: "Mar 13, 2025 10:32 AM",
  completedAt: "Mar 13, 2025 10:34 AM",
  input: "Research CVS Health's current FHIR implementation status",
  output: `## CVS Health FHIR Implementation Research

### Executive Summary
CVS Health has been actively investing in FHIR-based interoperability as part of their digital health transformation. Their Aetna subsidiary and CVS Pharmacy operations are both pursuing API-first strategies to support CMS-9115-F and CMS-0057-F compliance.

### Current Implementation Status

**Aetna (Payer Operations)**
- **Member Access API**: Launched in 2024 for commercial and Medicare members. Supports Patient Access and Provider Access APIs per CMS mandates.
- **Prior Authorization**: Pilot program with FHIR-based prior auth submission. Expected full rollout Q2 2025.
- **Payer-to-Payer**: Data exchange infrastructure in development for member data portability.

**CVS Pharmacy & HealthHUB**
- **Medication History**: FHIR R4 MedicationRequest/MedicationStatement integration with major EHRs.
- **CarePass Integration**: Patient-facing health data access via FHIR-compliant APIs.

### Technology Stack
- **FHIR Version**: R4 (4.0.1)
- **Primary Vendors**: Custom build with Epic integration; evaluating Redox and Health Gorilla
- **Cloud**: AWS (primary), Azure for some Aetna workloads

### Key Stakeholders
- **CTO**: Norman DeLuca — driving API strategy
- **VP Interoperability**: Sarah Chen — CMS compliance lead
- **Chief Medical Officer**: Dr. Troyen Brennan — clinical data standards

### Opportunity Assessment
1stUp Health's FHIR API Platform would be highly relevant for:
- Accelerating Aetna's payer-to-payer data exchange timeline
- Replacing custom prior auth integrations with standardized FHIR workflows
- Consolidating multiple vendor relationships into a single interoperability platform`,
  steps: [
    {
      id: "s1",
      toolName: "web_search",
      input: '{"query": "CVS Health FHIR API implementation 2024"}',
      output: '{"results": [{"title": "CVS Health FHIR Adoption", "snippet": "CVS Health announced..."}]}',
      durationMs: 3200,
      status: "completed" as const,
    },
    {
      id: "s2",
      toolName: "browserbase_navigate",
      input: '{"url": "https://www.cvs.com/health/technology"}',
      output: '{"success": true, "title": "CVS Health Technology"}',
      durationMs: 4100,
      status: "completed" as const,
    },
    {
      id: "s3",
      toolName: "browserbase_extract",
      input: '{"selector": "main"}',
      output: '{"content": "Extracted page content..."}',
      durationMs: 2800,
      status: "completed" as const,
    },
    {
      id: "s4",
      toolName: "crm_read",
      input: '{"accountId": "1", "type": "account"}',
      output: '{"account": {"name": "CVS Health", "stage": "poc"}}',
      durationMs: 180,
      status: "completed" as const,
    },
    {
      id: "s5",
      toolName: "crm_write_insight",
      input: '{"accountId": "1", "content": "Research findings..."}',
      output: '{"insightId": "ins_123"}',
      durationMs: 450,
      status: "completed" as const,
    },
  ],
  tokensUsed: 12450,
  costEstimate: 0.042,
};

function StepStatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle className="size-4 text-emerald-500" />;
  if (status === "failed") return <XCircle className="size-4 text-destructive" />;
  return <Loader2 className="size-4 animate-spin text-primary" />;
}

export default function AgentRunDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const runId = params.runId as string;
  const run = SAMPLE_RUN;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/agents/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Run {runId}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  run.status === "completed"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : run.status === "failed"
                      ? "border-destructive/50 bg-destructive/10 text-destructive"
                      : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                }
              >
                {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
              </Badge>
              <span className="text-muted-foreground text-sm">
                Duration: {run.duration}
              </span>
              <span className="text-muted-foreground text-sm">
                Triggered by: {run.triggeredBy}
              </span>
              <span className="text-muted-foreground text-sm">
                Started: {run.startedAt}
              </span>
              {run.completedAt && (
                <span className="text-muted-foreground text-sm">
                  Ended: {run.completedAt}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Step Timeline</CardTitle>
              <CardDescription>Execution log for each tool invocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {run.steps.map((step) => (
                  <div
                    key={step.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <StepStatusIcon status={step.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{step.toolName}</Badge>
                          <span className="text-muted-foreground text-xs">
                            {(step.durationMs / 1000).toFixed(2)}s
                          </span>
                        </div>
                        <Collapsible>
                          <CollapsibleTrigger className="mt-2 flex items-center gap-1 text-sm font-medium hover:text-foreground">
                            Input
                            <ChevronDown className="size-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 font-mono text-xs">
                              {step.input}
                            </pre>
                          </CollapsibleContent>
                        </Collapsible>
                        <Collapsible>
                          <CollapsibleTrigger className="mt-2 flex items-center gap-1 text-sm font-medium hover:text-foreground">
                            Output
                            <ChevronDown className="size-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-3 font-mono text-xs">
                              {step.output}
                            </pre>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Final Output</CardTitle>
              <CardDescription>Agent response rendered as markdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {run.output ?? ""}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Run Input</CardTitle>
              <CardDescription>Original request</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{run.input}</p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Usage & Cost</CardTitle>
              <CardDescription>Token usage and cost estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Tokens Used</p>
                <p className="text-xl font-semibold">{run.tokensUsed?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Cost Estimate</p>
                <p className="text-xl font-semibold">${run.costEstimate?.toFixed(4)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
