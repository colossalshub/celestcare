"use client";

import { GoalProgress } from "@/components/goals/GoalProgress";
import { useApp } from "@/components/providers/AppProvider";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import Link from "next/link";
import { localDateKey } from "@/lib/state/model";

export default function GoalsPage() {
  const { ready, data, now } = useApp();
  if (!ready) return <LoadingState />;
  if (!data.profile) return <EmptyState title="Choose a goal when you are ready." body="Goals only change which of your products are explained. They do not override an allergy." action={<Link href="/onboarding" className="border border-line px-3 py-2 text-sm">Set goals</Link>} />;
  const today = localDateKey(now);
  const todayEvents = data.adherence.filter((event) => event.date === today);
  const completed = todayEvents.filter((event) => event.action === "completed").length;
  return (
    <div className="mx-auto max-w-3xl">
      <p className="kicker">Progress</p>
      <h1 className="display mt-2 text-4xl">Goals</h1>
      <div className="mt-6">
        <GoalProgress profile={data.profile} products={data.products} journal={data.journal} adherenceDays={{ completed, logged: Math.max(todayEvents.length, completed) }} />
      </div>
    </div>
  );
}
