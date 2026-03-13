"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, ArrowLeft, ArrowRight, Check, Clock, Zap } from "lucide-react";
import { AGENT_TEMPLATES, AGENT_TOOLS } from "@/lib/agents/templates";

const STEPS = [
  { id: 1, title: "Choose Template", icon: Zap },
  { id: 2, title: "Configure Persona", icon: Bot },
  { id: 3, title: "Select Tools", icon: Zap },
  { id: 4, title: "Set Context", icon: Bot },
  { id: 5, title: "Configure Schedule", icon: Clock },
  { id: 6, title: "Review & Activate", icon: Check },
];

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

interface FormData {
  templateId: string | null;
  name: string;
  description: string;
  systemPrompt: string;
  avatarEmoji: string;
  selectedTools: string[];
  linkedAccounts: string[];
  linkedDeals: string[];
  customInstructions: string;
  scheduleEnabled: boolean;
  cronExpression: string;
  timezone: string;
}

const defaultFormData: FormData = {
  templateId: null,
  name: "",
  description: "",
  systemPrompt: "",
  avatarEmoji: "🤖",
  selectedTools: [],
  linkedAccounts: [],
  linkedDeals: [],
  customInstructions: "",
  scheduleEnabled: false,
  cronExpression: "0 9 * * 1-5",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export default function NewAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }));
  }, []);

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const selectTemplate = (template: (typeof AGENT_TEMPLATES)[number] | null) => {
    if (!template) {
      updateForm({
        templateId: null,
        name: "",
        description: "",
        systemPrompt: "",
        avatarEmoji: "🤖",
        selectedTools: [],
      });
      return;
    }
    const index = AGENT_TEMPLATES.findIndex((t) => t.name === template.name);
    updateForm({
      templateId: index >= 0 ? String(index) : null,
      name: template.name,
      description: template.description,
      systemPrompt: template.systemPrompt,
      avatarEmoji: template.icon,
      selectedTools: [...template.tools],
    });
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call create agent API
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Agent created successfully!");
      router.push("/dashboard/agents");
    } catch {
      toast.error("Failed to create agent");
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return formData.name.trim().length > 0 && formData.systemPrompt.trim().length > 0;
      case 3:
        return formData.selectedTools.length > 0;
      case 4:
      case 5:
        return true;
      case 6:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Create New Agent</h1>
        <p className="text-muted-foreground mt-1">
          Build a custom AI agent for your CRM workflows
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = step === s.id;
          const isComplete = step > s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`
                flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${isActive ? "bg-primary text-primary-foreground" : ""}
                ${isComplete ? "text-muted-foreground hover:text-foreground" : ""}
                ${!isActive && !isComplete ? "text-muted-foreground hover:bg-muted hover:text-foreground" : ""}
              `}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs ${
                  isComplete ? "bg-primary/20 text-primary" : isActive ? "bg-primary-foreground/20" : "bg-muted"
                }`}
              >
                {isComplete ? <Check className="size-4" /> : s.id}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {step === 1 && (
            <>
              <CardHeader className="px-0 pt-0">
                <CardTitle>Choose Template</CardTitle>
                <CardDescription>
                  Start from a pre-built template or create your agent from scratch
                </CardDescription>
              </CardHeader>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => selectTemplate(null)}
                  className={`
                    flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50
                    ${formData.templateId === null ? "border-primary bg-primary/5" : "border-border"}
                  `}
                >
                  <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-2xl">
                    <Bot className="size-7 text-muted-foreground" />
                  </div>
                  <div className="w-full">
                    <p className="font-medium">Start from Scratch</p>
                    <p className="text-sm text-muted-foreground">Build a custom agent from the ground up</p>
                  </div>
                </button>
                {AGENT_TEMPLATES.map((template, idx) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => selectTemplate(template)}
                    className={`
                      flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50
                      ${formData.templateId === String(idx) ? "border-primary bg-primary/5" : "border-border"}
                    `}
                  >
                    <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-2xl">
                      {template.icon}
                    </div>
                    <div className="w-full">
                      <p className="font-medium">{template.name}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="px-0 pt-0">
                <CardTitle>Configure Persona</CardTitle>
                <CardDescription>
                  Define your agent&apos;s name, description, and behavior
                </CardDescription>
              </CardHeader>
              <div className="space-y-6">
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
                        className={`
                          flex size-10 items-center justify-center rounded-lg border text-xl transition-colors
                          ${formData.avatarEmoji === emoji ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}
                        `}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="px-0 pt-0">
                <CardTitle>Select Tools</CardTitle>
                <CardDescription>
                  Choose which tools your agent can use. Grouped by category.
                </CardDescription>
              </CardHeader>
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
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader className="px-0 pt-0">
                <CardTitle>Set Context</CardTitle>
                <CardDescription>
                  Link accounts, deals, and add custom instructions for your agent
                </CardDescription>
              </CardHeader>
              <div className="space-y-6">
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
                          <p className="text-sm text-muted-foreground">
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
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader className="px-0 pt-0">
                <CardTitle>Configure Schedule</CardTitle>
                <CardDescription>
                  Set when your agent runs automatically, or trigger it manually
                </CardDescription>
              </CardHeader>
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="scheduleEnabled">Enable Schedule</Label>
                    <p className="text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">
                  Or trigger manually from the agent dashboard when needed.
                </p>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <CardHeader className="px-0 pt-0">
                <CardTitle>Review & Activate</CardTitle>
                <CardDescription>
                  Review your configuration and create your agent
                </CardDescription>
              </CardHeader>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Persona</p>
                    <p className="mt-1 text-lg font-medium">
                      {formData.avatarEmoji} {formData.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {formData.description || "No description"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Tools</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.selectedTools.map((id) => {
                        const tool = AGENT_TOOLS.find((t) => t.id === id);
                        return (
                          <Badge key={id} variant="secondary">
                            {tool?.name ?? id}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Context</p>
                  <div className="mt-2 space-y-1">
                    <p>
                      Accounts:{" "}
                      {formData.linkedAccounts.length > 0
                        ? formData.linkedAccounts
                            .map((id) => SAMPLE_ACCOUNTS.find((a) => a.id === id)?.name ?? id)
                            .join(", ")
                        : "None"}
                    </p>
                    <p>
                      Deals:{" "}
                      {formData.linkedDeals.length > 0
                        ? formData.linkedDeals
                            .map((id) => SAMPLE_DEALS.find((d) => d.id === id)?.title ?? id)
                            .join(", ")
                        : "None"}
                    </p>
                    {formData.customInstructions && (
                      <p className="text-sm text-muted-foreground">
                        Custom: {formData.customInstructions.slice(0, 100)}
                        {formData.customInstructions.length > 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                  <p className="mt-1">
                    {formData.scheduleEnabled
                      ? `${CRON_PRESETS.find((p) => p.value === formData.cronExpression)?.label ?? formData.cronExpression} (${formData.timezone})`
                      : "Manual trigger only"}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          {step < 6 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(6, s + 1))}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
