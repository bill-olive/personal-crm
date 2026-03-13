"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { AGENT_TOOLS } from "@/lib/agents/templates";

const SAMPLE_AGENT = {
  name: "CVS Account Research Agent",
  description:
    "Deep-dive research on CVS Health and related accounts. Gathers company overview, recent news, key stakeholders, and competitive positioning.",
  systemPrompt: `You are an expert healthcare industry research analyst for 1stUp Health, a company selling HL7 FHIR interoperability solutions to health plans and payers.

Your task is to research the given account (company) thoroughly and produce a comprehensive research brief.

## Research Areas:
1. **Company Overview**: Size, headquarters, member count, lines of business
2. **Leadership & Key Stakeholders**: CTO, VP Engineering, Chief Medical Officer
3. **Technology Stack**: Current EHR/claims systems, existing FHIR implementations
4. **Regulatory Compliance**: CMS-9115-F readiness, CMS-0057-F compliance status
5. **Recent News**: Press releases, partnerships, technology announcements
6. **Opportunity Assessment**: Which 1stUp Health products would be most relevant`,
  avatarEmoji: "🔍",
  selectedTools: ["web_search", "browserbase_navigate", "browserbase_extract", "crm_read", "crm_write_insight"],
  linkedAccounts: ["1"],
  linkedDeals: ["1"],
  customInstructions: "Focus on CVS Health and Aetna interoperability initiatives.",
  scheduleEnabled: true,
  cronExpression: "0 9 * * 1-5",
  timezone: "America/New_York",
};

const AVATAR_EMOJIS = ["🤖", "🔍", "📋", "🛡️", "✉️", "🚀", "📈", "📝", "🎯", "💼", "📊", "⚡"];

const SAMPLE_ACCOUNTS = [
  { id: "1", name: "CVS Health" },
  { id: "2", name: "UnitedHealth" },
  { id: "3", name: "Anthem" },
  { id: "4", name: "Humana" },
  { id: "5", name: "Cigna" },
];

const SAMPLE_DEALS = [
  { id: "1", title: "FHIR API Platform - CVS Health", value: 450000 },
  { id: "2", title: "Prior Auth Module - UnitedHealth", value: 320000 },
  { id: "3", title: "Data Lakehouse - Anthem", value: 680000 },
];

const CRON_PRESETS = [
  { id: "hourly", label: "Every hour", value: "0 * * * *" },
  { id: "daily", label: "Every day at 9am", value: "0 9 * * *" },
  { id: "weekdays", label: "Weekdays at 9am", value: "0 9 * * 1-5" },
  { id: "weekly", label: "Weekly on Monday", value: "0 9 * * 1" },
  { id: "monthly", label: "Monthly on 1st", value: "0 9 1 * *" },
];

const TOOL_CATEGORY_LABELS: Record<string, string> = {
  research: "Research",
  crm: "CRM",
  communication: "Communication",
  calendar: "Calendar",
  drive: "Drive",
  docs: "Docs",
};

export default function AgentEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name: SAMPLE_AGENT.name,
    description: SAMPLE_AGENT.description,
    systemPrompt: SAMPLE_AGENT.systemPrompt,
    avatarEmoji: SAMPLE_AGENT.avatarEmoji,
    selectedTools: SAMPLE_AGENT.selectedTools,
    linkedAccounts: SAMPLE_AGENT.linkedAccounts,
    linkedDeals: SAMPLE_AGENT.linkedDeals,
    customInstructions: SAMPLE_AGENT.customInstructions,
    scheduleEnabled: SAMPLE_AGENT.scheduleEnabled,
    cronExpression: SAMPLE_AGENT.cronExpression,
    timezone: SAMPLE_AGENT.timezone,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const toggleTool = (toolId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTools: prev.selectedTools.includes(toolId)
        ? prev.selectedTools.filter((t) => t !== toolId)
        : [...prev.selectedTools, toolId],
    }));
  };

  const toggleAccount = (accountId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedAccounts: prev.linkedAccounts.includes(accountId)
        ? prev.linkedAccounts.filter((a) => a !== accountId)
        : [...prev.linkedAccounts, accountId],
    }));
  };

  const toggleDeal = (dealId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedDeals: prev.linkedDeals.includes(dealId)
        ? prev.linkedDeals.filter((d) => d !== dealId)
        : [...prev.linkedDeals, dealId],
    }));
  };

  const toolsByCategory = AGENT_TOOLS.reduce(
    (acc, tool) => {
      const cat = tool.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(tool);
      return acc;
    },
    {} as Record<string, (typeof AGENT_TOOLS)[number][]>
  );

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Agent updated successfully!");
      router.push(`/dashboard/agents/${id}`);
    } catch {
      toast.error("Failed to update agent");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/agents/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Edit Agent</h1>
            <p className="text-muted-foreground text-sm">
              Update your agent configuration
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Persona</CardTitle>
          <CardDescription>Name, description, and system prompt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="e.g. Account Research Agent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              placeholder="Brief description of what this agent does"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) => updateForm({ systemPrompt: e.target.value })}
              placeholder="Instructions that define how the agent behaves..."
              className="min-h-[200px] font-mono text-sm"
              rows={10}
            />
          </div>
          <div className="space-y-2">
            <Label>Avatar Emoji</Label>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => updateForm({ avatarEmoji: emoji })}
                  className={`flex size-10 items-center justify-center rounded-lg border text-xl transition-colors ${
                    formData.avatarEmoji === emoji
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tools</CardTitle>
          <CardDescription>Choose which tools your agent can use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(toolsByCategory).map(([category, tools]) => (
              <div key={category}>
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                  {TOOL_CATEGORY_LABELS[category] ?? category}
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tools.map((tool) => (
                    <label
                      key={tool.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <Checkbox
                        checked={formData.selectedTools.includes(tool.id)}
                        onCheckedChange={() => toggleTool(tool.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-muted-foreground text-sm">{tool.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Context</CardTitle>
          <CardDescription>Link accounts, deals, and add custom instructions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Linked Accounts</Label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_ACCOUNTS.map((account) => (
                <label
                  key={account.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <Checkbox
                    checked={formData.linkedAccounts.includes(account.id)}
                    onCheckedChange={() => toggleAccount(account.id)}
                  />
                  <span>{account.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-3 block">Linked Deals</Label>
            <div className="space-y-2">
              {SAMPLE_DEALS.map((deal) => (
                <label
                  key={deal.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <Checkbox
                    checked={formData.linkedDeals.includes(deal.id)}
                    onCheckedChange={() => toggleDeal(deal.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-muted-foreground text-sm">
                      ${deal.value.toLocaleString()}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customInstructions">Custom Instructions</Label>
            <Textarea
              id="customInstructions"
              value={formData.customInstructions}
              onChange={(e) => updateForm({ customInstructions: e.target.value })}
              placeholder="Additional context or instructions for this agent..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Set when your agent runs automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="scheduleEnabled">Enable Schedule</Label>
              <p className="text-muted-foreground text-sm">
                Run this agent on a recurring schedule
              </p>
            </div>
            <Switch
              id="scheduleEnabled"
              checked={formData.scheduleEnabled}
              onCheckedChange={(checked) => updateForm({ scheduleEnabled: checked })}
            />
          </div>
          {formData.scheduleEnabled && (
            <>
              <div className="space-y-2">
                <Label>Schedule Preset</Label>
                <div className="flex flex-wrap gap-2">
                  {CRON_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={formData.cronExpression === preset.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateForm({ cronExpression: preset.value })}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(v) => updateForm({ timezone: v ?? formData.timezone })}
                >
                  <SelectTrigger id="timezone" className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone} (Browser)
                    </SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                    <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link href={`/dashboard/agents/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
