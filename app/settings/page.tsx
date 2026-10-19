"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/states/ConfirmationDialog";
import { LoadingState } from "@/components/states/LoadingState";
import { useApp } from "@/components/providers/AppProvider";
import { serializeExport } from "@/lib/state/model";

export default function SettingsPage() {
  const { ready, data, update, demo, enterDemo, exitDemo, resetDemo, deleteAll, setTheme } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  if (!ready) return <LoadingState />;

  function download() {
    const blob = new Blob([serializeExport(data, new Date().toISOString())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = demo ? "celestcare-demo-export.json" : "celestcare-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="kicker">Device</p>
      <h1 className="display mt-2 text-4xl">Settings</h1>
      <div className="mt-6 grid gap-4">
        <label className="text-sm">
          Appearance
          <select className="field mt-1" value={data.settings.theme} onChange={(event) => setTheme(event.target.value as typeof data.settings.theme)}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </label>
        <label className="text-sm">
          Temperature
          <select
            className="field mt-1"
            value={data.settings.temperatureUnit}
            onChange={(event) =>
              update((current) => ({
                ...current,
                settings: { ...current.settings, temperatureUnit: event.target.value as "c" | "f" },
              }))
            }
          >
            <option value="c">Celsius</option>
            <option value="f">Fahrenheit</option>
          </select>
        </label>
        {demo ? (
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={data.settings.useDemoWeather}
              onChange={(event) =>
                update((current) => ({
                  ...current,
                  settings: { ...current.settings, useDemoWeather: event.target.checked },
                }))
              }
            />
            Use the illustrative weather scenario for the demo routine. Live weather on the weather page stays separate.
          </label>
        ) : null}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="border border-line px-3 py-2 text-sm" onClick={download}>Export data</button>
        {demo ? (
          <>
            <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => void resetDemo()}>Reset demo</button>
            <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => void exitDemo().then(() => router.push("/"))}>Leave demo</button>
          </>
        ) : (
          <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => void enterDemo().then(() => router.push("/"))}>Explore demo shelf</button>
        )}
        <button type="button" className="border border-block px-3 py-2 text-sm text-block" onClick={() => setConfirmDelete(true)}>Delete data on this device</button>
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">
        There is no account. Export before you delete. Photos and journals are included in the file and should be treated as private. No analytics are installed.
      </p>
      <ConfirmationDialog
        open={confirmDelete}
        title={demo ? "Reset the demo shelf?" : "Delete your CelestCare data?"}
        body={demo ? "The illustrative shelf will be replaced with a fresh copy. Your personal shelf is stored separately and is not deleted." : "Profile, products, journal notes, photos, and routine history on this device will be removed."}
        confirmLabel={demo ? "Reset demo" : "Delete everything"}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          void deleteAll().then(() => {
            setConfirmDelete(false);
            router.push("/");
          });
        }}
      />
    </div>
  );
}
