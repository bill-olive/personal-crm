"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  FileText,
  Upload,
  Grid,
  List,
  File,
  FileCheck,
  Presentation,
  FileSearch,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table";
import type { CRMDocument, DocumentType } from "@/lib/db/schemas";

const ts = (ms: number) => Timestamp.fromMillis(ms);
const now = Date.now();

const SAMPLE_DOCUMENTS: CRMDocument[] = [
  {
    id: "1",
    title: "CVS Health - FHIR API Proposal",
    type: "proposal",
    storagePath: "org/documents/prop-1.pdf",
    mimeType: "application/pdf",
    size: 2450000,
    accountId: "1",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 86400000),
    updatedAt: ts(now - 86400000),
  },
  {
    id: "2",
    title: "UnitedHealth Platform Overview Deck",
    type: "deck",
    storagePath: "org/documents/deck-2.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: 8200000,
    accountId: "2",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 172800000),
    updatedAt: ts(now - 172800000),
  },
  {
    id: "3",
    title: "Anthem Implementation Brief",
    type: "brief",
    storagePath: "org/documents/brief-3.pdf",
    mimeType: "application/pdf",
    size: 512000,
    accountId: "3",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 259200000),
    updatedAt: ts(now - 259200000),
  },
  {
    id: "4",
    title: "Humana MSA - Master Service Agreement",
    type: "contract",
    storagePath: "org/documents/contract-4.pdf",
    mimeType: "application/pdf",
    size: 1200000,
    accountId: "4",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 345600000),
    updatedAt: ts(now - 345600000),
  },
  {
    id: "5",
    title: "CMS Compliance Research Report",
    type: "research",
    storagePath: "org/documents/research-5.pdf",
    mimeType: "application/pdf",
    size: 3100000,
    accountId: "1",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 432000000),
    updatedAt: ts(now - 432000000),
  },
  {
    id: "6",
    title: "Cigna Prior Auth Proposal",
    type: "proposal",
    storagePath: "org/documents/prop-6.pdf",
    mimeType: "application/pdf",
    size: 1890000,
    accountId: "5",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 518400000),
    updatedAt: ts(now - 518400000),
  },
  {
    id: "7",
    title: "Aetna Executive Briefing Deck",
    type: "deck",
    storagePath: "org/documents/deck-7.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: 6500000,
    accountId: "6",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 604800000),
    updatedAt: ts(now - 604800000),
  },
  {
    id: "8",
    title: "Payer-to-Payer Data Exchange Contract",
    type: "contract",
    storagePath: "org/documents/contract-8.pdf",
    mimeType: "application/pdf",
    size: 980000,
    accountId: "2",
    tags: [],
    createdBy: "user-1",
    createdAt: ts(now - 691200000),
    updatedAt: ts(now - 691200000),
  },
];

const ACCOUNT_NAMES: Record<string, string> = {
  "1": "CVS Health",
  "2": "UnitedHealth Group",
  "3": "Anthem",
  "4": "Humana",
  "5": "Cigna",
  "6": "Aetna",
};

const DOC_ICONS: Record<DocumentType, React.ElementType> = {
  proposal: FileText,
  deck: Presentation,
  brief: FileText,
  contract: FileCheck,
  research: FileSearch,
  report: FileText,
  other: File,
};

const DOC_LABELS: Record<DocumentType, string> = {
  proposal: "Proposal",
  deck: "Deck",
  brief: "Brief",
  contract: "Contract",
  research: "Research",
  report: "Report",
  other: "Other",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(t: Timestamp | undefined): string {
  if (!t) return "";
  const d = t.toDate ? t.toDate() : new Date((t as { seconds: number }).seconds * 1000);
  return d.toLocaleDateString();
}

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const columns: ColumnDef<CRMDocument>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary">{DOC_LABELS[row.original.type]}</Badge>
      ),
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatSize(row.original.size)}
        </span>
      ),
    },
    {
      accessorKey: "accountId",
      header: "Account",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/accounts/${row.original.accountId}`}
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          {row.original.accountId
            ? ACCOUNT_NAMES[row.original.accountId] || row.original.accountId
            : "—"}
        </Link>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Proposals, contracts, and other files"
        action={{
          label: "Upload",
          onClick: () => setUploadDialogOpen(true),
          icon: <Upload className="size-4" />,
        }}
      >
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
        </div>
      </PageHeader>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SAMPLE_DOCUMENTS.map((doc) => {
            const Icon = DOC_ICONS[doc.type];
            return (
              <Card key={doc.id} size="sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2">{doc.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {DOC_LABELS[doc.type]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatSize(doc.size)}</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={SAMPLE_DOCUMENTS}
          searchKey="title"
          searchPlaceholder="Search documents..."
        />
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Upload functionality requires Firebase Storage configuration.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
