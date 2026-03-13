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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { createDeal } from "@/lib/actions/deals";
import {
  DEAL_STAGES,
  FIRSTUP_HEALTH_PRODUCTS,
  type DealStage,
} from "@/lib/db/schemas";

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

const dealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  accountId: z.string().min(1, "Account is required"),
  stage: z.enum([
    "discovery",
    "demo",
    "poc",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
  ] as const),
  value: z.number().min(0, "Value must be positive"),
  probability: z.number().min(0).max(100, "Probability must be 0-100"),
  expectedCloseDate: z.string().optional(),
  products: z.array(z.string()),
  notes: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

export default function NewDealPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      accountId: "",
      stage: "discovery",
      value: 0,
      probability: 10,
      expectedCloseDate: "",
      products: [],
      notes: "",
    },
  });

  const accountId = watch("accountId");
  const products = watch("products");

  const toggleProduct = (product: string) => {
    const current = products || [];
    if (current.includes(product)) {
      setValue(
        "products",
        current.filter((p) => p !== product)
      );
    } else {
      setValue("products", [...current, product]);
    }
  };

  const onSubmit = async (data: DealFormData) => {
    setIsSubmitting(true);
    try {
      const orgId = "org-1"; // TODO: Get from auth context
      const id = await createDeal(orgId, {
        title: data.title,
        accountId: data.accountId,
        contactIds: [],
        stage: data.stage as DealStage,
        value: data.value,
        currency: "USD",
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate || undefined,
        products: data.products,
        ownerId: "user-1",
        tags: [],
        notes: data.notes || undefined,
      });
      toast.success("Deal created successfully");
      router.push(`/dashboard/deals/${id}`);
    } catch {
      toast.error("Failed to create deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/deals">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Deals
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Deal
        </h1>
        <p className="text-muted-foreground mt-1">
          Create a new opportunity in your pipeline
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Deal Title</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="e.g. FHIR API Platform - CVS Health"
          />
          {errors.title && (
            <p className="text-sm text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accountId">Account</Label>
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
          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Select
              value={watch("stage")}
              onValueChange={(v) => setValue("stage", v as DealStage)}
            >
              <SelectTrigger id="stage" className="w-full">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DEAL_STAGES) as DealStage[]).map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {DEAL_STAGES[stage]?.label || stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="value">Value ($)</Label>
            <Input
              id="value"
              type="number"
              {...register("value", { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.value && (
              <p className="text-sm text-destructive">
                {errors.value.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="probability">Probability (%)</Label>
            <Input
              id="probability"
              type="number"
              {...register("probability", { valueAsNumber: true })}
              placeholder="10"
              min={0}
              max={100}
            />
            {errors.probability && (
              <p className="text-sm text-destructive">
                {errors.probability.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              {...register("expectedCloseDate")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Products</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Select 1stUp Health products for this deal
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FIRSTUP_HEALTH_PRODUCTS.map((product) => (
              <div
                key={product}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <Checkbox
                  id={`product-${product}`}
                  checked={products?.includes(product) ?? false}
                  onCheckedChange={() => toggleProduct(product)}
                />
                <Label
                  htmlFor={`product-${product}`}
                  className="cursor-pointer flex-1 text-sm font-normal"
                >
                  {product}
                </Label>
              </div>
            ))}
          </div>
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
            {isSubmitting ? "Creating..." : "Create Deal"}
          </Button>
          <Link href="/dashboard/deals">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
