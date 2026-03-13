"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { User, Building2, Plug, Key, ArrowRight } from "lucide-react";

const settingCards = [
  {
    title: "Profile",
    description: "Manage your personal information",
    href: "/dashboard/settings/profile",
    icon: User,
  },
  {
    title: "Organization",
    description: "Team and workspace settings",
    href: "/dashboard/settings/organization",
    icon: Building2,
  },
  {
    title: "Integrations",
    description: "Connect Google, Slack, and more",
    href: "/dashboard/settings/integrations",
    icon: Plug,
  },
  {
    title: "API Keys",
    description: "Manage OpenAI and Browserbase keys",
    href: "/dashboard/settings/api-keys",
    icon: Key,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage your account and workspace" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {settingCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <card.icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{card.title}</CardTitle>
                <CardDescription className="mt-1">{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
