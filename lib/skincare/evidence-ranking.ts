import type { EvidenceGrade } from "@/lib/skincare/types";
import { claimsByIds } from "@/lib/research/claims";

const RANK: Record<EvidenceGrade, number> = {
  STRONG: 3,
  MODERATE: 2,
  LIMITED: 1,
  UNCERTAIN: 0,
};

export function evidenceWeight(grade: EvidenceGrade): number {
  return RANK[grade];
}

export function strongestGrade(grades: readonly EvidenceGrade[]): EvidenceGrade {
  if (grades.length === 0) return "UNCERTAIN";
  return grades.reduce((best, grade) => (RANK[grade] > RANK[best] ? grade : best));
}

export function gradeForClaims(claimIds: readonly string[]): EvidenceGrade {
  const grades = claimsByIds(claimIds).map((claim) => claim.grade);
  return strongestGrade(grades);
}

export function evidenceLabel(grade: EvidenceGrade): string {
  switch (grade) {
    case "STRONG":
      return "Strong support in the reviewed sources";
    case "MODERATE":
      return "Moderate support, with limitations";
    case "LIMITED":
      return "Limited or indirect support";
    case "UNCERTAIN":
      return "Not enough reviewed evidence";
  }
}
