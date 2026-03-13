import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DEAL_STAGES, ACCOUNT_STAGES, type DealStage, type AccountStage } from "@/lib/db/schemas";

interface StatusBadgeProps {
  stage: string;
  type?: "deal" | "account";
  className?: string;
}

const stageColors: Record<string, string> = {
  // Deal stages
  discovery: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  demo: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  poc: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  proposal: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  negotiation: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  closed_won: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  closed_lost: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  // Account stages
  prospect: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  qualified: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  contract: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  customer: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  churned: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

export function StatusBadge({ stage, type = "deal", className }: StatusBadgeProps) {
  const stageInfo = type === "deal"
    ? DEAL_STAGES[stage as DealStage]
    : ACCOUNT_STAGES[stage as AccountStage];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        stageColors[stage] || "bg-gray-100 text-gray-700",
        className
      )}
    >
      {stageInfo?.label || stage}
    </Badge>
  );
}
