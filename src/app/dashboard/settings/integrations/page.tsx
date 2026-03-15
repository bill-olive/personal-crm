"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import {
  Chrome,
  Hash,
  Globe,
  Bot,
  CheckCircle,
  XCircle,
  RefreshCw,
  Key,
  Shield,
  Loader2,
  Sparkles,
  BrainCircuit,
} from "lucide-react";

interface IntegrationSettings {
  openai: { configured: boolean; keyHint: string | null; model: string };
  anthropic: { configured: boolean; keyHint: string | null; model: string };
  gemini: { configured: boolean; keyHint: string | null; model: string };
  browserbase: { configured: boolean; keyHint: string | null; projectId: string | null };
}

interface GoogleStatus {
  connected: boolean;
  email?: string;
  name?: string;
  scopes?: string[];
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading integrations...</div>}>
      <IntegrationsContent />
    </Suspense>
  );
}

function IntegrationsContent() {
  const searchParams = useSearchParams();

  // Google OAuth state
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus>({ connected: false });
  const [googleLoading, setGoogleLoading] = useState(true);

  // API Key form state
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [anthropicModel, setAnthropicModel] = useState("claude-sonnet-4-20250514");
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash");
  const [browserbaseKey, setBrowserbaseKey] = useState("");
  const [browserbaseProjectId, setBrowserbaseProjectId] = useState("");

  // Settings state
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Load integration settings on mount
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/integrations");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setOpenaiModel(data.openai?.model || "gpt-4o");
        setAnthropicModel(data.anthropic?.model || "claude-sonnet-4-20250514");
        setGeminiModel(data.gemini?.model || "gemini-2.0-flash");
      }
    } catch {
      // Settings may not be available without auth
    }
  }, []);

  // Load Google connection status
  const loadGoogleStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/google/status");
      if (res.ok) {
        const data = await res.json();
        setGoogleStatus(data);
      }
    } catch {
      // Ignore
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadGoogleStatus();
  }, [loadSettings, loadGoogleStatus]);

  // Handle OAuth callback success/error from URL params
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "google") {
      toast.success("Google Workspace connected successfully!");
      loadGoogleStatus();
    }
    if (error) {
      toast.error(`Connection failed: ${error}`);
    }
  }, [searchParams, loadGoogleStatus]);

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch("/api/integrations/google");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error(data.error || "Failed to get Google auth URL. Check GOOGLE_CLIENT_ID/SECRET env vars.");
      }
    } catch {
      toast.error("Failed to initiate Google connection");
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await fetch("/api/integrations/google/disconnect", { method: "POST" });
      setGoogleStatus({ connected: false });
      toast.success("Google Workspace disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  const saveApiKey = async (provider: string, data: Record<string, string>) => {
    setSaving(provider);
    try {
      const res = await fetch("/api/settings/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(`${provider} settings saved!`);
        // Clear the input fields after saving
        if (provider === "OpenAI") setOpenaiKey("");
        if (provider === "Anthropic") setAnthropicKey("");
        if (provider === "Gemini") setGeminiKey("");
        if (provider === "Browserbase") { setBrowserbaseKey(""); setBrowserbaseProjectId(""); }
        await loadSettings();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(null);
    }
  };

  const googlePermissions = [
    "Gmail Read/Send",
    "Drive Read/Write",
    "Docs Read/Write",
    "Calendar Read/Write",
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Integrations"
        description="Connect Google, Slack, and other services to power your CRM"
      />

      <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-4">
        <Shield className="size-5 shrink-0 text-muted-foreground mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Integrations are encrypted and stored securely. OAuth connections can be revoked at any time.
        </p>
      </div>

      {/* Google Workspace */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Chrome className="size-5" />
              </div>
              <div>
                <CardTitle>Google Workspace</CardTitle>
                <CardDescription>Gmail, Drive, Docs, Calendar</CardDescription>
              </div>
            </div>
            {googleLoading ? (
              <Badge variant="secondary"><Loader2 className="mr-1 size-3 animate-spin" />Checking...</Badge>
            ) : (
              <Badge
                variant={googleStatus.connected ? "default" : "secondary"}
                className={googleStatus.connected ? "bg-emerald-600 hover:bg-emerald-700 border-0" : ""}
              >
                {googleStatus.connected ? (
                  <><CheckCircle className="mr-1 size-3" />Connected</>
                ) : (
                  <><XCircle className="mr-1 size-3" />Not Connected</>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sync emails, documents, and calendar events. Enable AI-powered insights from your Google data.
          </p>
          {googleStatus.connected && (
            <>
              {googleStatus.email && (
                <p className="text-sm">Connected as <strong>{googleStatus.email}</strong></p>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Permissions granted</p>
                <ul className="text-sm space-y-1">
                  {googlePermissions.map((perm) => (
                    <li key={perm} className="flex items-center gap-2">
                      <CheckCircle className="size-3.5 text-emerald-500" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            {googleStatus.connected ? (
              <>
                <Button variant="outline" size="sm" onClick={loadGoogleStatus} className="gap-2">
                  <RefreshCw className="size-3.5" />
                  Refresh Status
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDisconnectGoogle}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleConnectGoogle} className="gap-2">
                <Chrome className="size-3.5" />
                Connect Google Workspace
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* AI API Keys */}
      <div>
        <h2 className="text-lg font-semibold mb-4">AI Model API Keys</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* OpenAI */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                  <Bot className="size-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">OpenAI</CardTitle>
                  <CardDescription>GPT-4o, GPT-4o-mini</CardDescription>
                </div>
                <Badge variant={settings?.openai?.configured ? "default" : "secondary"} className={settings?.openai?.configured ? "bg-emerald-600 border-0 text-xs" : "text-xs"}>
                  {settings?.openai?.configured ? "Configured" : "Not Set"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings?.openai?.configured && (
                <p className="text-xs text-muted-foreground">Current key: {settings.openai.keyHint}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="text-xs">API Key</Label>
                <Input id="openai-key" type="password" placeholder="sk-..." value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Model</Label>
                <Select value={openaiModel} onValueChange={(v) => v && setOpenaiModel(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="o3-mini">o3-mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-full" onClick={() => saveApiKey("OpenAI", { openaiApiKey: openaiKey || undefined as unknown as string, openaiModel })} disabled={saving === "OpenAI"}>
                {saving === "OpenAI" ? <Loader2 className="mr-2 size-3 animate-spin" /> : <Key className="mr-2 size-3" />}
                Save
              </Button>
            </CardContent>
          </Card>

          {/* Anthropic */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <BrainCircuit className="size-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Anthropic</CardTitle>
                  <CardDescription>Claude Sonnet, Opus</CardDescription>
                </div>
                <Badge variant={settings?.anthropic?.configured ? "default" : "secondary"} className={settings?.anthropic?.configured ? "bg-emerald-600 border-0 text-xs" : "text-xs"}>
                  {settings?.anthropic?.configured ? "Configured" : "Not Set"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings?.anthropic?.configured && (
                <p className="text-xs text-muted-foreground">Current key: {settings.anthropic.keyHint}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="anthropic-key" className="text-xs">API Key</Label>
                <Input id="anthropic-key" type="password" placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Model</Label>
                <Select value={anthropicModel} onValueChange={(v) => v && setAnthropicModel(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-full" onClick={() => saveApiKey("Anthropic", { anthropicApiKey: anthropicKey || undefined as unknown as string, anthropicModel })} disabled={saving === "Anthropic"}>
                {saving === "Anthropic" ? <Loader2 className="mr-2 size-3 animate-spin" /> : <Key className="mr-2 size-3" />}
                Save
              </Button>
            </CardContent>
          </Card>

          {/* Gemini */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sparkles className="size-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Google Gemini</CardTitle>
                  <CardDescription>Gemini 2.0 Flash, Pro</CardDescription>
                </div>
                <Badge variant={settings?.gemini?.configured ? "default" : "secondary"} className={settings?.gemini?.configured ? "bg-emerald-600 border-0 text-xs" : "text-xs"}>
                  {settings?.gemini?.configured ? "Configured" : "Not Set"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings?.gemini?.configured && (
                <p className="text-xs text-muted-foreground">Current key: {settings.gemini.keyHint}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="gemini-key" className="text-xs">API Key</Label>
                <Input id="gemini-key" type="password" placeholder="AIza..." value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Model</Label>
                <Select value={geminiModel} onValueChange={(v) => v && setGeminiModel(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini-2.0-pro">Gemini 2.0 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-full" onClick={() => saveApiKey("Gemini", { geminiApiKey: geminiKey || undefined as unknown as string, geminiModel })} disabled={saving === "Gemini"}>
                {saving === "Gemini" ? <Loader2 className="mr-2 size-3 animate-spin" /> : <Key className="mr-2 size-3" />}
                Save
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Browserbase */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Globe className="size-5" />
            </div>
            <div className="flex-1">
              <CardTitle>Browserbase</CardTitle>
              <CardDescription>Browser automation for AI agents</CardDescription>
            </div>
            <Badge variant={settings?.browserbase?.configured ? "default" : "secondary"} className={settings?.browserbase?.configured ? "bg-emerald-600 border-0" : ""}>
              {settings?.browserbase?.configured ? "Configured" : "Not Configured"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Run headless browser sessions for web scraping and automation. Required for agents that need to browse the web.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bb-key">API Key</Label>
              <Input id="bb-key" type="password" placeholder="bb_live_..." value={browserbaseKey} onChange={(e) => setBrowserbaseKey(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bb-project">Project ID</Label>
              <Input id="bb-project" placeholder="Enter your project ID" value={browserbaseProjectId} onChange={(e) => setBrowserbaseProjectId(e.target.value)} />
            </div>
          </div>
          <Button size="sm" onClick={() => saveApiKey("Browserbase", { browserbaseApiKey: browserbaseKey || undefined as unknown as string, browserbaseProjectId: browserbaseProjectId || undefined as unknown as string })} disabled={saving === "Browserbase"}>
            {saving === "Browserbase" ? <Loader2 className="mr-2 size-3 animate-spin" /> : <Key className="mr-2 size-3" />}
            Save
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Slack (placeholder — needs Slack app setup) */}
      <Card className="opacity-75">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Hash className="size-5" />
            </div>
            <div className="flex-1">
              <CardTitle>Slack</CardTitle>
              <CardDescription>Channels, messages, search</CardDescription>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Slack integration requires a Slack App to be configured. Set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET environment variables to enable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
