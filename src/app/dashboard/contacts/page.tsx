"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import type { Contact } from "@/lib/db/schemas";

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

const SAMPLE_CONTACTS: (Contact & { name?: string })[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@cvshealth.com",
    phone: "+1 (401) 555-0101",
    title: "VP of Digital Health",
    department: "Technology",
    accountId: "1",
    tags: ["decision-maker", "technical"],
    createdAt: {} as never,
    updatedAt: {} as never,
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Torres",
    email: "michael.torres@uhc.com",
    phone: "+1 (952) 555-0102",
    title: "Director of Interoperability",
    department: "IT",
    accountId: "2",
    tags: ["champion", "FHIR"],
    createdAt: {} as never,
    updatedAt: {} as never,
  },
  {
    id: "3",
    firstName: "Jennifer",
    lastName: "Park",
    email: "jennifer.park@anthem.com",
    phone: "+1 (317) 555-0103",
    title: "Chief Data Officer",
    department: "Data & Analytics",
    accountId: "3",
    tags: ["executive", "prior-auth"],
    createdAt: {} as never,
    updatedAt: {} as never,
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Williams",
    email: "david.williams@humana.com",
    phone: "+1 (502) 555-0104",
    title: "Sr. Manager, Provider Solutions",
    department: "Provider Relations",
    accountId: "4",
    tags: ["provider-api", "patient-access"],
    createdAt: {} as never,
    updatedAt: {} as never,
  },
  {
    id: "5",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@cigna.com",
    phone: "+1 (860) 555-0105",
    title: "Head of API Strategy",
    department: "Enterprise Architecture",
    accountId: "5",
    tags: ["technical", "FHIR"],
    createdAt: {} as never,
    updatedAt: {} as never,
  },
  {
    id: "6",
    firstName: "Robert",
    lastName: "Kim",
    email: "robert.kim@aetna.com",
    phone: "+1 (860) 555-0106",
    title: "VP of Clinical Operations",
    department: "Clinical",
    accountId: "6",
    tags: ["prior-auth", "clinical"],
    createdAt: {} as never,
    updatedAt: {} as never,
  },
  {
    id: "7",
    firstName: "Amanda",
    lastName: "Foster",
    email: "amanda.foster@centene.com",
    phone: "+1 (314) 555-0107",
    title: "Director of Member Experience",
    department: "Member Services",
    accountId: "7",
    tags: ["patient-portal", "medicaid"],
    createdAt: {} as never,
    updatedAt: {} as never,
  },
  {
    id: "8",
    firstName: "James",
    lastName: "Nguyen",
    email: "james.nguyen@molinahealthcare.com",
    phone: "+1 (562) 555-0108",
    title: "Interoperability Lead",
    department: "Technology",
    accountId: "8",
    tags: ["payer-exchange", "dual-eligible"],
    createdAt: {} as never,
    updatedAt: {} as never,
  },
].map((c) => ({ ...c, name: `${c.firstName} ${c.lastName}` }));

const columns: ColumnDef<Contact & { name?: string }>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/contacts/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.firstName} {row.original.lastName}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("email") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("title") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "accountId",
    header: "Company",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {ACCOUNT_NAMES[row.original.accountId] || row.original.accountId || "—"}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("phone") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {tags?.length
            ? tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))
            : "—"}
          {tags?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
];

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage contacts across your healthcare accounts"
        action={{
          label: "New Contact",
          href: "/dashboard/contacts/new",
          icon: <Users className="size-4" />,
        }}
      />
      {SAMPLE_CONTACTS.length > 0 ? (
        <DataTable
          columns={columns}
          data={SAMPLE_CONTACTS}
          searchKey="name"
          searchPlaceholder="Search by name..."
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Create your first contact to start building relationships with healthcare payer stakeholders."
          action={{
            label: "New Contact",
            href: "/dashboard/contacts/new",
          }}
        />
      )}
    </div>
  );
}
