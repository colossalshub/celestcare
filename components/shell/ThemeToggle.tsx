"use client";

import { Monitor, Moon, SunMedium } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

const ORDER = ["dark", "light", "system"] as const;

export function ThemeToggle() {
  const { data, setTheme } = useApp();
  const theme = data.settings.theme;
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length] ?? "dark";
  const Icon = theme === "light" ? SunMedium : theme === "system" ? Monitor : Moon;
  const label = theme === "light" ? "Light theme" : theme === "system" ? "System theme" : "Dark theme";
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 border border-line px-3 py-2 text-sm text-ink"
      aria-label={`${label}. Activate to change theme.`}
      onClick={() => setTheme(next)}
    >
      <Icon aria-hidden size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
