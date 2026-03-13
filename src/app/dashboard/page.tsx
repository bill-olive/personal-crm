"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DollarSign,
  Building2,
  TrendingUp,
  Bot,
  Calendar,
  ArrowRight,
  Plus,
  Users,
  Zap,
  Activity,
} from "lucide-react";

const kpiCards = [
  {
    title: "Total Pipeline",
    value: "$4.2M",
    change: "+12% from last month",
    icon: DollarSign,
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Active Accounts",
    value: "24",
    change: "3 new this week",
    icon: Building2,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Win Rate",
    value: "68%",
    change: "+5% from last quarter",
    icon: TrendingUp,
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Active Agents",
    value: "8",
    change: "3 running now",
    icon: Bot,
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

const deals = [
  {
    account: "CVS Health",
    opportunity: "FHIR API Platform",
    value: "$850K",
    stage: "POC",
    stageClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/50",
  },
  {
    account: "UnitedHealth Group",
    opportunity: "Prior Auth",
    value: "$1.2M",
    stage: "Proposal",
    stageClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50",
  },
  {
    account: "Anthem",
    opportunity: "Payer-to-Payer Exchange",
    value: "$650K",
    stage: "Demo",
    stageClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50",
  },
  {
    account: "Humana",
    opportunity: "Patient Access Portal",
    value: "$420K",
    stage: "Negotiation",
    stageClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50",
  },
  {
    account: "Cigna",
    opportunity: "Analytics Suite",
    value: "$380K",
    stage: "Discovery",
    stageClass: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/50",
  },
];

const recentActivity = [
  {
    icon: Zap,
    description: "Account Research Agent completed analysis for UnitedHealth",
    time: "2 min ago",
  },
  {
    icon: Users,
    description: "New contact added to CVS Health account",
    time: "15 min ago",
  },
  {
    icon: Activity,
    description: "Anthem deal moved to Demo stage",
    time: "1 hour ago",
  },
  {
    icon: Bot,
    description: "Meeting Prep Agent started for Humana call",
    time: "2 hours ago",
  },
  {
    icon: DollarSign,
    description: "Cigna proposal sent for Analytics Suite",
    time: "3 hours ago",
  },
];

const activeAgents = [
  {
    name: "Account Research Agent",
    status: "Running",
    pulse: true,
  },
  {
    name: "Meeting Prep Agent",
    status: "Completed",
    pulse: false,
  },
  {
    name: "Email Drafter Agent",
    status: "Scheduled",
    pulse: false,
  },
];

const quickActions = [
  { label: "New Account", icon: Plus, href: "/dashboard/accounts/new" },
  { label: "Create Agent", icon: Bot, href: "/dashboard/agents/new" },
  { label: "Schedule Meeting", icon: Calendar, href: "/dashboard/meetings/new" },
  { label: "View Pipeline", icon: ArrowRight, href: "/dashboard/pipeline" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your pipeline today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.title}
            className="overflow-hidden shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div
                className={`flex size-9 items-center justify-center rounded-full ${kpi.iconBg}`}
              >
                <kpi.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Left column - Pipeline Overview */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Pipeline Overview</CardTitle>
              <CardDescription>
                Top opportunities in your HL7 FHIR sales pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chart placeholder */}
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30">
                <span className="text-sm text-muted-foreground">
                  Chart placeholder
                </span>
              </div>

              {/* Deals table */}
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div
                    key={deal.account}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{deal.account}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {deal.opportunity}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-primary">
                        {deal.value}
                      </span>
                      <Badge
                        variant="outline"
                        className={`shrink-0 border ${deal.stageClass}`}
                      >
                        {deal.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-3">
          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across your accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <activity.icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Agents */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Active Agents</CardTitle>
              <CardDescription>
                AI agents working on your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAgents.map((agent) => (
                  <div
                    key={agent.name}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {agent.pulse && (
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                      )}
                      {!agent.pulse && (
                        <span className="size-2 rounded-full bg-muted-foreground/30" />
                      )}
                      <span className="text-sm font-medium">{agent.name}</span>
                    </div>
                    <Badge
                      variant={
                        agent.status === "Running"
                          ? "default"
                          : agent.status === "Completed"
                            ? "secondary"
                            : "outline"
                      }
                      className={
                        agent.status === "Running"
                          ? "bg-emerald-600 hover:bg-emerald-700 border-0"
                          : ""
                      }
                    >
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button variant="outline" className="gap-2 shadow-sm">
              <action.icon className="size-4" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
