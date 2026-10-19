"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { ConfirmationDialog } from "@/components/states/ConfirmationDialog";
import { addJournal, createId, deleteJournal, localDateKey } from "@/lib/state/model";
import type { JournalEntry } from "@/lib/skincare/types";

export function SkinJournal() {
  const { data, update, now } = useApp();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    comfort: "comfortable" as JournalEntry["comfort"],
    drynessOiliness: "balanced" as JournalEntry["drynessOiliness"],
    irritation: "none" as JournalEntry["irritation"],
    breakouts: "none" as JournalEntry["breakouts"],
    notes: "",
    emergencySymptoms: false,
    photoDataUrl: undefined as string | undefined,
  });

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_200_000) {
      setError("Photos over 1.2 MB are not stored. The note can still be saved.");
      return;
    }
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the photo."));
      reader.readAsDataURL(file);
    });
    setDraft((current) => ({ ...current, photoDataUrl: dataUrl }));
  }

  function save() {
    const entry: JournalEntry = {
      id: createId("journal"),
      date: localDateKey(now),
      ...draft,
      createdAt: now.toISOString(),
    };
    update((current) => addJournal(current, entry));
    setDraft({ ...draft, notes: "", photoDataUrl: undefined, emergencySymptoms: false });
    setError(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form
        className="border border-line p-4"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <h2 className="text-lg">Check-in</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          A weekly note is enough. Photos stay on this device and are observational, not measurements. CelestCare does not diagnose from pictures.
        </p>
        <div className="mt-4 grid gap-3">
          <Select label="Comfort" value={draft.comfort} options={["comfortable", "tight", "uncomfortable", "not-logged"]} onChange={(value) => setDraft({ ...draft, comfort: value as JournalEntry["comfort"] })} />
          <Select label="Dryness or oiliness" value={draft.drynessOiliness} options={["dry", "balanced", "oily", "not-logged"]} onChange={(value) => setDraft({ ...draft, drynessOiliness: value as JournalEntry["drynessOiliness"] })} />
          <Select label="Irritation" value={draft.irritation} options={["none", "mild", "moderate", "severe"]} onChange={(value) => setDraft({ ...draft, irritation: value as JournalEntry["irritation"] })} />
          <Select label="Breakouts" value={draft.breakouts} options={["none", "some", "many", "not-logged"]} onChange={(value) => setDraft({ ...draft, breakouts: value as JournalEntry["breakouts"] })} />
          <label className="text-sm">
            Notes
            <textarea className="field mt-1 min-h-24" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={draft.emergencySymptoms} onChange={(event) => setDraft({ ...draft, emergencySymptoms: event.target.checked })} />
            Breathing trouble, throat or tongue swelling, faintness, or a rapidly spreading reaction. This shows emergency guidance.
          </label>
          <label className="text-sm">
            Optional photo
            <input className="mt-1 block text-sm" type="file" accept="image/*" onChange={(event) => void onPhoto(event.target.files?.[0])} />
          </label>
          {error ? <p className="text-sm text-block">{error}</p> : null}
          <button type="submit" className="w-fit bg-ink px-4 py-2 text-sm text-bg">
            Save check-in
          </button>
        </div>
      </form>
      <ul className="space-y-4">
        {data.journal.length === 0 ? <li className="text-sm text-muted">No check-ins yet.</li> : null}
        {data.journal.map((entry) => (
          <li key={entry.id} className="border border-line p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm">{entry.date}</p>
              <button type="button" className="text-xs text-muted" onClick={() => setPendingDelete(entry.id)}>
                Delete
              </button>
            </div>
            <p className="mt-2 text-sm text-muted">
              Comfort {entry.comfort} · {entry.drynessOiliness} · irritation {entry.irritation} · breakouts {entry.breakouts}
            </p>
            {entry.notes ? <p className="mt-2 text-sm leading-6">{entry.notes}</p> : null}
            {entry.emergencySymptoms ? <p className="mt-2 text-sm text-block">Emergency symptoms were flagged on this entry.</p> : null}
            {entry.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.photoDataUrl} alt="Check-in photo stored on this device. Observational only." className="mt-3 max-h-48" />
            ) : null}
          </li>
        ))}
      </ul>
      <ConfirmationDialog
        open={pendingDelete != null}
        title="Delete this check-in?"
        body="The note and any photo in it will be removed from this device."
        confirmLabel="Delete"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) update((current) => deleteJournal(current, pendingDelete));
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="text-sm">
      {label}
      <select className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
