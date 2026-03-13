"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Bot,
  Plus,
  Settings,
  LayoutDashboard,
  HandshakeIcon,
  FileText,
  Zap,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const QUICK_ACTIONS = [
  { label: "Create Account", href: "/dashboard/accounts/new", icon: Building2 },
  { label: "Create Agent", href: "/dashboard/agents/new", icon: Bot },
  { label: "Log Activity", href: "/dashboard/activities", icon: Zap },
  { label: "New Deal", href: "/dashboard/deals/new", icon: HandshakeIcon },
];

const ACCOUNTS = [
  { id: "1", name: "CVS Health" },
  { id: "2", name: "UnitedHealth Group" },
  { id: "3", name: "Anthem" },
  { id: "4", name: "Humana" },
  { id: "5", name: "Cigna" },
];

const AGENTS = [
  { id: "1", name: "CVS Account Researcher" },
  { id: "2", name: "Meeting Prep Agent" },
  { id: "3", name: "Competitive Monitor" },
];

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Deals", href: "/dashboard/deals", icon: HandshakeIcon },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Accounts">
          {ACCOUNTS.map((account) => (
            <CommandItem
              key={account.id}
              value={account.name}
              onSelect={() => handleSelect(`/dashboard/accounts/${account.id}`)}
            >
              <Building2 className="size-4" />
              {account.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Agents">
          {AGENTS.map((agent) => (
            <CommandItem
              key={agent.id}
              value={agent.name}
              onSelect={() => handleSelect(`/dashboard/agents/${agent.id}`)}
            >
              <Bot className="size-4" />
              {agent.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
