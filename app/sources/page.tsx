"use client";

import { SourceCitation } from "@/components/evidence/SourceCitation";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { CLAIMS } from "@/lib/research/claims";
import { SOURCES } from "@/lib/research/sources";

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="kicker">Provenance</p>
      <h1 className="display mt-2 text-4xl">Sources and evidence</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Grades are internal labels for this app. They are not a formal evidence-grading system. Marketing claims are not stored as proof.
      </p>
      <h2 className="mt-8 text-lg">Claims</h2>
      <ul className="mt-4 space-y-6">
        {CLAIMS.map((claim) => (
          <li key={claim.id} className="border-t border-line pt-4">
            <EvidenceBadge grade={claim.grade} />
            <p className="mt-3 text-sm leading-6">{claim.text}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{claim.limitations}</p>
            <ul className="mt-2">
              {claim.sourceIds.map((sourceId) => (
                <SourceCitation key={sourceId} sourceId={sourceId} />
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-lg">Source list</h2>
      <ul className="mt-3">
        {SOURCES.map((source) => (
          <SourceCitation key={source.id} sourceId={source.id} />
        ))}
      </ul>
      <p className="mt-8 text-sm leading-6 text-muted">
        Home patch tests can show obvious irritation and cannot rule out allergy. Formal patch testing is done by a clinician. Stop and get emergency care for trouble breathing, swelling of the tongue or throat, or faintness.
      </p>
    </div>
  );
}
