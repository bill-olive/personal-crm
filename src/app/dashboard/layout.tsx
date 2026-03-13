"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar - fixed on left */}
      <div className="hidden md:block fixed left-0 top-0 z-40 h-screen transition-[width] duration-300 ease-in-out">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Spacer for desktop sidebar */}
      <div
        className="hidden md:block shrink-0 transition-[width] duration-300 ease-in-out"
        style={{ width: sidebarCollapsed ? 72 : 256 }}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="p-0 w-72"
            showCloseButton={true}
          >
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
