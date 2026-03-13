"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Linkedin,
  ArrowLeft,
  Activity,
  HandshakeIcon,
} from "lucide-react";

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

const SAMPLE_CONTACTS: Record<
  string,
  {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
    department?: string;
    accountId: string;
    linkedInUrl?: string;
    tags: string[];
  }
> = {
  "1": {
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@cvshealth.com",
    phone: "+1 (401) 555-0101",
    title: "VP of Digital Health",
    department: "Technology",
    accountId: "1",
    linkedInUrl: "https://linkedin.com/in/sarahchen",
    tags: ["decision-maker", "technical"],
  },
  "2": {
    firstName: "Michael",
    lastName: "Torres",
    email: "michael.torres@uhc.com",
    phone: "+1 (952) 555-0102",
    title: "Director of Interoperability",
    department: "IT",
    accountId: "2",
    linkedInUrl: "https://linkedin.com/in/michaeltorres",
    tags: ["champion", "FHIR"],
  },
  "3": {
    firstName: "Jennifer",
    lastName: "Park",
    email: "jennifer.park@anthem.com",
    phone: "+1 (317) 555-0103",
    title: "Chief Data Officer",
    department: "Data & Analytics",
    accountId: "3",
    tags: ["executive", "prior-auth"],
  },
  "4": {
    firstName: "David",
    lastName: "Williams",
    email: "david.williams@humana.com",
    phone: "+1 (502) 555-0104",
    title: "Sr. Manager, Provider Solutions",
    department: "Provider Relations",
    accountId: "4",
    tags: ["provider-api", "patient-access"],
  },
  "5": {
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@cigna.com",
    phone: "+1 (860) 555-0105",
    title: "Head of API Strategy",
    department: "Enterprise Architecture",
    accountId: "5",
    tags: ["technical", "FHIR"],
  },
  "6": {
    firstName: "Robert",
    lastName: "Kim",
    email: "robert.kim@aetna.com",
    phone: "+1 (860) 555-0106",
    title: "VP of Clinical Operations",
    department: "Clinical",
    accountId: "6",
    tags: ["prior-auth", "clinical"],
  },
  "7": {
    firstName: "Amanda",
    lastName: "Foster",
    email: "amanda.foster@centene.com",
    phone: "+1 (314) 555-0107",
    title: "Director of Member Experience",
    department: "Member Services",
    accountId: "7",
    tags: ["patient-portal", "medicaid"],
  },
  "8": {
    firstName: "James",
    lastName: "Nguyen",
    email: "james.nguyen@molinahealthcare.com",
    phone: "+1 (562) 555-0108",
    title: "Interoperability Lead",
    department: "Technology",
    accountId: "8",
    tags: ["payer-exchange", "dual-eligible"],
  },
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const contact = SAMPLE_CONTACTS[id];

  if (!contact) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/contacts">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Contacts
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Contact not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const companyName = ACCOUNT_NAMES[contact.accountId] || contact.accountId;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/contacts">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Contacts
        </Button>
      </Link>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Avatar size="lg" className="size-16">
          <AvatarFallback className="text-lg">
            {contact.firstName[0]}
            {contact.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {contact.firstName} {contact.lastName}
          </h1>
          {contact.title && (
            <p className="text-muted-foreground">{contact.title}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {contact.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Details for this contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-primary hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}
                {contact.title && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Title</p>
                      <p className="text-muted-foreground">{contact.title}</p>
                    </div>
                  </div>
                )}
                {contact.department && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-muted-foreground">
                        {contact.department}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <Link
                      href={`/dashboard/accounts/${contact.accountId}`}
                      className="text-primary hover:underline"
                    >
                      {companyName}
                    </Link>
                  </div>
                </div>
                {contact.linkedInUrl && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">LinkedIn</p>
                      <a
                        href={contact.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Recent activity with this contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No activity recorded yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="deals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Linked Deals</CardTitle>
              <CardDescription>
                Deals associated with this contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HandshakeIcon className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No linked deals.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
