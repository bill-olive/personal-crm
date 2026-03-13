"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default function NewInsightPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/insights">
          <Button variant="ghost" size="icon" aria-label="Back to insights">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <PageHeader title="Add Insight" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Insight</CardTitle>
          <CardDescription>
            Add a new insight manually. AI-generated insights will appear automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Insight creation form coming soon. For now, insights are added via the AI agent or import.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/dashboard/insights")}
          >
            Back to Insights
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
