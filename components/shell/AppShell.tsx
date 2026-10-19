"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { MobileNavigation } from "@/components/shell/MobileNavigation";
import { SidebarNavigation } from "@/components/shell/SidebarNavigation";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { OfflineIndicator } from "@/components/states/OfflineIndicator";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { demo, ready } = useApp();
  return (
    <div className="min-h-screen bg-bg text-ink">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <SidebarNavigation />
        <div className="min-w-0">
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-8">
            <div className="lg:hidden">
              <p className="display text-xl">CelestCare</p>
            </div>
            <p className="hidden text-sm text-muted lg:block">The minimum effective routine, from the shelf you already have.</p>
            <div className="flex items-center gap-2">
              <Link href="/settings" className="hidden text-sm text-muted hover:text-ink sm:inline">
                Settings
              </Link>
              {ready ? <ThemeToggle /> : null}
            </div>
          </header>
          {demo ? (
            <div className="border-b border-line bg-soft px-4 py-2 text-sm text-ink lg:px-8" role="status">
              Demo shelf. These products are illustrative and are stored apart from your own inventory.
            </div>
          ) : null}
          <OfflineIndicator />
          <main id="content" className="px-4 pb-28 pt-6 lg:px-8 lg:pb-16 lg:pt-8">
            {children}
          </main>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}
