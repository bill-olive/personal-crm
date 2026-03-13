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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Play,
  Settings,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { AGENT_TOOLS } from "@/lib/agents/templates";

const SAMPLE_AGENT = {
  id: "1",
  name: "CVS Account Research Agent",
  icon: "🔍",
  status: "active" as const,
  systemPrompt: `You are an expert healthcare industry research analyst for 1stUp Health, a company selling HL7 FHIR interoperability solutions to health plans and payers.

Your task is to research the given account (company) thoroughly and produce a comprehensive research brief.

## Research Areas:
1. **Company Overview**: Size, headquarters, member count, lines of business
2. **Leadership & Key Stakeholders**: CTO, VP Engineering, Chief Medical Officer
3. **Technology Stack**: Current EHR/claims systems, existing FHIR implementations
4. **Regulatory Compliance**: CMS-9115-F readiness, CMS-0057-F compliance status
5. **Recent News**: Press releases, partnerships, technology announcements
6. **Opportunity Assessment**: Which 1stUp Health products would be most relevant`,
  enabledTools: ["web_search", "browserbase_navigate", "browserbase_extract", "crm_read", "crm_write_insight"],
  integrations: {
    email: false,
    slack: false,
    drive: true,
    docs: false,
    calendar: false,
    browserbase: true,
  },
  context: ["CVS Health", "FHIR API Platform - CVS Health"],
  schedule: {
    cron: "0 9 * * 1-5",
    timezone: "America/New_York",
    nextRun: "Tomorrow at 9:00 AM",
    enabled: true,
  },
  stats: {
    totalRuns: 47,
    successRate: 94,
    avgDuration: "2.3 min",
    lastRun: "2 hours ago",
  },
  runHistory: [
    { id: "r1", status: "completed" as const, input: "Research CVS Health FHIR implementation status", duration: "2.1 min", timestamp: "2 hours ago" },
    { id: "r2", status: "completed" as const, input: "Update account overview for CVS", duration: "1.8 min", timestamp: "1 day ago" },
    { id: "r3", status: "failed" as const, input: "Deep dive on CVS prior auth delays", duration: "—", timestamp: "2 days ago" },
    { id: "r4", status: "completed" as const, input: "Competitive analysis: CVS vs Redox", duration: "3.2 min", timestamp: "3 days ago" },
    { id: "r5", status: "completed" as const, input: "Stakeholder mapping for CVS", duration: "1.5 min", timestamp: "4 days ago" },
  ],
};

function RunStatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle className="size-4 text-emerald-500" />;
  if (status === "failed") return <XCircle className="size-4 text-destructive" />;
  if (status === "running") return <Loader2 className="size-4 animate-spin text-primary" />;
  return <Clock className="size-4 text-muted-foreground" />;
}

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const agent = SAMPLE_AGENT;

  const integrationLabels: Record<string, string> = {
    email: "Email",
    slack: "Slack",
    drive: "Google Drive",
    docs: "Google Docs",
    calendar: "Calendar",
    browserbase: "Browserbase",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-2xl">
              {agent.icon}
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{agent.name}</h1>
              <Badge
                variant="outline"
                className={
                  agent.status === "active"
                    ? "mt-1 border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "mt-1 border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                }
              >
                {agent.status === "active" ? (
                  <Play className="size-3 mr-1 fill-current" />
                ) : (
                  <Clock className="size-3 mr-1 fill-current" />
                )}
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Play className="size-4" />
            Run Now
          </Button>
          <Link href={`/dashboard/agents/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Settings className="size-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/agents/${id}/chat`}>
            <Button variant="outline" className="gap-2">
              <MessageSquare className="size-4" />
              Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Runs</p>
            <p className="text-2xl font-semibold">{agent.stats.totalRuns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-semibold">{agent.stats.successRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Avg Duration</p>
            <p className="text-2xl font-semibold">{agent.stats.avgDuration}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Last Run</p>
            <p className="text-2xl font-semibold">{agent.stats.lastRun}</p>
          </CardContent>
        </Card>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-4" />
                Configuration
              </CardTitle>
              <CardDescription>System prompt, tools, integrations, and context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-medium">System Prompt</h4>
                <ScrollArea className="h-[200px] rounded-lg border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {agent.systemPrompt}
                  </pre>
                </ScrollArea>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Enabled Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.enabledTools.map((toolId) => {
                    const tool = AGENT_TOOLS.find((t) => t.id === toolId);
                    return (
                      <Badge key={toolId} variant="secondary">
                        {tool?.name ?? toolId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Integrations</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(agent.integrations).map(([key, connected]) => (
                    <Badge
                      key={key}
                      variant={connected ? "default" : "outline"}
                      className={connected ? "" : "text-muted-foreground"}
                    >
                      {integrationLabels[key] ?? key}: {connected ? "Connected" : "Disconnected"}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Context (Linked Accounts)</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.context.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-4" />
                Schedule
              </CardTitle>
              <CardDescription>Cron expression, timezone, and next run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Schedule Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    {agent.schedule.enabled ? "Runs automatically" : "Manual only"}
                  </p>
                </div>
                <Switch checked={agent.schedule.enabled} disabled />
              </div>
              {agent.schedule.enabled && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cron Expression</p>
                    <p className="font-mono text-sm">{agent.schedule.cron}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Timezone</p>
                    <p className="text-sm">{agent.schedule.timezone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next Run</p>
                    <p className="text-sm">{agent.schedule.nextRun}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Run History</CardTitle>
              <CardDescription>Last 5 runs</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  {agent.runHistory.map((run) => (
                    <Link key={run.id} href={`/dashboard/agents/${id}/runs/${run.id}`}>
                      <div className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                        <RunStatusIcon status={run.status} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{run.input}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{run.duration}</span>
                            <span>•</span>
                            <span>{run.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
