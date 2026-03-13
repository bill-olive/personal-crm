"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Pencil, ClipboardList, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SAMPLE_INSIGHT = {
  id: "1",
  type: "meeting_notes" as const,
  title: "CVS Health Q1 Strategy Discussion - Deep Dive Analysis",
  summary: "Comprehensive analysis of CVS Health's FHIR adoption strategy and prior auth automation priorities based on executive stakeholder meeting.",
  content: `## Executive Summary

Following our Q1 strategy discussion with CVS Health's enterprise IT and clinical operations teams, we've identified several key priorities for their interoperability roadmap. This insight captures the strategic context and actionable next steps.

## Key Discussion Points

### 1. FHIR API Platform Adoption

CVS Health is accelerating their **FHIR R4** implementation across multiple lines of business:

- **Patient Access API**: Currently in production for commercial members; Medicare/Medicaid rollout planned for Q3 2025
- **Provider Access API**: Pilot with 5 regional health systems; evaluation of directory sync requirements
- **Payer-to-Payer Data Exchange**: CMS compliance deadline driving urgency; need for data quality validation

### 2. Prior Authorization Automation

The team expressed strong interest in **electronic prior authorization** (ePA) to reduce:

- Manual fax/phone submissions (estimated 40% of current volume)
- Average turnaround time (currently 3-5 business days)
- Administrative burden on provider network

**Integration considerations**:
- HL7 FHIR Da Vinci Payer Data Exchange (PDex) implementation
- Real-time eligibility verification
- Prior auth status tracking

### 3. Compliance & Timeline

| Initiative | Target Date | Status |
|------------|-------------|--------|
| Patient Access API | Q2 2025 | In Production |
| Provider Access API | Q4 2025 | Pilot Phase |
| Payer-to-Payer | Jan 2026 | Planning |
| Prior Auth (ePA) | Q2 2026 | Discovery |

## Next Steps

1. **Technical deep-dive** on FHIR API design patterns for their use case
2. **POC proposal** for prior auth automation
3. **Schedule** follow-up with clinical operations team

## Stakeholder Feedback

> "We need a solution that integrates with our existing provider portal and reduces manual touchpoints. The 1stUp Health platform approach aligns well with our roadmap."
> — VP, Enterprise IT

---

*Source: Manual entry from meeting notes. Last updated: March 2025.*
`,
  accountId: "1",
  source: "manual" as const,
  createdBy: "user-1",
  createdAt: "2025-03-12T14:30:00Z",
  accountName: "CVS Health",
};

export default function InsightDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/insights">
            <Button variant="ghost" size="icon" aria-label="Back to insights">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {SAMPLE_INSIGHT.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <ClipboardList className="size-3" />
                Meeting Notes
              </Badge>
              <Badge variant="outline" className="gap-1">
                <User className="size-3" />
                Manual
              </Badge>
              {SAMPLE_INSIGHT.accountId && (
                <Link
                  href={`/dashboard/accounts/${SAMPLE_INSIGHT.accountId}`}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  {SAMPLE_INSIGHT.accountName}
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                {new Date(SAMPLE_INSIGHT.createdAt).toLocaleDateString()}
              </span>
              <span className="text-sm text-muted-foreground">
                • {SAMPLE_INSIGHT.createdBy}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {SAMPLE_INSIGHT.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
