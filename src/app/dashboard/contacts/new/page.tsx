"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { createContact } from "@/lib/actions/contacts";

const ACCOUNT_OPTIONS = [
  { id: "1", name: "CVS Health" },
  { id: "2", name: "UnitedHealth Group" },
  { id: "3", name: "Anthem" },
  { id: "4", name: "Humana" },
  { id: "5", name: "Cigna" },
  { id: "6", name: "Aetna" },
  { id: "7", name: "Centene" },
  { id: "8", name: "Molina Healthcare" },
];

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function NewContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      title: "",
      department: "",
      accountId: "",
      linkedInUrl: "",
      tags: "",
      notes: "",
    },
  });

  const accountId = watch("accountId");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const orgId = "org-1"; // TODO: Get from auth context
      const tags = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const id = await createContact(orgId, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        title: data.title || undefined,
        department: data.department || undefined,
        accountId: data.accountId,
        linkedInUrl: data.linkedInUrl || undefined,
        tags,
        notes: data.notes || undefined,
      });
      toast.success("Contact created successfully");
      router.push(`/dashboard/contacts/${id}`);
    } catch {
      toast.error("Failed to create contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/contacts">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Contacts
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Contact
        </h1>
        <p className="text-muted-foreground mt-1">
          Add a new contact to your CRM
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="john.doe@company.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="VP of Technology"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...register("department")}
              placeholder="Technology"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountId">Account / Company</Label>
            <Select
              value={accountId ?? ""}
              onValueChange={(v) => setValue("accountId", v ?? "")}
            >
              <SelectTrigger id="accountId" className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_OPTIONS.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-destructive">
                {errors.accountId.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
          <Input
            id="linkedInUrl"
            {...register("linkedInUrl")}
            placeholder="https://linkedin.com/in/username"
          />
          {errors.linkedInUrl && (
            <p className="text-sm text-destructive">
              {errors.linkedInUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="decision-maker, technical, FHIR"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Additional notes..."
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Contact"}
          </Button>
          <Link href="/dashboard/contacts">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
