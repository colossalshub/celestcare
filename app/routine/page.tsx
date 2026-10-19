"use client";

import { DailyRoutine } from "@/components/routine/DailyRoutine";
import { usePlan } from "@/components/routine/usePlan";
import { useApp } from "@/components/providers/AppProvider";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import Link from "next/link";
import { clearAdherence, createId, localDateKey, recordAdherence } from "@/lib/state/model";
import type { PlannedStep, RoutineProfile } from "@/lib/skincare/types";

const MODES: RoutineProfile[] = ["minimal", "balanced", "goal-focused", "sensitive", "recovery"];

export default function RoutinePage() {
  const { ready, data, now, update } = useApp();
  const { plan } = usePlan();
  if (!ready) return <LoadingState />;
  if (!data.profile || !plan) {
    return <EmptyState title="Set up a profile first." body="The routine needs a skin preference, even if you leave most of it uncertain." action={<Link href="/onboarding" className="border border-line px-3 py-2 text-sm">Open setup</Link>} />;
  }
  const dateKey = localDateKey(now);
  const adherence = data.adherence.filter((event) => event.date === dateKey);
  const eligibleIds = new Set([...plan.morning, ...plan.evening].map((step) => step.productId));
  const addable = data.products.filter((product) => product.status === "in-use" && !eligibleIds.has(product.id) && !plan.excluded.some((item) => item.productId === product.id && (item.level === "BLOCK" || item.level === "HIGH_CAUTION")));

  function mark(step: PlannedStep, action: "completed" | "skipped") {
    update((current) => {
      const existing = current.adherence.find((event) => event.date === dateKey && event.period === step.period && event.productId === step.productId);
      if (existing?.action === action) return clearAdherence(current, dateKey, step.period, step.productId);
      return recordAdherence(current, { id: createId("adh"), date: dateKey, period: step.period, productId: step.productId, action, at: new Date().toISOString() });
    });
  }

  function hide(step: PlannedStep) {
    update((current) => ({
      ...current,
      overrides: {
        hiddenProductIds: [...new Set([...current.overrides.hiddenProductIds, step.productId])],
        forcedProductIds: current.overrides.forcedProductIds.filter((id) => id !== step.productId),
      },
    }));
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="kicker">Routine studio</p>
      <h1 className="display mt-2 text-4xl">Today&apos;s plan</h1>
      <label className="mt-4 block max-w-xs text-sm">
        Routine length
        <select
          className="field mt-1"
          value={data.settings.routineMode}
          onChange={(event) =>
            update((current) => ({
              ...current,
              settings: { ...current.settings, routineMode: event.target.value as RoutineProfile },
            }))
          }
        >
          {MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Requested {plan.modeRequested}, using {plan.modeUsed}. Safety rules stay on in every mode. Removing a step here does not make a blocked product eligible.
      </p>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <DailyRoutine title="Morning" steps={plan.morning} adherence={adherence.filter((event) => event.period === "am")} onComplete={(step) => mark(step, "completed")} onSkip={(step) => mark(step, "skipped")} onRemove={hide} />
        <DailyRoutine title="Evening" steps={plan.evening} adherence={adherence.filter((event) => event.period === "pm")} onComplete={(step) => mark(step, "completed")} onSkip={(step) => mark(step, "skipped")} onRemove={hide} />
      </div>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg">Not scheduled</h2>
          <ul className="mt-3 space-y-3 text-sm leading-6">
            {plan.excluded.filter((item) => item.code !== "paused-or-finished").map((item) => (
              <li key={`${item.productId}-${item.code}`}>
                <span className="text-xs uppercase tracking-[0.12em] text-muted">{item.level}</span>
                <p>{item.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg">Add an eligible product</h2>
          {addable.length === 0 ? <p className="mt-3 text-sm text-muted">No other eligible products are waiting.</p> : null}
          <ul className="mt-3 space-y-2">
            {addable.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  className="text-sm hover:text-accent"
                  onClick={() =>
                    update((current) => ({
                      ...current,
                      overrides: {
                        ...current.overrides,
                        forcedProductIds: [...new Set([...current.overrides.forcedProductIds, product.id])],
                        hiddenProductIds: current.overrides.hiddenProductIds.filter((id) => id !== product.id),
                      },
                    }))
                  }
                >
                  Add {product.name}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 text-sm text-muted"
            onClick={() => update((current) => ({ ...current, overrides: { hiddenProductIds: [], forcedProductIds: [] } }))}
          >
            Reset edits
          </button>
        </div>
      </section>
    </div>
  );
}
