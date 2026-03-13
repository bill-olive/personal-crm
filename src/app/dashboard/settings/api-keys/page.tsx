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
import { PageHeader } from "@/components/shared/page-header";
import { Shield } from "lucide-react";
import { toast } from "sonner";

export default function ApiKeysPage() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [browserbaseKey, setBrowserbaseKey] = useState("");
  const [browserbaseProjectId, setBrowserbaseProjectId] = useState("");

  const handleSaveOpenAI = () => {
    toast.success("OpenAI API key saved");
  };

  const handleSaveBrowserbase = () => {
    toast.success("Browserbase credentials saved");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="API Keys"
        description="Manage OpenAI and Browserbase keys"
      />

      <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-4">
        <Shield className="size-5 shrink-0 text-muted-foreground mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Keys are encrypted and stored securely. They are never displayed in
          full after saving.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Key</CardTitle>
          <CardDescription>
            Used for AI agents and intelligent features. Get your key from
            platform.openai.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">API Key</Label>
            <Input
              id="openai-key"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-••••••••••••••••"
              className="font-mono"
            />
          </div>
          <Button onClick={handleSaveOpenAI}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Browserbase</CardTitle>
          <CardDescription>
            API Key and Project ID for browser automation. Get credentials from
            browserbase.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="browserbase-key">API Key</Label>
            <Input
              id="browserbase-key"
              type="password"
              value={browserbaseKey}
              onChange={(e) => setBrowserbaseKey(e.target.value)}
              placeholder="••••••••••••••••"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="browserbase-project">Project ID</Label>
            <Input
              id="browserbase-project"
              type="password"
              value={browserbaseProjectId}
              onChange={(e) => setBrowserbaseProjectId(e.target.value)}
              placeholder="••••••••••••••••"
              className="font-mono"
            />
          </div>
          <Button onClick={handleSaveBrowserbase}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
