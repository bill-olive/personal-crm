"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  User,
  FileText,
  HandshakeIcon,
  CalendarCheck,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

const SAMPLE_ACCOUNT = {
  id: "1",
  name: "CVS Health",
  domain: "cvshealth.com",
  industry: "Healthcare",
  size: "enterprise",
  healthPlanType: "commercial",
  stage: "customer" as const,
  annualValue: 850000,
  products: ["FHIR API Platform", "Electronic Prior Authorization"],
  region: "Northeast",
  memberCount: 24000000,
  ownerId: "user-1",
  notes:
    "Key strategic account. Primary focus on FHIR API adoption and prior auth automation. Strong relationship with enterprise IT team.",
};

const INFO_CARDS = [
  { label: "Domain", value: SAMPLE_ACCOUNT.domain },
  { label: "Industry", value: SAMPLE_ACCOUNT.industry },
  { label: "Health Plan Type", value: "Commercial" },
  { label: "Size", value: "Enterprise" },
  { label: "Region", value: SAMPLE_ACCOUNT.region },
  {
    label: "Annual Value",
    value: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(SAMPLE_ACCOUNT.annualValue),
  },
  {
    label: "Member Count",
    value: SAMPLE_ACCOUNT.memberCount
      ? new Intl.NumberFormat("en-US").format(SAMPLE_ACCOUNT.memberCount)
      : "—",
  },
];

export default function AccountDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounts">
            <Button variant="ghost" size="icon" aria-label="Back to accounts">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {SAMPLE_ACCOUNT.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge stage={SAMPLE_ACCOUNT.stage} type="account" />
            </div>
          </div>
        </div>
        <Link href={`/dashboard/accounts/${id}/edit`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="size-4" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Company info cards */}
          <Card>
            <CardHeader>
              <CardTitle>Company Info</CardTitle>
              <CardDescription>Key details about this account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {INFO_CARDS.map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-medium">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>1stUp Health products in use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_ACCOUNT.products.map((product) => (
                  <Badge key={product} variant="secondary">
                    {product}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Internal notes about this account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {SAMPLE_ACCOUNT.notes || "No notes yet."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <EmptyState
            icon={User}
            title="No contacts yet"
            description="Add contacts to track key stakeholders at this account."
            action={{ label: "Add Contact", href: "#" }}
          />
        </TabsContent>

        <TabsContent value="deals">
          <EmptyState
            icon={HandshakeIcon}
            title="No deals yet"
            description="Create deals to track opportunities with this account."
            action={{ label: "New Deal", href: "#" }}
          />
        </TabsContent>

        <TabsContent value="activities">
          <EmptyState
            icon={CalendarCheck}
            title="No activities yet"
            description="Log calls, meetings, and other activities with this account."
            action={{ label: "Log Activity", href: "#" }}
          />
        </TabsContent>

        <TabsContent value="documents">
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload proposals, contracts, and other documents."
            action={{ label: "Upload Document", href: "#" }}
          />
        </TabsContent>

        <TabsContent value="insights">
          <EmptyState
            icon={Lightbulb}
            title="No insights yet"
            description="AI-generated insights will appear here."
            action={{ label: "Generate Insights", href: "#" }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
