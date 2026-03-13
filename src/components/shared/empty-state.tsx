import { Button } from "@/components/ui/button";
import { LucideIcon, Inbox, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href} className="mt-4">
            <Button className="gap-2">
              <Plus className="size-4" />
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button onClick={action.onClick} className="mt-4 gap-2">
            <Plus className="size-4" />
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
