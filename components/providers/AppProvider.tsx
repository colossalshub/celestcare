"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createDemoData } from "@/lib/demo/seed";
import { deleteState, ensureState, saveState, type DatabaseName } from "@/lib/persistence/db";
import { emptyData, type AppData } from "@/lib/state/model";

const DB_KEY = "celestcare-db";
const THEME_KEY = "celestcare-theme";

interface AppContextValue {
  ready: boolean;
  error: string | null;
  demo: boolean;
  data: AppData;
  now: Date;
  resolvedTheme: "dark" | "light";
  update: (recipe: (current: AppData) => AppData) => void;
  enterDemo: () => Promise<void>;
  exitDemo: () => Promise<void>;
  resetDemo: () => Promise<void>;
  deleteAll: () => Promise<void>;
  setTheme: (theme: AppData["settings"]["theme"]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function databaseName(): DatabaseName {
  if (typeof window === "undefined") return "celestcare";
  return window.localStorage.getItem(DB_KEY) === "celestcare-demo" ? "celestcare-demo" : "celestcare";
}

function applyTheme(theme: AppData["settings"]["theme"]) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  window.localStorage.setItem(THEME_KEY, theme);
  return dark ? "dark" : "light";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [data, setData] = useState<AppData>(emptyData());
  const [now, setNow] = useState(() => new Date());
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    let cancelled = false;
    const name = databaseName();
    ensureState(name, name === "celestcare-demo" ? createDemoData(new Date()) : undefined)
      .then((loaded) => {
        if (cancelled) return;
        setData(loaded);
        setDemo(name === "celestcare-demo");
        setResolvedTheme(applyTheme(loaded.settings.theme));
        setReady(true);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "The local database could not be opened.");
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (data.settings.theme === "system") setResolvedTheme(applyTheme("system"));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [data.settings.theme, ready]);

  const update = useCallback(
    (recipe: (current: AppData) => AppData) => {
      setData((current) => {
        const next = recipe(current);
        const name = databaseName();
        void saveState(name, next).catch((reason: unknown) => {
          setError(reason instanceof Error ? reason.message : "Changes could not be saved on this device.");
        });
        return next;
      });
    },
    [],
  );

  const enterDemo = useCallback(async () => {
    window.localStorage.setItem(DB_KEY, "celestcare-demo");
    const seeded = await ensureState("celestcare-demo", createDemoData(new Date()));
    setDemo(true);
    setData(seeded);
    setResolvedTheme(applyTheme(seeded.settings.theme));
  }, []);

  const exitDemo = useCallback(async () => {
    window.localStorage.setItem(DB_KEY, "celestcare");
    const user = await ensureState("celestcare");
    setDemo(false);
    setData(user);
    setResolvedTheme(applyTheme(user.settings.theme));
  }, []);

  const resetDemo = useCallback(async () => {
    const fresh = createDemoData(new Date());
    await saveState("celestcare-demo", fresh);
    window.localStorage.setItem(DB_KEY, "celestcare-demo");
    setDemo(true);
    setData(fresh);
  }, []);

  const deleteAll = useCallback(async () => {
    const name = databaseName();
    await deleteState(name);
    const fresh = name === "celestcare-demo" ? createDemoData(new Date()) : emptyData();
    if (name === "celestcare-demo") await saveState(name, fresh);
    setData(fresh);
  }, []);

  const setTheme = useCallback(
    (theme: AppData["settings"]["theme"]) => {
      setResolvedTheme(applyTheme(theme));
      update((current) => ({ ...current, settings: { ...current.settings, theme } }));
    },
    [update],
  );

  const value = useMemo(
    () => ({
      ready,
      error,
      demo,
      data,
      now,
      resolvedTheme,
      update,
      enterDemo,
      exitDemo,
      resetDemo,
      deleteAll,
      setTheme,
    }),
    [ready, error, demo, data, now, resolvedTheme, update, enterDemo, exitDemo, resetDemo, deleteAll, setTheme],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
