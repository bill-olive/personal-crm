"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Building2,
  Users,
  HandshakeIcon,
  CalendarCheck,
  FileText,
  Lightbulb,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: Building2 },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/deals", label: "Deals", icon: HandshakeIcon },
];

const activityNavItems = [
  { href: "/dashboard/activities", label: "Activities", icon: CalendarCheck },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/insights", label: "Insights", icon: Lightbulb },
];

const aiNavItems = [
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const isActive =
      pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          "hover:bg-muted/80 hover:text-foreground",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-primary/10 text-primary dark:bg-primary/15"
            : "text-muted-foreground"
        )}
      >
        <Icon className="size-5 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  }) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </div>
  );

  return (
    <aside
      className={cn(
        "group flex h-full flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[256px]"
      )}
    >
      {/* Logo section */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-0" : "gap-3 px-4"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm">
          <Heart className="size-5" />
        </div>
        {!collapsed && (
          <span className="truncate text-base font-semibold text-foreground">
            1stUp Health CRM
          </span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          <NavSection title="Main" items={mainNavItems} />
          <Separator />
          <NavSection title="Activity" items={activityNavItems} />
          <Separator />
          <NavSection title="AI" items={aiNavItems} />
        </div>
      </ScrollArea>

      {/* Bottom section */}
      <div className="shrink-0 space-y-1 border-t border-border p-3">
        <NavLink
          href="/dashboard/settings"
          label="Settings"
          icon={Settings}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mt-2 w-full justify-center"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-5" />
          ) : (
            <ChevronLeft className="size-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}
