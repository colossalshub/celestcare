import type { EvidenceGrade } from "@/lib/skincare/types";
import { evidenceLabel } from "@/lib/skincare/evidence-ranking";

export function EvidenceBadge({ grade }: { grade: EvidenceGrade }) {
  return (
    <span className="inline-flex items-center border border-line px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">
      {grade} · {evidenceLabel(grade)}
    </span>
  );
}
