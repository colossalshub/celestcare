"use client";

import Link from "next/link";
import { DailyRoutine } from "@/components/routine/DailyRoutine";
import { usePlan } from "@/components/routine/usePlan";
import { SafetyAlert } from "@/components/safety/SafetyAlert";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { WeatherSummary } from "@/components/weather/WeatherSummary";
import { useApp } from "@/components/providers/AppProvider";
import { clearAdherence, createId, localDateKey, recordAdherence } from "@/lib/state/model";
import type { PlannedStep } from "@/lib/skincare/types";

function greeting(date: Date, name?: string): string {
  const hour = date.getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${hello}, ${name}` : hello;
}

export default function TodayPage() {
  const { ready, error, data, now, demo, enterDemo } = useApp();
  const { plan, weather, demoScenario } = usePlan();
  if (!ready) return <LoadingState />;
  if (error) return <ErrorState body={error} />;
  if (!data.onboardingComplete || !data.profile || !plan) {
    return (
      <EmptyState
        title="Start with the products you already own."
        body="CelestCare builds a short morning and evening routine from your shelf, your recorded allergies, and the evidence it can actually cite. You can explore a labeled demo shelf first."
        action={
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding" className="bg-ink px-4 py-2 text-sm text-bg">
              Set up your profile
            </Link>
            <button type="button" className="border border-line px-4 py-2 text-sm" onClick={() => void enterDemo()}>
              Explore the demo shelf
            </button>
          </div>
        }
      />
    );
  }

  const dateKey = localDateKey(now);
  const adherence = data.adherence.filter((event) => event.date === dateKey);
  const hour = now.getHours();
  const ordered = hour < 16 ? [...plan.morning, ...plan.evening] : [...plan.evening, ...plan.morning];
  const next = ordered.find(
    (step) => !adherence.some((event) => event.productId === step.productId && event.period === step.period && event.action === "completed"),
  );
  const inUse = data.products.filter((product) => product.status === "in-use");

  return (
    <TodayBody
      dateKey={dateKey}
      next={next}
      inUseCount={inUse.length}
      demo={demo}
      demoScenario={demoScenario}
      weather={weather}
      plan={plan}
    />
  );
}

function TodayBody({
  dateKey,
  next,
  inUseCount,
  demo,
  demoScenario,
  weather,
  plan,
}: {
  dateKey: string;
  next: PlannedStep | undefined;
  inUseCount: number;
  demo: boolean;
  demoScenario: boolean;
  weather: ReturnType<typeof usePlan>["weather"];
  plan: NonNullable<ReturnType<typeof usePlan>["plan"]>;
}) {
  const { data, now, update } = useApp();
  const adherence = data.adherence.filter((event) => event.date === dateKey);
  const profile = data.profile;
  if (!profile) return null;

  function mark(step: PlannedStep, action: "completed" | "skipped") {
    update((current) => {
      const existing = current.adherence.find(
        (event) => event.date === dateKey && event.period === step.period && event.productId === step.productId,
      );
      if (existing?.action === action) return clearAdherence(current, dateKey, step.period, step.productId);
      return recordAdherence(current, {
        id: createId("adh"),
        date: dateKey,
        period: step.period,
        productId: step.productId,
        action,
        at: new Date().toISOString(),
      });
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="kicker">{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl sm:text-5xl">{greeting(now, profile.displayName)}</h1>
        <p className="text-sm text-muted">{now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</p>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
        Mode: {plan.modeUsed}. {plan.differsFromBaseline ? plan.differenceReasons.join(" ") : "Today's product selection matches the baseline routine."}
      </p>
      <div className="mt-6">
        <WeatherSummary weather={weather} unit={data.settings.temperatureUnit} demoScenario={demoScenario} />
      </div>
      {plan.weatherNotes.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
          {plan.weatherNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 grid gap-3">
        {plan.alerts.map((alert) => (
          <SafetyAlert key={alert.id} alert={alert} />
        ))}
      </div>
      {next ? (
        <p className="mt-6 border border-line bg-elevated px-4 py-3 text-sm">
          Next step: {next.productName}. {next.purpose}.
        </p>
      ) : (
        <p className="mt-6 text-sm text-muted">The scheduled steps for today are marked done.</p>
      )}
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <DailyRoutine title="Morning" steps={plan.morning} adherence={adherence.filter((event) => event.period === "am")} onComplete={(step) => mark(step, "completed")} onSkip={(step) => mark(step, "skipped")} />
        <DailyRoutine title="Evening" steps={plan.evening} adherence={adherence.filter((event) => event.period === "pm")} onComplete={(step) => mark(step, "completed")} onSkip={(step) => mark(step, "skipped")} />
      </div>
      {plan.uncertainties.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg">Unresolved</h2>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-muted">
            {plan.uncertainties.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <p>{inUseCount} products in use.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/profile" className="hover:text-accent">Profile</Link>
          <Link href="/goals" className="hover:text-accent">Goals</Link>
          <Link href="/shelf" className="hover:text-accent">Shelf</Link>
          <Link href="/settings" className="hover:text-accent">Settings</Link>
          {demo ? <Link href="/settings" className="hover:text-accent">Leave demo</Link> : null}
        </div>
      </section>
    </div>
  );
}
