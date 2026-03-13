"use client";

import {
  Bell,
  Bot,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckSquare,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NotificationType =
  | "agent_completed"
  | "deal_stage_changed"
  | "agent_failed"
  | "insight_generated"
  | "task_due";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  unread: boolean;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Account Research Agent completed",
    message: "Research brief ready for CVS Health",
    time: "2 min ago",
    type: "agent_completed",
    unread: true,
  },
  {
    id: "2",
    title: "CVS Health deal moved to POC",
    message: "Deal stage updated from Demo to POC",
    time: "15 min ago",
    type: "deal_stage_changed",
    unread: true,
  },
  {
    id: "3",
    title: "Meeting Prep Agent failed",
    message: "Agent run encountered an error",
    time: "1 hour ago",
    type: "agent_failed",
    unread: true,
  },
  {
    id: "4",
    title: "New insight generated for Anthem",
    message: "Competitive positioning analysis available",
    time: "2 hours ago",
    type: "insight_generated",
    unread: true,
  },
  {
    id: "5",
    title: "Task due: Follow up with UnitedHealth",
    message: "Scheduled follow-up call due today",
    time: "3 hours ago",
    type: "task_due",
    unread: true,
  },
];

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  agent_completed: Bot,
  deal_stage_changed: TrendingUp,
  agent_failed: AlertCircle,
  insight_generated: Lightbulb,
  task_due: CheckSquare,
};

export function NotificationsPanel() {
  return (
    <Popover>
      <PopoverTrigger aria-label="Notifications">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <span
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <Check className="size-3.5" />
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[320px]">
          <div className="p-2">
            {NOTIFICATIONS.map((notification) => {
              const Icon = TYPE_ICONS[notification.type];
              const isFailed = notification.type === "agent_failed";
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50",
                    notification.unread && "bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      isFailed
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isFailed && "text-destructive"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                  {notification.unread && (
                    <span
                      className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sm"
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
