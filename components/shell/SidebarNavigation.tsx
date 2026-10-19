"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CloudSun,
  FlaskConical,
  Library,
  ListOrdered,
  NotebookPen,
  SunMedium,
  Target,
  UserRound,
  Waypoints,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Today", icon: SunMedium },
  { href: "/shelf", label: "Shelf", icon: Library },
  { href: "/routine", label: "Routine", icon: ListOrdered },
  { href: "/ingredients", label: "Ingredients", icon: FlaskConical },
  { href: "/compatibility", label: "Compatibility", icon: Waypoints },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/sources", label: "Sources", icon: BookOpen },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-line bg-surface px-4 py-6 lg:flex">
      <Link href="/" className="px-2">
        <p className="kicker">Skincare</p>
        <p className="display mt-2 text-[1.7rem]">CelestCare</p>
      </Link>
      <nav aria-label="Primary" className="mt-8 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 border-l-2 px-3 py-2 text-sm ${
                active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Icon aria-hidden size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-auto px-3 pb-4 pt-8 text-xs leading-5 text-muted">Educational organization. Not a dermatologist.</p>
    </aside>
  );
}
