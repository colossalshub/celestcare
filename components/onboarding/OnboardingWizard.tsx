"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { GOAL_DEFINITIONS } from "@/lib/skincare/goals";
import { ALIAS_RECORDS } from "@/lib/skincare/ingredient-aliases";
import { createId, saveProfile } from "@/lib/state/model";
import type { AllergyEntry, GoalId, SkinType, UserProfile } from "@/lib/skincare/types";

const STEPS = ["Welcome", "Skin", "Goals", "Allergies", "Shelf", "Weather", "Review"];

export function OnboardingWizard() {
  const { data, update, demo } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(data.onboardingStep || 0);
  const [skinType, setSkinType] = useState<SkinType>(data.profile?.skinType ?? "uncertain");
  const [sensitivity, setSensitivity] = useState<UserProfile["sensitivity"]>(data.profile?.sensitivity ?? "unknown");
  const [goals, setGoals] = useState<GoalId[]>(data.profile?.goals.map((goal) => goal.id) ?? ["maintenance"]);
  const [allergyId, setAllergyId] = useState("fragrance");
  const [professional, setProfessional] = useState(false);
  const [exposure, setExposure] = useState<UserProfile["outdoorExposure"]>(data.profile?.outdoorExposure ?? "commute");

  function persist(partial: Partial<UserProfile>, nextStep: number, complete = false) {
    update((current) => {
      const profile: UserProfile = {
        id: current.profile?.id ?? createId("profile"),
        skinType,
        sensitivity,
        concerns: current.profile?.concerns ?? [],
        goals: goals.map((id, index) => ({ id, priority: index + 1 })),
        allergies: current.profile?.allergies ?? [],
        fragranceSensitive: (current.profile?.allergies ?? []).some((item) => item.ingredientIds.includes("fragrance")),
        routineLength: "standard",
        outdoorExposure: exposure,
        pregnancyStatus: current.profile?.pregnancyStatus ?? "prefer-not",
        needsProfessionalCare: professional,
        professionalCareNote: professional
          ? "You asked for clinician guidance. CelestCare will keep the routine conservative and will not treat a medical condition."
          : undefined,
        createdAt: current.profile?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...partial,
      };
      return {
        ...saveProfile(current, profile),
        onboardingStep: nextStep,
        onboardingComplete: complete,
      };
    });
  }

  function addAllergy() {
    const record = ALIAS_RECORDS.find((item) => item.id === allergyId);
    if (!record) return;
    const entry: AllergyEntry = {
      id: createId("allergy"),
      kind: "confirmed",
      label: record.name,
      ingredientIds: [record.id],
      customTerms: [],
      severity: "moderate",
    };
    update((current) => {
      const profile = current.profile;
      if (!profile) return current;
      if (profile.allergies.some((item) => item.ingredientIds.includes(record.id))) return current;
      return saveProfile(current, { ...profile, allergies: [...profile.allergies, entry], updatedAt: new Date().toISOString() });
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="kicker">Start</p>
      <ol className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-muted">
        {STEPS.map((label, index) => (
          <li key={label} className={index === step ? "text-ink" : ""}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <div className="mt-8">
        {step === 0 ? (
          <section>
            <h1 className="display text-4xl">A routine from what you own.</h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              CelestCare organizes your products, checks recorded allergies, and explains why a step is included. It is not a dermatologist and it does not require an account. Your shelf stays in this browser unless you export it.
            </p>
          </section>
        ) : null}
        {step === 1 ? (
          <section className="grid gap-4">
            <h1 className="display text-4xl">Skin and tolerance</h1>
            <label className="text-sm">
              Skin type
              <select className="field mt-1" value={skinType} onChange={(event) => setSkinType(event.target.value as SkinType)}>
                {["oily", "dry", "combination", "normal", "uncertain"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              How reactive products usually feel
              <select className="field mt-1" value={sensitivity} onChange={(event) => setSensitivity(event.target.value as UserProfile["sensitivity"])}>
                {["low", "moderate", "high", "unknown"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Typical time outdoors
              <select className="field mt-1" value={exposure} onChange={(event) => setExposure(event.target.value as UserProfile["outdoorExposure"])}>
                {["minimal", "commute", "extended", "variable"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={professional} onChange={(event) => setProfessional(event.target.checked)} />
              I have a diagnosed skin condition, significant inflammation, a history of severe reactions, or complex medication concerns. Show clinician guidance instead of a treatment plan.
            </label>
          </section>
        ) : null}
        {step === 2 ? (
          <section>
            <h1 className="display text-4xl">Goals</h1>
            <p className="mt-3 text-sm text-muted">Choose a few. Order is priority.</p>
            <div className="mt-4 grid gap-2">
              {GOAL_DEFINITIONS.map((goal) => (
                <label key={goal.id} className="flex items-start gap-2 border border-line px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={goals.includes(goal.id)}
                    onChange={(event) =>
                      setGoals((current) =>
                        event.target.checked ? [...current, goal.id] : current.filter((id) => id !== goal.id),
                      )
                    }
                  />
                  <span>
                    <span className="block">{goal.label}</span>
                    <span className="text-muted">{goal.expectation}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ) : null}
        {step === 3 ? (
          <section>
            <h1 className="display text-4xl">Allergies</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Confirmed allergies block matching products. Leave this empty if you are not sure. A missing ingredient list will not be treated as safe.
            </p>
            <div className="mt-4 flex gap-2">
              <select className="field" value={allergyId} onChange={(event) => setAllergyId(event.target.value)}>
                {ALIAS_RECORDS.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.name}
                  </option>
                ))}
              </select>
              <button type="button" className="border border-line px-3 text-sm" onClick={addAllergy}>
                Add
              </button>
            </div>
            <ul className="mt-4 text-sm">
              {(data.profile?.allergies ?? []).map((allergy) => (
                <li key={allergy.id}>{allergy.label}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {step === 4 ? (
          <section>
            <h1 className="display text-4xl">Your shelf</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              You can add products after this. The routine only uses products you enter. {data.products.length} saved so far.
            </p>
            <button type="button" className="mt-4 border border-line px-3 py-2 text-sm" onClick={() => router.push("/shelf/new")}>
              Add a product
            </button>
          </section>
        ) : null}
        {step === 5 ? (
          <section>
            <h1 className="display text-4xl">Weather is optional</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Location is used only to request a forecast from Open-Meteo. You can skip it and type a city later. The app works without it.
            </p>
            <button type="button" className="mt-4 border border-line px-3 py-2 text-sm" onClick={() => router.push("/weather")}>
              Set a city
            </button>
          </section>
        ) : null}
        {step === 6 ? (
          <section>
            <h1 className="display text-4xl">Your first routine</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              If details are missing, the routine stays short and says what is unknown. {demo ? "You are still in the demo shelf." : "This will use your own shelf."}
            </p>
          </section>
        ) : null}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <button type="button" className="text-sm text-muted" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
          Back
        </button>
        {step < 6 ? (
          <button
            type="button"
            className="bg-ink px-4 py-2 text-sm text-bg"
            onClick={() => {
              const next = step + 1;
              persist({}, next, false);
              setStep(next);
            }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="bg-ink px-4 py-2 text-sm text-bg"
            onClick={() => {
              persist({}, 7, true);
              router.push("/");
            }}
          >
            See today
          </button>
        )}
      </div>
      <button
        type="button"
        className="mt-4 text-sm text-muted"
        onClick={() => {
          persist({ skinType: "uncertain", sensitivity: "unknown" }, 7, true);
          router.push("/");
        }}
      >
        Skip and use a conservative profile
      </button>
    </div>
  );
}
