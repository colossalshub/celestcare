import type { PlannedStep, RoutinePlan } from "@/lib/skincare/types";

export function explainInclusion(args: {
  productName: string;
  role: "cleanser" | "moisturizer" | "sunscreen" | "support" | "treatment" | "prescription";
  detail: string;
}): string {
  switch (args.role) {
    case "cleanser":
      return `${args.productName} is the cleanse for this routine. ${args.detail}`;
    case "moisturizer":
      return `${args.productName} is included to moisturize. ${args.detail}`;
    case "sunscreen":
      return `${args.productName} is the morning sun-protection step. ${args.detail}`;
    case "support":
      return `${args.productName} is a supportive step. ${args.detail}`;
    case "treatment":
      return `${args.productName} is the treatment step. ${args.detail}`;
    case "prescription":
      return `${args.productName} stays on the recorded schedule. ${args.detail}`;
  }
}

export function sunscreenLimitations(product: {
  spf?: number | null;
  broadSpectrum?: boolean | null;
  waterResistant?: boolean | null;
  waterResistantMinutes?: 40 | 80 | null;
}): string[] {
  const notes: string[] = [
    "Sunscreen does not block 100% of UVB and does not guarantee prevention of skin cancer, pigmentation, or aging.",
  ];
  if (product.spf == null) notes.push("No SPF is stored from the label, so none is being claimed.");
  else if (product.spf < 30) notes.push(`The stored label says SPF ${product.spf}, which is below the SPF 30 AAD recommends.`);
  else notes.push(`The stored label says SPF ${product.spf}.`);
  if (product.broadSpectrum == null) notes.push("Broad spectrum is not recorded, so it is not being claimed.");
  else if (product.broadSpectrum) notes.push("The stored label says broad spectrum.");
  else notes.push("The stored label does not say broad spectrum.");
  if (product.waterResistant == null) notes.push("Water resistance is not recorded, so it is not being claimed.");
  else if (product.waterResistant) {
    notes.push(
      product.waterResistantMinutes
        ? `The stored label says water resistant for ${product.waterResistantMinutes} minutes.`
        : "Water resistant is recorded without a 40- or 80-minute time.",
    );
  }
  return notes;
}

export function validateExplanation(plan: RoutinePlan, prose: string): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (/guaranteed results|clinically proven to cure|safe for everyone|will cure/i.test(prose)) {
    reasons.push("The explanation promises an outcome this plan does not support.");
  }
  for (const exclusion of plan.excluded) {
    if (exclusion.level !== "BLOCK" && exclusion.level !== "HIGH_CAUTION") continue;
    const name = exclusion.productName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(?:use|apply|include|add)\\s+${name}`, "i").test(prose)) {
      reasons.push(`${exclusion.productName} is excluded and cannot be recommended in generated text.`);
    }
    if (new RegExp(`${name}[^.\\n]{0,80}\\b(?:safe|allergy-free)\\b`, "i").test(prose)) {
      reasons.push(`${exclusion.productName} cannot be described as safe.`);
    }
  }
  for (const step of [...plan.morning, ...plan.evening]) {
    if (/100%|guaranteed/i.test(step.why) || /100%|guaranteed/i.test(prose)) {
      if (step.category === "sunscreen" && /100%/.test(prose)) {
        reasons.push("Sunscreen copy must not claim complete UV blocking.");
      }
    }
  }
  return { ok: reasons.length === 0, reasons };
}

export function stepSummary(step: PlannedStep): string {
  return `${step.order}. ${step.productName} — ${step.purpose}`;
}
