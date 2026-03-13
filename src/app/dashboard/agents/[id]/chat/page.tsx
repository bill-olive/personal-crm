"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Send,
  User,
  ChevronDown,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLE_AGENT = {
  id: "1",
  name: "CVS Account Research Agent",
  icon: "🔍",
  status: "active" as const,
};

const SAMPLE_MESSAGES = [
  {
    id: "m1",
    role: "user" as const,
    content: "Research CVS Health's current FHIR implementation status",
    timestamp: "10:32 AM",
  },
  {
    id: "m2",
    role: "assistant" as const,
    content:
      "I'll research CVS Health's FHIR implementation. Let me start by checking recent news and their technology announcements...",
    steps: [
      { name: "Web Search", query: "CVS Health FHIR API", status: "completed" },
      { name: "Browse", url: "cvs.com/technology", status: "completed" },
      { name: "CRM Read", action: "Account data", status: "completed" },
    ],
    timestamp: "10:32 AM",
  },
  {
    id: "m3",
    role: "assistant" as const,
    content: `## CVS Health FHIR Implementation Research

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
- **Primary Vendors**: Custom build with Epic integration; evaluating Redox and Health Gorilla for specific use cases
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
    timestamp: "10:35 AM",
  },
  {
    id: "m4",
    role: "user" as const,
    content: "Create a meeting brief for our call with their CTO next Tuesday",
    timestamp: "10:38 AM",
  },
  {
    id: "m5",
    role: "assistant" as const,
    content: "I'll prepare a meeting brief for your call with Norman DeLuca (CTO)...",
    steps: [
      { name: "CRM Read", action: "Past meetings with CVS", status: "completed" },
      { name: "Calendar", action: "Check availability", status: "completed" },
      { name: "Drive Search", action: "Recent proposals", status: "completed" },
    ],
    timestamp: "10:38 AM",
  },
];

export default function AgentChatPage() {
  const params = useParams();
  const id = params.id as string;
  const [input, setInput] = useState("");
  const [runInBackground, setRunInBackground] = useState(false);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/agents/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-lg">
              {SAMPLE_AGENT.icon}
            </span>
            <div>
              <h1 className="font-semibold">{SAMPLE_AGENT.name}</h1>
              <Badge
                variant="outline"
                className={
                  SAMPLE_AGENT.status === "active"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 text-xs dark:text-emerald-400"
                    : "border-amber-500/50 bg-amber-500/10 text-amber-700 text-xs dark:text-amber-400"
                }
              >
                {SAMPLE_AGENT.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="mx-auto max-w-3xl space-y-6">
          {SAMPLE_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-sm">
                  {msg.role === "user" ? (
                    <User className="size-4" />
                  ) : (
                    <span>{SAMPLE_AGENT.icon}</span>
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-1 flex-col gap-1 ${msg.role === "user" ? "items-end" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {msg.role === "user" ? "You" : "Agent"}
                  </span>
                  <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                </div>
                <div
                  className={`rounded-lg border px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary/10 text-primary-foreground"
                      : "bg-muted/50"
                  }`}
                >
                  {msg.role === "assistant" && "steps" in msg && msg.steps ? (
                    <>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      <Collapsible className="mt-3">
                        <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                          Steps
                          <ChevronDown className="size-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="mt-2 space-y-1.5 pl-4">
                            {msg.steps.map((step, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs">
                                <CheckCircle className="size-3.5 text-emerald-500" />
                                <span>
                                  {step.name}: {step.query || step.url || step.action}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : msg.role === "assistant" && msg.content.includes("##") ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Textarea
            placeholder="Message the agent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[44px] resize-none"
            rows={1}
          />
          <div className="flex flex-col gap-2">
            <Button size="icon" className="h-11 w-11 shrink-0">
              <Send className="size-4" />
            </Button>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
              <Switch checked={runInBackground} onCheckedChange={setRunInBackground} />
              Run in Background
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
