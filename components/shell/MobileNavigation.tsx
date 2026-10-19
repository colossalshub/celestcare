"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Library, ListOrdered, SunMedium, Waypoints, Menu } from "lucide-react";
import { NAV_ITEMS } from "@/components/shell/SidebarNavigation";

const PRIMARY = [
  { href: "/", label: "Today", icon: SunMedium },
  { href: "/shelf", label: "Shelf", icon: Library },
  { href: "/routine", label: "Routine", icon: ListOrdered },
  { href: "/compatibility", label: "Map", icon: Waypoints },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface px-1 py-2 lg:hidden"
      >
        {PRIMARY.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 px-1 py-1 text-[11px] ${active ? "text-ink" : "text-muted"}`}
            >
              <Icon aria-hidden size={18} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          className="flex flex-col items-center gap-1 px-1 py-1 text-[11px] text-muted"
          aria-expanded={open}
          aria-controls="more-nav"
          onClick={() => setOpen(true)}
        >
          <Menu aria-hidden size={18} />
          More
        </button>
      </nav>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)}>
          <div
            id="more-nav"
            role="dialog"
            aria-modal="true"
            aria-label="More sections"
            className="absolute inset-x-0 bottom-0 border-t border-line bg-surface p-4 pb-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-line px-3 py-3 text-sm"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/settings" className="border border-line px-3 py-3 text-sm" onClick={() => setOpen(false)}>
                Settings
              </Link>
            </div>
            <button type="button" className="mt-3 text-sm text-muted" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
