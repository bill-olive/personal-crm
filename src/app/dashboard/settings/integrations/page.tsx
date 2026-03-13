"use client";

import { useState } from "react";
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
import {
  Chrome,
  Hash,
  Globe,
  Bot,
  Plug,
  CheckCircle,
  XCircle,
  RefreshCw,
  Key,
  Settings,
  Shield,
} from "lucide-react";

export default function IntegrationsPage() {
  const [googleConnected, setGoogleConnected] = useState(true);
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackWorkspace, setSlackWorkspace] = useState("");
  const [browserbaseApiKey, setBrowserbaseApiKey] = useState("");
  const [browserbaseProjectId, setBrowserbaseProjectId] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o");
  const [googleLastSynced, setGoogleLastSynced] = useState(
    "2 minutes ago"
  );

  const googlePermissions = [
    "Gmail Read/Send",
    "Drive Read/Write",
    "Docs Read/Write",
    "Calendar Read/Write",
  ];

  const slackPermissions = [
    "Read channels",
    "Post messages",
    "Search",
  ];

  const handleTestGoogle = () => {
    setGoogleLastSynced("Just now");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Integrations"
        description="Connect Google, Slack, and other services to power your CRM"
      />

      <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-4">
        <Shield className="size-5 shrink-0 text-muted-foreground mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Integrations are encrypted and stored securely. OAuth connections can be
          revoked at any time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
                  <CardDescription>
                    Gmail, Drive, Docs, Calendar
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={googleConnected ? "default" : "secondary"}
                className={
                  googleConnected
                    ? "bg-emerald-600 hover:bg-emerald-700 border-0"
                    : ""
                }
              >
                {googleConnected ? (
                  <>
                    <CheckCircle className="mr-1 size-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 size-3" />
                    Not Connected
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sync emails, documents, and calendar events. Enable AI-powered
              insights from your Google data.
            </p>
            {googleConnected && (
              <>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Permissions granted
                  </p>
                  <ul className="text-sm space-y-1">
                    {googlePermissions.map((perm) => (
                      <li key={perm} className="flex items-center gap-2">
                        <CheckCircle className="size-3.5 text-emerald-500" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last synced: {googleLastSynced}
                </p>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              {googleConnected ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestGoogle}
                    className="gap-2"
                  >
                    <RefreshCw className="size-4" />
                    Test Connection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setGoogleConnected(false)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setGoogleConnected(true)}
                  className="gap-2"
                >
                  Connect Google
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Slack */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Hash className="size-5" />
                </div>
                <div>
                  <CardTitle>Slack</CardTitle>
                  <CardDescription>
                    Channels, messages, search
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={slackConnected ? "default" : "secondary"}
                className={
                  slackConnected
                    ? "bg-emerald-600 hover:bg-emerald-700 border-0"
                    : ""
                }
              >
                {slackConnected ? (
                  <>
                    <CheckCircle className="mr-1 size-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 size-3" />
                    Not Connected
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Post updates to channels, search messages, and sync team
              conversations with your CRM.
            </p>
            {slackConnected && slackWorkspace && (
              <p className="text-sm">
                Workspace: <span className="font-medium">{slackWorkspace}</span>
              </p>
            )}
            {slackConnected && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Permissions granted
                </p>
                <ul className="text-sm space-y-1">
                  {slackPermissions.map((perm) => (
                    <li key={perm} className="flex items-center gap-2">
                      <CheckCircle className="size-3.5 text-emerald-500" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {slackConnected ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setSlackConnected(false)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setSlackConnected(true);
                    setSlackWorkspace("Acme Workspace");
                  }}
                  className="gap-2"
                >
                  Connect Slack
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Browserbase */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Globe className="size-5" />
                </div>
                <div>
                  <CardTitle>Browserbase</CardTitle>
                  <CardDescription>
                    Browser automation for AI agents
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={
                  browserbaseApiKey && browserbaseProjectId
                    ? "default"
                    : "secondary"
                }
                className={
                  browserbaseApiKey && browserbaseProjectId
                    ? "bg-emerald-600 hover:bg-emerald-700 border-0"
                    : ""
                }
              >
                {browserbaseApiKey && browserbaseProjectId ? (
                  <>
                    <CheckCircle className="mr-1 size-3" />
                    Configured
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 size-3" />
                    Not Configured
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Run headless browser sessions for web scraping and automation.
              Required for agents that need to browse the web.
            </p>
            <div className="space-y-2">
              <Label htmlFor="browserbase-api-key" className="flex items-center gap-2">
                <Key className="size-4" />
                API Key
              </Label>
              <Input
                id="browserbase-api-key"
                type="password"
                value={browserbaseApiKey}
                onChange={(e) => setBrowserbaseApiKey(e.target.value)}
                placeholder="••••••••••••••••"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="browserbase-project-id">Project ID</Label>
              <Input
                id="browserbase-project-id"
                value={browserbaseProjectId}
                onChange={(e) => setBrowserbaseProjectId(e.target.value)}
                placeholder="Enter your project ID"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Save</Button>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="size-4" />
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* OpenAI */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Bot className="size-5" />
                </div>
                <div>
                  <CardTitle>OpenAI</CardTitle>
                  <CardDescription>
                    GPT models for AI agents
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={openaiApiKey ? "default" : "secondary"}
                className={
                  openaiApiKey
                    ? "bg-emerald-600 hover:bg-emerald-700 border-0"
                    : ""
                }
              >
                {openaiApiKey ? (
                  <>
                    <CheckCircle className="mr-1 size-3" />
                    Configured
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 size-3" />
                    Not Configured
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Power AI agents with GPT-4. Used for research, drafting, and
              intelligent automation.
            </p>
            <div className="space-y-2">
              <Label htmlFor="openai-api-key" className="flex items-center gap-2">
                <Key className="size-4" />
                API Key
              </Label>
              <Input
                id="openai-api-key"
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-••••••••••••••••"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openai-model">Model</Label>
              <Select value={openaiModel} onValueChange={(v) => v && setOpenaiModel(v)}>
                <SelectTrigger id="openai-model" className="w-full">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Save</Button>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="size-4" />
                Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
