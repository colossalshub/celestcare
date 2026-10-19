"use client";

import { CompatibilityMap } from "@/components/compatibility/CompatibilityMap";
import { useApp } from "@/components/providers/AppProvider";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import Link from "next/link";

export default function CompatibilityPage() {
  const { ready, data } = useApp();
  if (!ready) return <LoadingState />;
  if (!data.profile) {
    return <EmptyState title="A profile is needed for allergy context." body="Compatibility can still be uncertain without one." action={<Link href="/onboarding" className="border border-line px-3 py-2 text-sm">Create a profile</Link>} />;
  }
  return (
    <div className="mx-auto max-w-6xl">
      <p className="kicker">Relationships</p>
      <h1 className="display mt-2 text-4xl">Compatibility</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Pairs are judged from your ingredient lists and recorded label limits. A caution is not a claim that the combination is dangerous. Compatible means no specific issue was found in the stored data.
      </p>
      <div className="mt-8">
        <CompatibilityMap products={data.products} profile={data.profile} />
      </div>
    </div>
  );
}
