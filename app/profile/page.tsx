"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { LoadingState } from "@/components/states/LoadingState";
import { GOAL_DEFINITIONS } from "@/lib/skincare/goals";
import { ALIAS_RECORDS } from "@/lib/skincare/ingredient-aliases";
import { createId, saveProfile } from "@/lib/state/model";
import type { AllergyEntry, GoalId, PregnancyStatus, SkinType, UserProfile } from "@/lib/skincare/types";

export default function ProfilePage() {
  const { ready, data, update } = useApp();
  const [customTerm, setCustomTerm] = useState("");
  if (!ready) return <LoadingState />;
  const profile = data.profile;
  if (!profile) {
    return (
      <div>
        <h1 className="display text-4xl">Profile</h1>
        <p className="mt-3 text-sm text-muted">Finish setup to store preferences on this device.</p>
        <a href="/onboarding" className="mt-4 inline-block border border-line px-3 py-2 text-sm">Start setup</a>
      </div>
    );
  }

  function patch(partial: Partial<UserProfile>) {
    update((current) => (current.profile ? saveProfile(current, { ...current.profile, ...partial, updatedAt: new Date().toISOString() }) : current));
  }

  function addAllergy(kind: AllergyEntry["kind"]) {
    const record = ALIAS_RECORDS.find((item) => item.name.toLowerCase() === customTerm.trim().toLowerCase() || item.id === customTerm.trim());
    const entry: AllergyEntry = {
      id: createId("allergy"),
      kind,
      label: record?.name ?? customTerm.trim(),
      ingredientIds: record ? [record.id] : [],
      customTerms: record ? [] : [customTerm.trim()],
      severity: kind === "confirmed" ? "moderate" : "mild",
    };
    if (!entry.label) return;
    patch({ allergies: [...profile!.allergies, entry] });
    setCustomTerm("");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="kicker">Preferences</p>
      <h1 className="display mt-2 text-4xl">Profile</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Name, optional
          <input className="field mt-1" value={profile.displayName ?? ""} onChange={(event) => patch({ displayName: event.target.value || undefined })} />
        </label>
        <label className="text-sm">
          Skin type
          <select className="field mt-1" value={profile.skinType} onChange={(event) => patch({ skinType: event.target.value as SkinType })}>
            {["oily", "dry", "combination", "normal", "uncertain"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Sensitivity
          <select className="field mt-1" value={profile.sensitivity} onChange={(event) => patch({ sensitivity: event.target.value as UserProfile["sensitivity"] })}>
            {["low", "moderate", "high", "unknown"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Outdoor time
          <select className="field mt-1" value={profile.outdoorExposure} onChange={(event) => patch({ outdoorExposure: event.target.value as UserProfile["outdoorExposure"] })}>
            {["minimal", "commute", "extended", "variable"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Pregnancy or trying to conceive
          <select className="field mt-1" value={profile.pregnancyStatus} onChange={(event) => patch({ pregnancyStatus: event.target.value as PregnancyStatus })}>
            <option value="prefer-not">Prefer not to say</option>
            <option value="not-applicable">Not applicable</option>
            <option value="pregnant">Pregnant</option>
            <option value="trying">Trying to conceive</option>
            <option value="breastfeeding">Breastfeeding</option>
          </select>
        </label>
        <label className="text-sm">
          Morning time
          <input className="field mt-1" type="time" value={profile.morningTime ?? ""} onChange={(event) => patch({ morningTime: event.target.value })} />
        </label>
      </div>
      <label className="mt-4 flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={profile.needsProfessionalCare} onChange={(event) => patch({ needsProfessionalCare: event.target.checked })} />
        Ask for clinician guidance. Do not turn my shelf into a treatment plan.
      </label>
      <label className="mt-4 block text-sm">
        Optional note from a dermatologist. This is stored locally and is not a prescription.
        <textarea className="field mt-1" value={profile.dermatologistGuidance ?? ""} onChange={(event) => patch({ dermatologistGuidance: event.target.value })} />
      </label>
      <h2 className="mt-8 text-lg">Goals</h2>
      <div className="mt-3 grid gap-2">
        {GOAL_DEFINITIONS.map((goal) => {
          const selected = profile.goals.some((item) => item.id === goal.id);
          return (
            <label key={goal.id} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected}
                onChange={(event) => {
                  const next: GoalId[] = event.target.checked
                    ? [...profile.goals.map((item) => item.id), goal.id]
                    : profile.goals.map((item) => item.id).filter((id) => id !== goal.id);
                  patch({ goals: next.map((id, index) => ({ id, priority: index + 1 })) });
                }}
              />
              {goal.label}
            </label>
          );
        })}
      </div>
      <h2 className="mt-8 text-lg">Allergies and sensitivities</h2>
      <p className="mt-2 text-sm text-muted">Short custom words can over-match. Confirmed entries block products. Suspected entries are withheld, not declared allergies.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input className="field max-w-xs" value={customTerm} onChange={(event) => setCustomTerm(event.target.value)} placeholder="Fragrance or shea butter" aria-label="Allergy term" />
        <button type="button" className="border border-line px-3 text-sm" onClick={() => addAllergy("confirmed")}>Confirmed</button>
        <button type="button" className="border border-line px-3 text-sm" onClick={() => addAllergy("suspected")}>Suspected</button>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {profile.allergies.map((allergy) => (
          <li key={allergy.id} className="flex items-center justify-between gap-3 border-b border-line py-2">
            <span>{allergy.label} · {allergy.kind}</span>
            <button type="button" className="text-muted" onClick={() => patch({ allergies: profile.allergies.filter((item) => item.id !== allergy.id) })}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
