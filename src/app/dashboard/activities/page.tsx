"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Video,
  StickyNote,
  CheckSquare,
  Plus,
  Filter,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Activity, ActivityType } from "@/lib/db/schemas";
import { createActivity } from "@/lib/actions/activities";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";

const ts = (ms: number) => Timestamp.fromMillis(ms);
const now = Date.now();

const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "call",
    subject: "Q1 Check-in with CVS Health",
    description: "Discussed FHIR API rollout timeline and prior auth integration status.",
    accountId: "1",
    ownerId: "user-1",
    createdAt: ts(now - 2 * 3600000),
  },
  {
    id: "2",
    type: "email",
    subject: "Proposal follow-up - UnitedHealth",
    description: "Sent updated pricing and implementation timeline.",
    accountId: "2",
    ownerId: "user-1",
    createdAt: ts(now - 5 * 3600000),
  },
  {
    id: "3",
    type: "meeting",
    subject: "Demo: Payer-to-Payer Data Exchange",
    description: "Live demo for Anthem technical team. Positive feedback on API design.",
    accountId: "3",
    ownerId: "user-1",
    createdAt: ts(now - 24 * 3600000),
  },
  {
    id: "4",
    type: "note",
    subject: "Humana compliance requirements",
    description: "CMS compliance checklist and audit readiness requirements.",
    accountId: "4",
    ownerId: "user-1",
    createdAt: ts(now - 36 * 3600000),
  },
  {
    id: "5",
    type: "task",
    subject: "Send contract to Cigna legal",
    description: "Draft MSA and SOW for review.",
    accountId: "5",
    ownerId: "user-1",
    dueDate: ts(now + 48 * 3600000),
    createdAt: ts(now - 48 * 3600000),
  },
  {
    id: "6",
    type: "call",
    subject: "Aetna - Provider Access API scope",
    description: "Clarified scope for provider directory integration.",
    accountId: "6",
    ownerId: "user-1",
    createdAt: ts(now - 72 * 3600000),
  },
  {
    id: "7",
    type: "email",
    subject: "Meeting notes - CVS Health",
    description: "Shared summary and action items from last call.",
    accountId: "1",
    ownerId: "user-1",
    createdAt: ts(now - 96 * 3600000),
  },
  {
    id: "8",
    type: "meeting",
    subject: "Executive briefing - UnitedHealth",
    description: "C-suite overview of platform capabilities.",
    accountId: "2",
    ownerId: "user-1",
    createdAt: ts(now - 120 * 3600000),
  },
  {
    id: "9",
    type: "note",
    subject: "Anthem POC success criteria",
    description: "Documented acceptance criteria for Phase 1.",
    accountId: "3",
    ownerId: "user-1",
    createdAt: ts(now - 144 * 3600000),
  },
  {
    id: "10",
    type: "task",
    subject: "Schedule Humana kickoff",
    description: "Coordinate with project management.",
    accountId: "4",
    ownerId: "user-1",
    dueDate: ts(now + 24 * 3600000),
    createdAt: ts(now - 168 * 3600000),
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

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Video,
  note: StickyNote,
  task: CheckSquare,
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
  task: "Task",
};

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "call", label: "Calls" },
  { value: "email", label: "Emails" },
  { value: "meeting", label: "Meetings" },
  { value: "note", label: "Notes" },
  { value: "task", label: "Tasks" },
];

function formatTimestamp(t: Timestamp | undefined): string {
  if (!t) return "";
  const d = t.toDate ? t.toDate() : new Date((t as { seconds: number }).seconds * 1000);
  return d.toLocaleString();
}

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [formType, setFormType] = useState<ActivityType>("call");
  const [formSubject, setFormSubject] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAccountId, setFormAccountId] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFilteredActivities = (filter: string) =>
    filter === "all"
      ? SAMPLE_ACTIVITIES
      : SAMPLE_ACTIVITIES.filter((a) => a.type === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) {
      toast.error("Subject is required");
      return;
    }
    const orgId = user?.uid ? `${user.uid}_org` : "demo-org";
    setIsSubmitting(true);
    try {
      await createActivity(orgId, {
        type: formType,
        subject: formSubject.trim(),
        description: formDescription.trim() || undefined,
        accountId: formAccountId || undefined,
        dueDate: formDueDate || undefined,
        ownerId: user?.uid || "unknown",
      });
      toast.success("Activity logged");
      setDialogOpen(false);
      setFormSubject("");
      setFormDescription("");
      setFormAccountId("");
      setFormDueDate("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="Calls, meetings, emails, and notes across your accounts"
        action={{
          label: "Log Activity",
          onClick: () => setDialogOpen(true),
          icon: <Plus className="size-4" />,
        }}
      />

      <Tabs value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList className="gap-1">
          <Filter className="size-4" />
          {TYPE_FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TYPE_FILTERS.map((f) => (
          <TabsContent key={f.value} value={f.value} className="mt-6">
            <div className="space-y-4">
              {getFilteredActivities(f.value).map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type];
                return (
                  <Card key={activity.id} size="sm">
                    <CardHeader className="flex flex-row items-start gap-3 pb-2">
                      <div className="rounded-lg bg-muted p-2">
                        <Icon className="size-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {ACTIVITY_LABELS[activity.type]}
                          </Badge>
                          {activity.accountId && (
                            <Link
                              href={`/dashboard/accounts/${activity.accountId}`}
                              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                            >
                              {ACCOUNT_NAMES[activity.accountId] || "Account"}
                            </Link>
                          )}
                        </div>
                        <h3 className="font-medium mt-1">{activity.subject}</h3>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimestamp(activity.createdAt)}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formType}
                onValueChange={(v) => setFormType(v as ActivityType)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {ACTIVITY_LABELS[t]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Q1 check-in call"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add details..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Account</Label>
              <Select
                value={formAccountId}
                onValueChange={(v) => setFormAccountId(v ?? "")}
              >
                <SelectTrigger id="accountId">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_NAMES).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging..." : "Log Activity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
