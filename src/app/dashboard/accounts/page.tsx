"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import type { Account } from "@/lib/db/schemas";

const ts = () => Timestamp.fromMillis(Date.now());

const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: "1",
    name: "CVS Health",
    domain: "cvshealth.com",
    industry: "Healthcare",
    size: "enterprise",
    healthPlanType: "commercial",
    stage: "customer",
    annualValue: 850000,
    products: ["FHIR API Platform", "Electronic Prior Authorization"],
    region: "Northeast",
    ownerId: "user-1",
    tags: [],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: "2",
    name: "UnitedHealth Group",
    domain: "uhc.com",
    industry: "Healthcare",
    size: "enterprise",
    healthPlanType: "commercial",
    stage: "contract",
    annualValue: 1200000,
    products: [
      "FHIR API Platform",
      "Electronic Prior Authorization",
      "Payer-to-Payer Data Exchange",
    ],
    region: "Midwest",
    ownerId: "user-1",
    tags: [],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: "3",
    name: "Anthem",
    domain: "anthem.com",
    industry: "Healthcare",
    size: "enterprise",
    healthPlanType: "commercial",
    stage: "poc",
    annualValue: 650000,
    products: ["Payer-to-Payer Data Exchange", "Provider Access API"],
    region: "Northeast",
    ownerId: "user-1",
    tags: [],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: "4",
    name: "Humana",
    domain: "humana.com",
    industry: "Healthcare",
    size: "enterprise",
    healthPlanType: "medicare",
    stage: "qualified",
    annualValue: 420000,
    products: ["Patient Access Portal", "Electronic Prior Authorization"],
    region: "South",
    ownerId: "user-1",
    tags: [],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: "5",
    name: "Cigna",
    domain: "cigna.com",
    industry: "Healthcare",
    size: "enterprise",
    healthPlanType: "commercial",
    stage: "prospect",
    annualValue: 380000,
    products: ["FHIR API Platform", "Provider Access API"],
    region: "Northeast",
    ownerId: "user-1",
    tags: [],
    createdAt: ts(),
    updatedAt: ts(),
  },
  {
    id: "6",
    name: "Aetna",
    domain: "aetna.com",
    industry: "Healthcare",
    size: "enterprise",
    healthPlanType: "commercial",
    stage: "qualified",
    annualValue: 520000,
    products: ["Patient Access Portal", "Payer-to-Payer Data Exchange"],
    region: "Northeast",
    ownerId: "user-1",
    tags: [],
    createdAt: ts(),
    updatedAt: ts(),
  },
];

const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/accounts/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "domain",
    header: "Domain",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("domain") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => (
      <StatusBadge stage={row.getValue("stage")} type="account" />
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => {
      const products = row.getValue("products") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {products?.length
            ? products.slice(0, 3).map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))
            : "—"}
          {products?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{products.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "annualValue",
    header: "Annual Value",
    cell: ({ row }) => {
      const value = row.getValue("annualValue") as number | undefined;
      return value != null
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)
        : "—";
    },
  },
  {
    accessorKey: "ownerId",
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue("ownerId") || "—"}
      </span>
    ),
  },
];

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage your healthcare payer accounts"
        action={{
          label: "New Account",
          href: "/dashboard/accounts/new",
        }}
      />
      {SAMPLE_ACCOUNTS.length > 0 ? (
        <DataTable
          columns={columns}
          data={SAMPLE_ACCOUNTS}
          searchKey="name"
          searchPlaceholder="Search by name..."
        />
      ) : (
        <EmptyState
          icon={Building2}
          title="No accounts yet"
          description="Create your first account to start tracking healthcare payers in your pipeline."
          action={{
            label: "New Account",
            href: "/dashboard/accounts/new",
          }}
        />
      )}
    </div>
  );
}
