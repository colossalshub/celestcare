"use client";

import { SkinJournal } from "@/components/journal/SkinJournal";
import { LoadingState } from "@/components/states/LoadingState";
import { useApp } from "@/components/providers/AppProvider";

export default function JournalPage() {
  const { ready } = useApp();
  if (!ready) return <LoadingState />;
  return (
    <div className="mx-auto max-w-5xl">
      <p className="kicker">Notes</p>
      <h1 className="display mt-2 text-4xl">Journal</h1>
      <div className="mt-6">
        <SkinJournal />
      </div>
    </div>
  );
}
