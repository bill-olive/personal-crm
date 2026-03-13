"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  LayoutGrid,
  Table as TableIcon,
  HandshakeIcon,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEAL_STAGES,
  type DealStage,
} from "@/lib/db/schemas";

const DEAL_STAGE_ORDER: DealStage[] = [
  "discovery",
  "demo",
  "poc",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

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

interface DealItem {
  id: string;
  title: string;
  accountId: string;
  contactIds: string[];
  stage: DealStage;
  value: number;
  currency: string;
  probability: number;
  products: string[];
  ownerId: string;
  tags: string[];
  accountName?: string;
  expectedCloseDate?: string | null;
  notes?: string;
}

const SAMPLE_DEALS = [
  {
    id: "1",
    title: "FHIR API Platform - CVS Health",
    accountId: "1",
    contactIds: ["1"],
    stage: "poc",
    value: 850000,
    currency: "USD",
    probability: 50,
    products: ["FHIR API Platform", "Electronic Prior Authorization"],
    ownerId: "user-1",
    tags: [],
  },
  {
    id: "2",
    title: "Prior Auth & Payer Exchange - UnitedHealth",
    accountId: "2",
    contactIds: ["2"],
    stage: "proposal",
    value: 1200000,
    currency: "USD",
    probability: 65,
    products: [
      "Electronic Prior Authorization",
      "Payer-to-Payer Data Exchange",
    ],
    ownerId: "user-1",
    tags: [],
  },
  {
    id: "3",
    title: "Provider Access API - Anthem",
    accountId: "3",
    contactIds: ["3"],
    stage: "demo",
    value: 650000,
    currency: "USD",
    probability: 25,
    products: ["Provider Access API", "Provider Directory"],
    ownerId: "user-1",
    tags: [],
  },
  {
    id: "4",
    title: "Patient Access Portal - Humana",
    accountId: "4",
    contactIds: ["4"],
    stage: "negotiation",
    value: 420000,
    currency: "USD",
    probability: 80,
    products: ["Patient Access Portal", "Electronic Prior Authorization"],
    ownerId: "user-1",
    tags: [],
  },
  {
    id: "5",
    title: "Analytics & Reporting - Cigna",
    accountId: "5",
    contactIds: ["5"],
    stage: "discovery",
    value: 380000,
    currency: "USD",
    probability: 10,
    products: ["Analytics & Reporting", "FHIR API Platform"],
    ownerId: "user-1",
    tags: [],
  },
  {
    id: "6",
    title: "Formulary Management - Aetna",
    accountId: "6",
    contactIds: ["6"],
    stage: "closed_won",
    value: 520000,
    currency: "USD",
    probability: 100,
    products: ["Formulary Management", "Payer-to-Payer Data Exchange"],
    ownerId: "user-1",
    tags: [],
  },
  {
    id: "7",
    title: "Provider Directory - Centene",
    accountId: "7",
    contactIds: ["7"],
    stage: "closed_lost",
    value: 280000,
    currency: "USD",
    probability: 0,
    products: ["Provider Directory"],
    ownerId: "user-1",
    tags: [],
  },
  {
    id: "8",
    title: "CMS Compliance Suite - Molina",
    accountId: "8",
    contactIds: ["8"],
    stage: "poc",
    value: 340000,
    currency: "USD",
    probability: 50,
    products: ["Analytics & Reporting", "Provider Access API"],
    ownerId: "user-1",
    tags: [],
  },
] satisfies DealItem[];

const SAMPLE_DEALS_WITH_NAMES = SAMPLE_DEALS.map((d) => ({ ...d, accountName: ACCOUNT_NAMES[d.accountId] }));

const columns: ColumnDef<DealItem>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/deals/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.getValue("title")}
      </Link>
    ),
  },
  {
    accessorKey: "accountName",
    header: "Account",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.accountName || row.original.accountId || "—"}
      </span>
    ),
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => (
      <StatusBadge stage={row.getValue("stage")} type="deal" />
    ),
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const value = row.getValue("value") as number;
      return (
        <span>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "probability",
    header: "Probability",
    cell: ({ row }) => (
      <span>{row.getValue("probability") as number}%</span>
    ),
  },
  {
    accessorKey: "expectedCloseDate",
    header: "Expected Close",
    cell: ({ row }) => {
      const val = row.original.expectedCloseDate;
      if (!val) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-muted-foreground">
          {new Date(val).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => {
      const products = row.getValue("products") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {products?.length
            ? products.slice(0, 2).map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))
            : "—"}
          {products?.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{products.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
];

function KanbanBoard({ deals }: { deals: DealItem[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {DEAL_STAGE_ORDER.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
        const stageInfo = DEAL_STAGES[stage];
        return (
          <div
            key={stage}
            className="flex w-64 shrink-0 flex-col rounded-lg border bg-muted/30"
          >
            <div className="border-b px-4 py-3">
              <p className="font-medium">{stageInfo?.label || stage}</p>
              <p className="text-xs text-muted-foreground">
                {stageDeals.length} deal{stageDeals.length !== 1 ? "s" : ""} ·{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalValue)}
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
              {stageDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}`}
                  className="block rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                >
                  <p className="font-medium text-sm">{deal.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {deal.accountName || deal.accountId}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-primary">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(deal.value)}
                    </span>
                    <span className="text-muted-foreground">
                      {deal.probability}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DealsPage() {
  const [view, setView] = useState<"board" | "table">("board");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="Pipeline and opportunities"
        action={{
          label: "New Deal",
          href: "/dashboard/deals/new",
          icon: <Plus className="size-4" />,
        }}
      >
        <div className="flex gap-2">
          <Button
            variant={view === "board" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("board")}
            className="gap-2"
          >
            <LayoutGrid className="size-4" />
            Board
          </Button>
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
            className="gap-2"
          >
            <TableIcon className="size-4" />
            Table
          </Button>
        </div>
      </PageHeader>

      {SAMPLE_DEALS_WITH_NAMES.length > 0 ? (
        view === "board" ? (
          <KanbanBoard deals={SAMPLE_DEALS_WITH_NAMES} />
        ) : (
          <DataTable
            columns={columns}
            data={SAMPLE_DEALS_WITH_NAMES}
            searchKey="title"
            searchPlaceholder="Search by title..."
          />
        )
      ) : (
        <EmptyState
          icon={HandshakeIcon}
          title="No deals yet"
          description="Create your first deal to start tracking opportunities in your pipeline."
          action={{
            label: "New Deal",
            href: "/dashboard/deals/new",
          }}
        />
      )}
    </div>
  );
}
