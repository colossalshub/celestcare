import { hasConfirmedAllergy, screenProduct } from "@/lib/skincare/allergy-screening";
import { explainInclusion, sunscreenLimitations } from "@/lib/skincare/explanations";
import { goalDefinition, goalSupport, scoreProductForGoals } from "@/lib/skincare/goals";
import {
  canonicalIds,
  classesForProduct,
  isIrritantActive,
  isOilCleanser,
} from "@/lib/skincare/product-validation";
import type {
  Exclusion,
  GoalId,
  IngredientClass,
  JournalEntry,
  PlannedStep,
  Product,
  RoutinePlan,
  RoutineProfile,
  UserProfile,
} from "@/lib/skincare/types";
import { interpretWeather, neutralWeatherAdvice, type WeatherInterpretation } from "@/lib/skincare/weather-adaptation";
import type { WeatherSnapshot } from "@/lib/weather/types";

export interface OptimizerInput {
  profile: UserProfile;
  products: Product[];
  now: Date;
  mode: RoutineProfile;
  journal: JournalEntry[];
  weather: WeatherSnapshot | null;
  overrides?: {
    hiddenProductIds?: string[];
    forcedProductIds?: string[];
  };
}

const CONCENTRATION =
  "Presence of an ingredient is not proof of an effective concentration.";

export function localDayIndex(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

export function isScheduledToday(product: Product, date: Date): boolean {
  const times = product.schedule?.timesPerWeek;
  if (times == null || times >= 7) return true;
  return localDayIndex(date) % 7 < times;
}

export function hasRecentIrritation(journal: readonly JournalEntry[], products: readonly Product[], now: Date): boolean {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const journalHit = journal.some((entry) => {
    const time = Date.parse(entry.date);
    if (!Number.isFinite(time) || time < cutoff) return false;
    return entry.irritation === "moderate" || entry.irritation === "severe" || entry.emergencySymptoms;
  });
  if (journalHit) return true;
  return products.some((product) =>
    product.reactions.some(
      (reaction) => reaction.ongoing && (reaction.severity === "moderate" || reaction.severity === "severe"),
    ),
  );
}

function fingerprint(value: unknown): string {
  const serialized = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function byName(products: readonly Product[]): Product[] {
  return [...products].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

function sortKey(product: Product, period: "am" | "pm"): number {
  if (product.category === "cleanser" && isOilCleanser(product)) return 5;
  if (product.category === "cleanser") return 10;
  if (product.category === "toner") return 20;
  if (product.category === "serum") return 30;
  if (product.category === "treatment" || product.category === "exfoliant") return 40;
  if (product.category === "eye") return 60;
  if (product.category === "moisturizer") return 70;
  if (product.category === "oil") return 80;
  if (product.category === "sunscreen") return period === "am" ? 90 : 95;
  return 50;
}

function makeStep(
  product: Product,
  period: "am" | "pm",
  role: Parameters<typeof explainInclusion>[0]["role"],
  detail: string,
  purpose: string,
  extras?: { limitations?: string[]; claimIds?: string[]; compatibilityNotes?: string[]; safetyNote?: string },
): PlannedStep {
  return {
    id: `${period}:${product.id}`,
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    category: product.category,
    period,
    order: 0,
    sortKey: sortKey(product, period),
    purpose,
    why: explainInclusion({ productName: product.name, role, detail }),
    benefits: product.benefits,
    limitations: extras?.limitations ?? [CONCENTRATION],
    compatibilityNotes: extras?.compatibilityNotes ?? [],
    frequency: product.frequency ?? (product.schedule?.timesPerWeek ? `${product.schedule.timesPerWeek} days per week, as recorded` : "As recorded on the product"),
    amount: product.amountGuidance,
    waitTime: product.waitTime,
    evidenceClaimIds: extras?.claimIds ?? [],
    safetyNote: extras?.safetyNote,
  };
}

function order(steps: PlannedStep[]): PlannedStep[] {
  return [...steps]
    .sort((a, b) => a.sortKey - b.sortKey || a.productName.localeCompare(b.productName))
    .map((step, index) => ({ ...step, order: index + 1 }));
}

function exclusion(product: Product, partial: Omit<Exclusion, "productId" | "productName">): Exclusion {
  return { productId: product.id, productName: product.name, ...partial };
}

function pregnancyActive(profile: UserProfile): boolean {
  return profile.pregnancyStatus === "pregnant" || profile.pregnancyStatus === "trying";
}

interface Built {
  morning: PlannedStep[];
  evening: PlannedStep[];
  excluded: Exclusion[];
  uncertainties: string[];
}

function pickMoisturizer(products: readonly Product[], profile: UserProfile, advice: WeatherInterpretation): Product | null {
  const moisturizers = byName(products.filter((product) => product.category === "moisturizer"));
  if (moisturizers.length === 0) return null;
  const rich = moisturizers.find((product) => product.moisturizerWeight === "rich");
  const light = moisturizers.find((product) => product.moisturizerWeight === "light");
  const medium = moisturizers.find((product) => product.moisturizerWeight === "medium");
  if (advice.preferRicher && rich) return rich;
  if (advice.preferLighter && light) return light;
  if (profile.skinType === "dry" && rich) return rich;
  if (profile.skinType === "oily" && light) return light;
  return medium ?? light ?? rich ?? moisturizers[0] ?? null;
}

function pickSunscreen(products: readonly Product[], advice: WeatherInterpretation): Product | null {
  const screens = byName(
    products.filter((product) => product.category === "sunscreen" || (product.spf != null && product.spf > 0)),
  );
  if (screens.length === 0) return null;
  const ranked = [...screens].sort((a, b) => sunscreenRank(b, advice) - sunscreenRank(a, advice) || a.name.localeCompare(b.name));
  return ranked[0] ?? null;
}

function sunscreenRank(product: Product, advice: WeatherInterpretation): number {
  let score = 0;
  if ((product.spf ?? 0) >= 30) score += 4;
  if (product.broadSpectrum === true) score += 4;
  if (advice.preferWaterResistant && product.waterResistant === true) score += 3;
  if ((product.spf ?? 0) > 0) score += 1;
  return score;
}

function allowIrritants(mode: RoutineProfile): boolean {
  return mode === "balanced" || mode === "goal-focused";
}

function serumLimit(mode: RoutineProfile): number {
  if (mode === "goal-focused") return 2;
  if (mode === "balanced" || mode === "sensitive") return 1;
  return 0;
}

export function optimizeRoutine(input: OptimizerInput): RoutinePlan {
  const irritated = hasRecentIrritation(input.journal, input.products, input.now);
  let modeUsed: RoutineProfile = input.mode;
  if (irritated) modeUsed = "recovery";
  else if (input.profile.needsProfessionalCare && (input.mode === "goal-focused" || input.mode === "balanced")) {
    modeUsed = "sensitive";
  }

  const advice = interpretWeather(input.weather, input.profile, input.now);
  const baselineAdvice = neutralWeatherAdvice(input.profile);
  const hidden = new Set(input.overrides?.hiddenProductIds ?? []);
  const forced = new Set(input.overrides?.forcedProductIds ?? []);

  const screened = partition(input.products, input.profile, input.now, modeUsed, irritated, hidden);
  const selected = assemble(screened.eligible, input.profile, input.now, modeUsed, advice, screened.excluded);
  const baseline = assemble(screened.eligible, input.profile, input.now, modeUsed, baselineAdvice, []);

  const selectedIds = signature(selected);
  const baselineIds = signature(baseline);
  const differs = advice.applied && selectedIds !== baselineIds;
  const differenceReasons = differs ? advice.reasons : [];

  const forcedRejected = applyForced(selected, screened.eligible, forced, input.profile, input.now);
  const morning = order(selected.morning);
  const evening = order(selected.evening);

  const goalsUnsupported = unsupportedGoals(input.profile, screened.eligible);
  const alerts = buildAlerts(input, screened.excluded, irritated);

  if (morning.length === 0 && evening.length === 0) {
    selected.uncertainties.unshift(
      "There are no eligible in-use products, so no routine was invented. Add products you already own.",
    );
  }
  if (!screened.eligible.some((product) => product.category === "sunscreen" || (product.spf ?? 0) >= 30)) {
    selected.uncertainties.push(
      "No eligible sunscreen with a stored SPF of 30 or higher is on the active shelf. Sun protection is still a daily consideration. CelestCare will not invent a sunscreen for you.",
    );
  }

  const plan: RoutinePlan = {
    generatedAt: input.now.toISOString(),
    modeRequested: input.mode,
    modeUsed,
    morning,
    evening,
    excluded: selected.excluded,
    uncertainties: selected.uncertainties,
    alerts,
    weatherApplied: advice.applied,
    weatherStale: advice.stale,
    weatherMissing: advice.missing,
    weatherNotes: advice.notes,
    differsFromBaseline: differs,
    differenceReasons,
    goalsUnsupported,
    fingerprint: fingerprint({
      modeUsed,
      morning: morning.map((step) => step.productId),
      evening: evening.map((step) => step.productId),
      day: localDayIndex(input.now),
    }),
    rejectedExternalProductIds: forcedRejected,
  };
  return plan;
}

function signature(built: Built): string {
  return [...built.morning, ...built.evening].map((step) => `${step.period}:${step.productId}`).sort().join("|");
}

function partition(
  products: readonly Product[],
  profile: UserProfile,
  now: Date,
  mode: RoutineProfile,
  irritated: boolean,
  hidden: Set<string>,
): { eligible: Product[]; excluded: Exclusion[] } {
  const eligible: Product[] = [];
  const excluded: Exclusion[] = [];
  const confirmed = hasConfirmedAllergy(profile);

  for (const product of products) {
    if (product.status !== "in-use") {
      excluded.push(
        exclusion(product, {
          level: "INFORMATION",
          code: "paused-or-finished",
          explanation: `${product.name} is marked ${product.status}, so it is not in the routine.`,
          sourceIds: [],
        }),
      );
      continue;
    }
    if (product.remaining === "empty") {
      excluded.push(
        exclusion(product, {
          level: "INFORMATION",
          code: "not-in-use",
          explanation: `${product.name} is marked empty.`,
          sourceIds: [],
        }),
      );
      continue;
    }
    if (hidden.has(product.id)) {
      excluded.push(
        exclusion(product, {
          level: "INFORMATION",
          code: "mode-simplified",
          explanation: `${product.name} was removed in Routine Studio. Safety rules still apply if you add it back.`,
          sourceIds: [],
        }),
      );
      continue;
    }

    const severe = product.reactions.some((reaction) => reaction.severity === "severe" || reaction.emergency);
    if (severe) {
      excluded.push(
        exclusion(product, {
          level: "BLOCK",
          code: "severe-reaction",
          explanation: `A severe reaction is recorded for ${product.name}. It is not recommended. Seek medical care for trouble breathing, swelling of the tongue or throat, faintness, blistering, or a rapidly spreading rash.`,
          sourceIds: [],
        }),
      );
      continue;
    }

    const safety = screenProduct(product, profile);
    if (safety.assessment === "blocked") {
      excluded.push(
        exclusion(product, {
          level: "BLOCK",
          code: "confirmed-allergy",
          explanation: safety.summary,
          sourceIds: ["fda-fragrance"],
        }),
      );
      continue;
    }
    if (safety.matches.some((match) => match.level === "HIGH_CAUTION")) {
      excluded.push(
        exclusion(product, {
          level: "HIGH_CAUTION",
          code: "suspected-sensitivity",
          explanation: `${safety.summary} Suspected sensitivity is not the same as a confirmed allergy, and the product is still withheld from the automatic routine.`,
          sourceIds: ["fda-fragrance"],
        }),
      );
      continue;
    }
    if (!safety.listComplete && confirmed) {
      excluded.push(
        exclusion(product, {
          level: "UNKNOWN",
          code: "incomplete-ingredients",
          explanation: `${product.name} has an incomplete or unconfirmed ingredient list. With a recorded allergy, it cannot be cleared and is left out. An absent match is not proof it is safe.`,
          sourceIds: ["fda-labeling-guide"],
        }),
      );
      continue;
    }
    if (product.ingredientListStatus === "extracted-unconfirmed") {
      excluded.push(
        exclusion(product, {
          level: "UNKNOWN",
          code: "unconfirmed-extraction",
          explanation: `Text for ${product.name} has not been confirmed against the label, so it is not used in the routine.`,
          sourceIds: [],
        }),
      );
      continue;
    }
    if (pregnancyActive(profile) && classesForProduct(product).has("retinoid")) {
      excluded.push(
        exclusion(product, {
          level: "HIGH_CAUTION",
          code: "pregnancy-retinoid",
          explanation: `${product.name} contains a retinoid. AAD and DermNet guidance is to avoid topical retinoids in pregnancy and when pregnancy is being contemplated. This is not personal obstetric advice.`,
          sourceIds: ["aad-acne-pregnancy", "dermnet-acne-pregnancy", "dermnet-retinoids"],
        }),
      );
      continue;
    }
    if (
      pregnancyActive(profile) &&
      canonicalIds(product).has("salicylic-acid") &&
      product.category !== "cleanser"
    ) {
      excluded.push(
        exclusion(product, {
          level: "HIGH_CAUTION",
          code: "pregnancy-salicylic",
          explanation: `${product.name} is a leave-on salicylic acid product and the concentration is not being treated as known. It is withheld so you can ask a clinician. Low-strength, limited use is a different question from an automatic recommendation.`,
          sourceIds: ["aad-acne-pregnancy", "dermnet-acne-pregnancy"],
        }),
      );
      continue;
    }
    if (irritated && isIrritantActive(product)) {
      excluded.push(
        exclusion(product, {
          level: "HIGH_CAUTION",
          code: "irritation-hold",
          explanation: product.prescription
            ? `${product.name} is a prescription product and recent irritation is recorded. CelestCare will not schedule it while that flag is on. This is not an instruction to change a prescribed medicine. Contact the prescriber before changing it.`
            : `${product.name} is a potentially irritating active, and recent irritation is recorded. It is left out in favor of a simpler routine.`,
          sourceIds: ["dermnet-retinoids", "dermnet-salicylic"],
        }),
      );
      continue;
    }
    if (
      !safety.listComplete &&
      (isIrritantActive(product) ||
        product.category === "treatment" ||
        product.category === "serum" ||
        product.category === "exfoliant" ||
        product.category === "toner")
    ) {
      excluded.push(
        exclusion(product, {
          level: "UNKNOWN",
          code: "insufficient-evidence",
          explanation: `${product.name} is not recommended because its ingredient list is incomplete. An unknown formula cannot be cleared or matched to a goal.`,
          sourceIds: ["fda-labeling-guide"],
        }),
      );
      continue;
    }
    if (!allowIrritants(mode) && isIrritantActive(product) && !product.prescription) {
      excluded.push(
        exclusion(product, {
          level: "INFORMATION",
          code: "mode-simplified",
          explanation: `${product.name} is held back because the current routine mode keeps potentially irritating actives out.`,
          sourceIds: [],
        }),
      );
      continue;
    }
    if (product.prescription && !isScheduledToday(product, now)) {
      excluded.push(
        exclusion(product, {
          level: "INFORMATION",
          code: "not-scheduled-today",
          explanation: `${product.name} is not scheduled today. Its recorded frequency is ${product.schedule?.timesPerWeek ?? "unspecified"} days per week, and that cap is not increased.`,
          sourceIds: [],
        }),
      );
      continue;
    }

    eligible.push(product);
  }

  return { eligible, excluded };
}

function assemble(
  eligible: readonly Product[],
  profile: UserProfile,
  now: Date,
  mode: RoutineProfile,
  advice: WeatherInterpretation,
  alreadyExcluded: Exclusion[],
): Built {
  const excluded = [...alreadyExcluded];
  const uncertainties: string[] = [];
  const morning: PlannedStep[] = [];
  const evening: PlannedStep[] = [];
  const used = new Set<string>();

  const cleansers = byName(eligible.filter((product) => product.category === "cleanser"));
  const gentle = cleansers.filter((product) => !isIrritantActive(product));
  const cleanserPool = mode === "recovery" || mode === "sensitive" ? gentle : cleansers;
  if (cleansers.length > 0 && cleanserPool.length === 0) {
    uncertainties.push("The only cleansers are potentially irritating, so none is scheduled in this simplified routine.");
  }
  const oils = cleanserPool.filter(isOilCleanser);
  const waters = cleanserPool.filter((product) => !isOilCleanser(product));
  const amCleanser = waters[0] ?? cleanserPool[0];
  if (amCleanser) {
    morning.push(
      makeStep(amCleanser, "am", "cleanser", "One cleanse is enough in the morning unless your own instructions say otherwise.", "Cleanse"),
    );
    used.add(amCleanser.id);
  }
  const pmFirst = oils[0];
  if (pmFirst) {
    evening.push(makeStep(pmFirst, "pm", "cleanser", "An oil or balm cleanser can be the first evening cleanse.", "First cleanse"));
    used.add(pmFirst.id);
  }
  const pmSecond = waters.find((product) => product.id !== pmFirst?.id) ?? (!pmFirst ? cleanserPool[0] : undefined);
  if (pmSecond) {
    evening.push(
      makeStep(
        pmSecond,
        "pm",
        "cleanser",
        pmFirst ? "This is the second cleanse after the oil or balm." : "This is the evening cleanse.",
        pmFirst ? "Second cleanse" : "Cleanse",
      ),
    );
    used.add(pmSecond.id);
  }

  const prescriptions = byName(
    eligible.filter((product) => product.prescription && !used.has(product.id) && product.category !== "sunscreen"),
  );
  const blockedByLabel = new Set<IngredientClass>();
  for (const product of prescriptions) {
    for (const item of product.doNotCombineWith ?? []) blockedByLabel.add(item);
  }

  for (const product of prescriptions) {
    const period = product.schedule?.period === "am" ? "am" : "pm";
    const bucket = period === "am" ? morning : evening;
    bucket.push(
      makeStep(
        product,
        period,
        "prescription",
        "The recorded prescriber or label frequency is used as written. CelestCare does not increase it or turn it into a new plan.",
        "Prescription step",
        {
          claimIds: classesForProduct(product).has("retinoid") ? ["retinoid-uses", "retinoid-irritation"] : [],
          limitations: [
            "This is organization of instructions you recorded, not a new prescription.",
            CONCENTRATION,
          ],
          safetyNote: "Ask the prescriber before changing how you use this.",
        },
      ),
    );
    used.add(product.id);
  }

  const treatmentCandidates = byName(
    eligible.filter((product) => {
      if (used.has(product.id)) return false;
      if (product.category === "cleanser" || product.category === "moisturizer" || product.category === "sunscreen" || product.category === "oil" || product.category === "mask") {
        return false;
      }
      return true;
    }),
  );

  const conflicting = treatmentCandidates.filter((product) => {
    const classes = classesForProduct(product);
    for (const blocked of blockedByLabel) {
      if (classes.has(blocked)) return true;
    }
    return false;
  });
  const prescriptionRetinoid = prescriptions.some((product) => classesForProduct(product).has("retinoid"));
  if (prescriptionRetinoid) {
    for (const product of treatmentCandidates) {
      if (used.has(product.id) || !classesForProduct(product).has("retinoid")) continue;
      excluded.push(
        exclusion(product, {
          level: "CAUTION",
          code: "duplicate-active",
          explanation: `${product.name} is not stacked with the retinoid already scheduled from a prescription. One retinoid at a time is the default.`,
          sourceIds: ["dermnet-retinoids"],
        }),
      );
      used.add(product.id);
    }
  }
  for (const product of conflicting) {
    excluded.push(
      exclusion(product, {
        level: "BLOCK",
        code: "label-conflict",
        explanation: `${product.name} is left out because another product's label or prescriber instructions say not to combine it with this type of product. The label wins over a goal score.`,
        sourceIds: ["dermnet-salicylic"],
      }),
    );
    used.add(product.id);
  }

  const remainingTreatments = treatmentCandidates.filter((product) => !used.has(product.id));
  const irritants = remainingTreatments.filter(isIrritantActive);
  const gentleTreatments = remainingTreatments.filter((product) => !isIrritantActive(product));

  const newIrritants = irritants.filter((product) => product.newProduct);
  if (newIrritants.length > 1) {
    const rankedNew = [...newIrritants].sort((a, b) => scoreProductForGoals(b, profile) - scoreProductForGoals(a, profile) || a.name.localeCompare(b.name));
    const keep = rankedNew[0];
    for (const product of rankedNew.slice(1)) {
      excluded.push(
        exclusion(product, {
          level: "CAUTION",
          code: "new-irritant-limit",
          explanation: `${product.name} is not started at the same time as ${keep?.name ?? "another new active"}. Only one new potentially irritating active is introduced.`,
          sourceIds: ["dermnet-retinoids"],
        }),
      );
      used.add(product.id);
    }
  }

  const pmIrritants = irritants.filter((product) => !used.has(product.id));
  if (pmIrritants.length > 1) {
    const day = localDayIndex(now);
    const index = day % pmIrritants.length;
    const chosen = pmIrritants[index];
    if (chosen) {
      evening.push(
        makeStep(
          chosen,
          "pm",
          "treatment",
          `Alternated with ${pmIrritants
            .filter((product) => product.id !== chosen.id)
            .map((product) => product.name)
            .join(" and ")} so more than one irritating active is not used on the same night. No universal waiting time is added.`,
          "Alternating treatment",
          { limitations: [CONCENTRATION, "Stop if you get more than mild, short-lived irritation."] },
        ),
      );
      used.add(chosen.id);
    }
    for (const product of pmIrritants) {
      if (product.id === chosen?.id) continue;
      excluded.push(
        exclusion(product, {
          level: "CAUTION",
          code: "alternated",
          explanation: `${product.name} is not used tonight. It alternates with another irritating active to limit cumulative irritation. This is not a statement that the combination is chemically forbidden.`,
          sourceIds: ["dermnet-salicylic", "dermnet-retinoids"],
        }),
      );
      used.add(product.id);
    }
  } else if (pmIrritants.length === 1 && pmIrritants[0] && allowIrritants(mode)) {
    const only = pmIrritants[0];
    const period = only.applicationPeriod === "am" ? "am" : "pm";
    const bucket = period === "am" ? morning : evening;
    bucket.push(
      makeStep(only, period, "treatment", "It is the only irritating active scheduled, so it does not need to alternate tonight.", "Treatment", {
        limitations: [CONCENTRATION],
      }),
    );
    used.add(only.id);
  }

  const rankedGentle = [...gentleTreatments]
    .filter((product) => product.category !== "mask")
    .sort((a, b) => scoreProductForGoals(b, profile) - scoreProductForGoals(a, profile) || a.name.localeCompare(b.name));
  for (const product of gentleTreatments.filter((item) => item.category === "mask")) {
    excluded.push(
      exclusion(product, {
        level: "INFORMATION",
        code: "mode-simplified",
        explanation: `${product.name} is a mask, so it is not placed in the daily routine.`,
        sourceIds: [],
      }),
    );
  }
  const slots = serumLimit(mode);
  const chosenGentle = rankedGentle.slice(0, slots);
  for (const product of chosenGentle) {
    const support = profile.goals
      .map((goal) => ({ goal, support: goalSupport(product, goal.id) }))
      .find((item) => item.support.supports);
    const period = product.applicationPeriod === "pm" ? "pm" : "am";
    const bucket = period === "am" ? morning : evening;
    bucket.push(
      makeStep(
        product,
        period,
        "support",
        support
          ? `Included for your ${goalDefinition(support.goal.id).label.toLowerCase()} goal. ${support.support.limitation}`
          : "Included as a non-irritating extra step you already own.",
        "Support",
        { claimIds: support?.support.claimIds ?? [], limitations: [support?.support.limitation ?? CONCENTRATION] },
      ),
    );
    used.add(product.id);
  }
  for (const product of rankedGentle.slice(slots)) {
    if (product.category === "mask") continue;
    excluded.push(
      exclusion(product, {
        level: "INFORMATION",
        code: "duplicate-active",
        explanation: `${product.name} is left out to keep the routine shorter. A higher-priority or simpler product already covers a similar role.`,
        sourceIds: [],
      }),
    );
  }

  const moisturizer = pickMoisturizer(
    eligible.filter((product) => !used.has(product.id)),
    profile,
    advice,
  );
  if (moisturizer) {
    const detail = advice.preferRicher
      ? "A richer texture is preferred today because humidity is low. That is comfort guidance, not a measurement of your skin."
      : advice.preferLighter
        ? "A lighter texture is preferred today because it is warm and humid. Moisturizer is not being skipped."
        : "The usual moisturizer for your skin-type preference is used. Weather is not swapping it.";
    const step = makeStep(moisturizer, "am", "moisturizer", detail, "Moisturize", {
      claimIds: canonicalIds(moisturizer).has("niacinamide") ? ["niacinamide-topical"] : [],
    });
    morning.push(step);
    evening.push({ ...step, id: `pm:${moisturizer.id}`, period: "pm", sortKey: sortKey(moisturizer, "pm") });
    const otherMoisturizers = eligible.filter(
      (product) => product.category === "moisturizer" && product.id !== moisturizer.id,
    );
    for (const other of otherMoisturizers) {
      excluded.push(
        exclusion(other, {
          level: "INFORMATION",
          code: "duplicate-active",
          explanation: `${other.name} stays on the shelf. ${moisturizer.name} is the moisturizer in today's routine.`,
          sourceIds: [],
        }),
      );
    }
  } else {
    uncertainties.push("No moisturizer is on the active shelf.");
  }

  const faceOils = byName(eligible.filter((product) => product.category === "oil"));
  if ((mode === "balanced" || mode === "goal-focused") && profile.skinType === "dry" && faceOils[0]) {
    evening.push(
      makeStep(
        faceOils[0],
        "pm",
        "support",
        "Added after moisturizer because your skin type is dry and you already own it.",
        "Seal",
      ),
    );
  }

  const sunscreen = pickSunscreen(
    eligible.filter((product) => !used.has(product.id)),
    advice,
  );
  if (sunscreen) {
    const emphasis = advice.emphasizeSunscreen
      ? " Today's conditions or your outdoor plans are a reason to be deliberate about application and reapplication, including when it is cloudy."
      : " Use it on skin you do not cover with clothing when you go out.";
    morning.push(
      makeStep(sunscreen, "am", "sunscreen", `Sunscreen is last in the morning.${emphasis} Reapply about every two hours outdoors and after swimming or sweating.`, "Sun protection", {
        claimIds: ["sunscreen-essentials", "sunscreen-reapply", "sunscreen-not-alone"],
        limitations: sunscreenLimitations(sunscreen),
      }),
    );
  }

  if (mode === "recovery") {
    uncertainties.push("The routine is simplified because irritation was reported in the last 7 days, or an ongoing moderate reaction is recorded.");
  }

  return { morning, evening, excluded, uncertainties };
}

function unsupportedGoals(profile: UserProfile, eligible: readonly Product[]): { goalId: GoalId; message: string }[] {
  return profile.goals.flatMap((goal) => {
    const supported = eligible.some((product) => goalSupport(product, goal.id).supports);
    if (supported) return [];
    return [
      {
        goalId: goal.id,
        message: `None of the eligible products on your shelf map to ${goalDefinition(goal.id).label.toLowerCase()}. CelestCare will not suggest buying something to fill that gap.`,
      },
    ];
  });
}

function buildAlerts(input: OptimizerInput, excluded: Exclusion[], irritated: boolean): RoutinePlan["alerts"] {
  const alerts: RoutinePlan["alerts"] = [];
  const emergency =
    input.journal.some((entry) => entry.emergencySymptoms) ||
    input.products.some((product) => product.reactions.some((reaction) => reaction.emergency));
  if (emergency) {
    alerts.push({
      id: "emergency",
      tone: "emergency",
      title: "Get emergency help for a severe allergic reaction",
      body: "Trouble breathing, swelling of the tongue or throat, faintness, or a rapidly spreading severe reaction needs emergency care now. CelestCare has stopped recommending the product tied to a recorded severe reaction.",
    });
  }
  if (irritated) {
    alerts.push({
      id: "irritation",
      tone: "caution",
      title: "The routine is pared back",
      body: "Recent irritation is recorded, so potentially irritating actives are not scheduled. Do not continue through severe burning, swelling, blistering, or a significant rash. Contact a clinician if it persists.",
    });
  }
  if (input.profile.needsProfessionalCare) {
    alerts.push({
      id: "professional",
      tone: "info",
      title: "This is a situation for a clinician",
      body: input.profile.professionalCareNote?.trim() ||
        "You noted a diagnosed skin condition, significant inflammation, a history of severe reactions, or a complex medication concern. CelestCare can organize gentle products. It cannot treat that condition.",
    });
  }
  if (excluded.some((item) => item.level === "BLOCK")) {
    alerts.push({
      id: "blocked",
      tone: "block",
      title: "A product was kept out on purpose",
      body: "At least one product matches an allergy, a severe reaction, or an explicit label conflict. Goal scores cannot put it back.",
    });
  }
  return alerts;
}

function applyForced(
  built: Built,
  eligible: readonly Product[],
  forced: Set<string>,
  _profile: UserProfile,
  _now: Date,
): string[] {
  const rejected: string[] = [];
  const eligibleIds = new Set(eligible.map((product) => product.id));
  const hardStop = new Set(
    built.excluded.filter((item) => item.level === "BLOCK" || item.level === "HIGH_CAUTION").map((item) => item.productId),
  );
  for (const id of forced) {
    if (!eligibleIds.has(id) || hardStop.has(id)) {
      rejected.push(id);
      continue;
    }
    const product = eligible.find((item) => item.id === id);
    if (!product) {
      rejected.push(id);
      continue;
    }
    const present = [...built.morning, ...built.evening].some((step) => step.productId === id);
    if (present) continue;
    const period = product.applicationPeriod === "pm" ? "pm" : product.category === "sunscreen" ? "am" : "pm";
    const bucket = period === "am" ? built.morning : built.evening;
    bucket.push(
      makeStep(product, period, "support", "You added this from your shelf. It was eligible under the safety rules.", "Added by you"),
    );
  }
  return rejected;
}

export function applyExternalSuggestion(
  plan: RoutinePlan,
  suggestion: { addProductIds?: string[] },
  products: readonly Product[],
): RoutinePlan {
  const blocked = new Set(
    plan.excluded.filter((item) => item.level === "BLOCK" || item.level === "HIGH_CAUTION").map((item) => item.productId),
  );
  const known = new Set(products.map((product) => product.id));
  const rejected = (suggestion.addProductIds ?? []).filter((id) => blocked.has(id) || !known.has(id));
  return {
    ...plan,
    rejectedExternalProductIds: [...plan.rejectedExternalProductIds, ...rejected],
  };
}
