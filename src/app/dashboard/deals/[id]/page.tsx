"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Building2,
  DollarSign,
  Percent,
  Calendar,
  Package,
  Users,
  ArrowLeft,
  Activity,
  FileText,
} from "lucide-react";
import type { Deal, DealStage } from "@/lib/db/schemas";

const ACCOUNT_NAMES: Record<string, string> = {
  "1": "CVS Health",
  "2": "UnitedHealth Group",
  "3": "Anthem",
  "4": "Humana",
  "5": "Cigna",
  "6": "Aetna",
  "7": "Centene",
  "8": "Molina Healthcare",
};

const CONTACT_NAMES: Record<string, string> = {
  "1": "Sarah Chen",
  "2": "Michael Torres",
  "3": "Jennifer Park",
  "4": "David Williams",
  "5": "Emily Rodriguez",
  "6": "Robert Kim",
  "7": "Amanda Foster",
  "8": "James Nguyen",
};

const SAMPLE_DEALS: Record<
  string,
  {
    title: string;
    accountId: string;
    contactIds: string[];
    stage: DealStage;
    value: number;
    probability: number;
    expectedCloseDate?: Date;
    products: string[];
    notes?: string;
  }
> = {
  "1": {
    title: "FHIR API Platform - CVS Health",
    accountId: "1",
    contactIds: ["1"],
    stage: "poc",
    value: 850000,
    probability: 50,
    expectedCloseDate: new Date("2025-06-30"),
    products: ["FHIR API Platform", "Electronic Prior Authorization"],
    notes: "POC phase with IT team. Technical validation in progress.",
  },
  "2": {
    title: "Prior Auth & Payer Exchange - UnitedHealth",
    accountId: "2",
    contactIds: ["2"],
    stage: "proposal",
    value: 1200000,
    probability: 65,
    expectedCloseDate: new Date("2025-08-15"),
    products: [
      "Electronic Prior Authorization",
      "Payer-to-Payer Data Exchange",
    ],
    notes: "Proposal submitted. Awaiting legal review.",
  },
  "3": {
    title: "Provider Access API - Anthem",
    accountId: "3",
    contactIds: ["3"],
    stage: "demo",
    value: 650000,
    probability: 25,
    products: ["Provider Access API", "Provider Directory"],
  },
  "4": {
    title: "Patient Access Portal - Humana",
    accountId: "4",
    contactIds: ["4"],
    stage: "negotiation",
    value: 420000,
    probability: 80,
    expectedCloseDate: new Date("2025-05-20"),
    products: ["Patient Access Portal", "Electronic Prior Authorization"],
  },
  "5": {
    title: "Analytics & Reporting - Cigna",
    accountId: "5",
    contactIds: ["5"],
    stage: "discovery",
    value: 380000,
    probability: 10,
    products: ["Analytics & Reporting", "FHIR API Platform"],
  },
  "6": {
    title: "Formulary Management - Aetna",
    accountId: "6",
    contactIds: ["6"],
    stage: "closed_won",
    value: 520000,
    probability: 100,
    products: ["Formulary Management", "Payer-to-Payer Data Exchange"],
  },
  "7": {
    title: "Provider Directory - Centene",
    accountId: "7",
    contactIds: ["7"],
    stage: "closed_lost",
    value: 280000,
    probability: 0,
    products: ["Provider Directory"],
  },
  "8": {
    title: "CMS Compliance Suite - Molina",
    accountId: "8",
    contactIds: ["8"],
    stage: "poc",
    value: 340000,
    probability: 50,
    products: ["Analytics & Reporting", "Provider Access API"],
  },
};

export default function DealDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const deal = SAMPLE_DEALS[id];

  if (!deal) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/deals">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Deals
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Deal not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accountName = ACCOUNT_NAMES[deal.accountId] || deal.accountId;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/deals">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Deals
        </Button>
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {deal.title}
          </h1>
          <div className="mt-2">
            <StatusBadge stage={deal.stage} type="deal" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deal Information</CardTitle>
                <CardDescription>Key details for this opportunity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account</p>
                    <Link
                      href={`/dashboard/accounts/${deal.accountId}`}
                      className="text-primary hover:underline"
                    >
                      {accountName}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Value</p>
                    <p>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(deal.value)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Percent className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Probability</p>
                    <p>{deal.probability}%</p>
                  </div>
                </div>
                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Expected Close</p>
                      <p>
                        {deal.expectedCloseDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  1stUp Health products in this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {deal.products.map((p) => (
                    <Badge key={p} variant="secondary">
                      {p}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {deal.contactIds?.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>
                  Key contacts for this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {deal.contactIds.map((cid) => (
                    <Link
                      key={cid}
                      href={`/dashboard/contacts/${cid}`}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                    >
                      <Users className="size-4 text-muted-foreground" />
                      {CONTACT_NAMES[cid] || cid}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {deal.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {deal.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activities</CardTitle>
              <CardDescription>
                Timeline of activities for this deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No activities recorded yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Proposals, contracts, and other documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No documents attached.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
