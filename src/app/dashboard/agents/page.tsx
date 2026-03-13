"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Bot,
  Play,
  Pause,
  Clock,
  Zap,
  ArrowRight,
  Plus,
} from "lucide-react";
import { AGENT_TEMPLATES } from "@/lib/agents/templates";

const MY_AGENTS = [
  {
    id: "1",
    name: "CVS Account Researcher",
    description:
      "Deep-dive research on CVS Health and related accounts. Gathers company overview, recent news, key stakeholders, and competitive positioning.",
    icon: "🔍",
    status: "active" as const,
    lastRun: "2 hours ago",
    totalRuns: 47,
    schedule: "Every weekday at 9am",
  },
  {
    id: "2",
    name: "Weekly Pipeline Prep",
    description:
      "Prepares comprehensive pipeline briefings before Monday standups. Reviews deal status, identifies blockers, and surfaces key updates.",
    icon: "📋",
    status: "active" as const,
    lastRun: "1 day ago",
    totalRuns: 23,
    schedule: "Every Monday at 8am",
  },
  {
    id: "3",
    name: "Competitive Monitor",
    description:
      "Monitors competitor activity in the healthcare interoperability space. Tracks product launches, pricing changes, and customer wins.",
    icon: "🛡️",
    status: "paused" as const,
    lastRun: "3 days ago",
    totalRuns: 12,
    schedule: null,
  },
];

function formatCategory(category: string) {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Agents"
        description="Autonomous agents that work on your behalf"
        action={{ label: "Create Agent", href: "/dashboard/agents/new" }}
      />

      <Tabs defaultValue="my-agents" className="space-y-6">
        <TabsList className="h-11 rounded-xl bg-muted/60 p-1">
          <TabsTrigger
            value="my-agents"
            className="rounded-lg px-6 data-active:bg-background data-active:shadow-sm"
          >
            <Bot className="size-4 mr-2" />
            My Agents
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="rounded-lg px-6 data-active:bg-background data-active:shadow-sm"
          >
            <Zap className="size-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-agents" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MY_AGENTS.map((agent) => (
              <Card
                key={agent.id}
                className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative">
                  <Link href={`/dashboard/agents/${agent.id}`} className="block">
                    <CardTitle className="flex items-center gap-3 text-lg transition-colors hover:text-primary">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-xl">
                        {agent.icon}
                      </span>
                      {agent.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="mt-2 line-clamp-2">
                    {agent.description}
                  </CardDescription>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        agent.status === "active"
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }
                    >
                      {agent.status === "active" ? (
                        <Play className="size-3 mr-1 fill-current" />
                      ) : (
                        <Pause className="size-3 mr-1 fill-current" />
                      )}
                      {agent.status.charAt(0).toUpperCase() +
                        agent.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="size-3.5" />
                      {agent.totalRuns} runs
                    </span>
                    <span>Last run: {agent.lastRun}</span>
                  </div>
                  {agent.schedule && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {agent.schedule}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        View
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                    <Button size="sm" className="gap-1.5">
                      <Play className="size-3.5" />
                      Run Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {AGENT_TEMPLATES.map((template, index) => (
              <Card
                key={template.name}
                className="group relative overflow-hidden border-2 border-dashed transition-all duration-300 hover:border-primary/40 hover:border-solid hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted/80 text-lg">
                      {template.icon}
                    </span>
                    {template.name}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-3">
                    {template.description}
                  </CardDescription>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatCategory(template.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {template.tools.length} tools
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <Link
                    href={`/dashboard/agents/new?template=${index}`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-dashed transition-colors hover:border-solid hover:bg-primary/10"
                    >
                      <Plus className="size-4" />
                      Use Template
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
