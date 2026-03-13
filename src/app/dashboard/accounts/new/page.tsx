"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/shared/page-header";
import {
  FIRSTUP_HEALTH_PRODUCTS,
  ACCOUNT_STAGES,
  type AccountStage,
  type HealthPlanType,
} from "@/lib/db/schemas";
import { createAccount } from "@/lib/actions/accounts";
import { useAuth } from "@/lib/auth/context";

const SIZE_OPTIONS = [
  { value: "startup", label: "Startup" },
  { value: "smb", label: "SMB" },
  { value: "mid_market", label: "Mid Market" },
  { value: "enterprise", label: "Enterprise" },
] as const;

const HEALTH_PLAN_OPTIONS: { value: HealthPlanType; label: string }[] = [
  { value: "commercial", label: "Commercial" },
  { value: "medicare", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
  { value: "dual_eligible", label: "Dual Eligible" },
  { value: "exchange", label: "Exchange" },
  { value: "other", label: "Other" },
];

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(["startup", "smb", "mid_market", "enterprise"]),
  healthPlanType: z.enum([
    "commercial",
    "medicare",
    "medicaid",
    "dual_eligible",
    "exchange",
    "other",
  ]).optional(),
  stage: z.enum([
    "prospect",
    "qualified",
    "poc",
    "contract",
    "customer",
    "churned",
  ]),
  annualValue: z.number().optional(),
  region: z.string().optional(),
  products: z.array(z.string()),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

export default function NewAccountPage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      domain: "",
      industry: "Healthcare",
      size: "enterprise",
      stage: "prospect",
      annualValue: undefined,
      region: "",
      products: [],
      notes: "",
    },
  });

  const productsValue = watch("products");

  const onSubmit = async (data: AccountFormData) => {
    const orgId = user?.uid ? `${user.uid}_org` : "demo-org";
    try {
      await createAccount(orgId, {
        name: data.name,
        domain: data.domain || undefined,
        industry: data.industry || "",
        size: data.size,
        healthPlanType: data.healthPlanType,
        stage: data.stage,
        annualValue:
          typeof data.annualValue === "number" && !Number.isNaN(data.annualValue)
            ? data.annualValue
            : undefined,
        region: data.region || undefined,
        products: data.products,
        notes: data.notes,
        ownerId: user?.uid || "unknown",
        tags: [],
      });
      toast.success("Account created");
      router.push("/dashboard/accounts");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/accounts">
          <Button variant="ghost" size="icon" aria-label="Back to accounts">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <PageHeader title="New Account" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Create a new healthcare payer account in your CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. CVS Health"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="e.g. cvshealth.com"
                  {...register("domain")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g. Healthcare"
                  {...register("industry")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="e.g. Northeast"
                  {...register("region")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select
                  value={watch("size")}
                  onValueChange={(v) =>
                    setValue("size", v as AccountFormData["size"])
                  }
                >
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthPlanType">Health Plan Type</Label>
                <Select
                  value={watch("healthPlanType") ?? ""}
                  onValueChange={(v) =>
                    setValue("healthPlanType", v as HealthPlanType)
                  }
                >
                  <SelectTrigger id="healthPlanType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEALTH_PLAN_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={watch("stage")}
                  onValueChange={(v) =>
                    setValue("stage", v as AccountStage)
                  }
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ACCOUNT_STAGES) as [AccountStage, { label: string }][]).map(
                      ([value, { label }]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualValue">Annual Value ($)</Label>
                <Input
                  id="annualValue"
                  type="number"
                  placeholder="e.g. 850000"
                  {...register("annualValue", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Products</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {FIRSTUP_HEALTH_PRODUCTS.map((product) => (
                  <div
                    key={product}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`product-${product}`}
                      checked={productsValue?.includes(product)}
                      onCheckedChange={(checked) => {
                        const current = productsValue || [];
                        if (checked) {
                          setValue("products", [...current, product]);
                        } else {
                          setValue(
                            "products",
                            current.filter((p) => p !== product)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`product-${product}`}
                      className="font-normal cursor-pointer"
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
                placeholder="Internal notes about this account..."
                className="min-h-[100px]"
                {...register("notes")}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/accounts")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
