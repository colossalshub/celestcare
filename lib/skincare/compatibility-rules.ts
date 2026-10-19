import { classesForProduct, canonicalIds, isIrritantActive } from "@/lib/skincare/product-validation";
import type { IngredientClass, Product, SafetyLevel, UserProfile } from "@/lib/skincare/types";

export type RelationshipKind =
  | "complementary"
  | "duplicate"
  | "cumulative-irritation"
  | "ingredient-overlap"
  | "allergy-concern"
  | "needs-verification"
  | "undetermined"
  | "no-specific-issue";

export interface ProductRelationship {
  productAId: string;
  productBId: string;
  kind: RelationshipKind;
  level: SafetyLevel;
  title: string;
  triggers: string[];
  evidenceSummary: string;
  practicalAction: string;
  sourceIds: string[];
  uncertain: boolean;
}

const LEVEL_RANK: Record<SafetyLevel, number> = {
  BLOCK: 6,
  HIGH_CAUTION: 5,
  CAUTION: 4,
  UNKNOWN: 3,
  INFORMATION: 2,
  COMPATIBLE: 1,
};

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

export function relationshipKey(a: string, b: string): string {
  return pairKey(a, b);
}

function labelConflict(a: Product, b: Product): IngredientClass | null {
  const bClasses = classesForProduct(b);
  for (const blocked of a.doNotCombineWith ?? []) {
    if (bClasses.has(blocked)) return blocked;
  }
  const aClasses = classesForProduct(a);
  for (const blocked of b.doNotCombineWith ?? []) {
    if (aClasses.has(blocked)) return blocked;
  }
  return null;
}

function sharedClasses(a: Product, b: Product): IngredientClass[] {
  const left = classesForProduct(a);
  const shared: IngredientClass[] = [];
  for (const item of classesForProduct(b)) {
    if (left.has(item)) shared.push(item);
  }
  return shared;
}

function listUnclear(product: Product): boolean {
  return (
    product.ingredientListStatus === "unknown" ||
    product.ingredientListStatus === "incomplete" ||
    product.ingredientListStatus === "extracted-unconfirmed" ||
    product.ingredients.length === 0
  );
}

export function assessPair(a: Product, b: Product, _profile: UserProfile): ProductRelationship {
  const triggers: string[] = [];
  const conflict = labelConflict(a, b);
  if (conflict) {
    const holder = (a.doNotCombineWith ?? []).includes(conflict) ? a : b;
    return {
      productAId: a.id,
      productBId: b.id,
      kind: "cumulative-irritation",
      level: "BLOCK",
      title: "The product label says not to combine these",
      triggers: [`${holder.name} records a label conflict with ${conflict.replace("-", " ")}.`],
      evidenceSummary:
        "An explicit label or prescriber instruction takes precedence over a general skincare routine. This is not CelestCare inventing a universal chemical rule.",
      practicalAction: `Do not schedule ${a.name} and ${b.name} together. Follow ${holder.name}'s label, and ask the prescriber before changing a prescription.`,
      sourceIds: ["dermnet-salicylic", "dermnet-retinoids"],
      uncertain: false,
    };
  }

  if (listUnclear(a) || listUnclear(b)) {
    return {
      productAId: a.id,
      productBId: b.id,
      kind: "undetermined",
      level: "UNKNOWN",
      title: "Cannot assess this pair",
      triggers: ["One or both ingredient lists are missing, incomplete, or not yet confirmed."],
      evidenceSummary: "No compatibility conclusion is possible from an unknown formula.",
      practicalAction: "Copy the ingredient list from the package and confirm it before treating this pair as suitable.",
      sourceIds: ["fda-labeling-guide"],
      uncertain: true,
    };
  }

  const shared = sharedClasses(a, b);
  const irritating = shared.filter((item) =>
    item === "retinoid" || item === "exfoliant-acid" || item === "benzoyl-peroxide" || item === "vitamin-c",
  );
  if (irritating.length > 0) {
    return {
      productAId: a.id,
      productBId: b.id,
      kind: "duplicate",
      level: "CAUTION",
      title: "Overlapping active types",
      triggers: irritating.map((item) => `Both products are in the ${item.replace("-", " ")} group.`),
      evidenceSummary:
        "Using two products from the same potentially irritating group increases the chance of dryness and irritation. It is not automatically a dangerous chemical reaction.",
      practicalAction: "Keep one of them in the routine. Alternate only if each label allows the days you choose.",
      sourceIds: ["dermnet-retinoids", "dermnet-salicylic"],
      uncertain: false,
    };
  }

  const aClasses = classesForProduct(a);
  const bClasses = classesForProduct(b);
  const acidAndRetinoid =
    (aClasses.has("exfoliant-acid") && bClasses.has("retinoid")) ||
    (bClasses.has("exfoliant-acid") && aClasses.has("retinoid"));
  if (acidAndRetinoid) {
    return {
      productAId: a.id,
      productBId: b.id,
      kind: "cumulative-irritation",
      level: "CAUTION",
      title: "Possible cumulative irritation",
      triggers: ["One product is a leave-on acid and the other is a retinoid."],
      evidenceSummary:
        "DermNet advises against combining salicylic acid with topical retinoids on the same area unless a clinician directs it, because of irritation. This is a precaution, not a universal chemical incompatibility. Other acid and retinoid pairs are handled the same way when tolerance is unknown.",
      practicalAction: "Use them on different nights unless the label or a prescriber says they are meant to be used together.",
      sourceIds: ["dermnet-salicylic", "dermnet-retinoids"],
      uncertain: false,
    };
  }

  const acidAndBpo =
    (aClasses.has("exfoliant-acid") && bClasses.has("benzoyl-peroxide")) ||
    (bClasses.has("exfoliant-acid") && aClasses.has("benzoyl-peroxide"));
  if (acidAndBpo) {
    return {
      productAId: a.id,
      productBId: b.id,
      kind: "cumulative-irritation",
      level: "CAUTION",
      title: "Two potentially irritating acne treatments",
      triggers: ["An exfoliating acid and benzoyl peroxide are both present."],
      evidenceSummary:
        "DermNet's salicylic acid page says not to combine it with benzoyl peroxide unless a doctor directs that. Irritation is the concern being managed here.",
      practicalAction: "Separate them by time of day or by night unless you already tolerate the combination or a clinician directed it.",
      sourceIds: ["dermnet-salicylic"],
      uncertain: false,
    };
  }

  const retinoidAndBpo =
    (aClasses.has("retinoid") && bClasses.has("benzoyl-peroxide")) ||
    (bClasses.has("retinoid") && aClasses.has("benzoyl-peroxide"));
  if (retinoidAndBpo) {
    return {
      productAId: a.id,
      productBId: b.id,
      kind: "needs-verification",
      level: "INFORMATION",
      title: "Formulation-dependent combination",
      triggers: ["A retinoid and benzoyl peroxide are both on the shelf."],
      evidenceSummary:
        "DermNet says benzoyl peroxide may be combined with other topical therapy. Some fixed-combination products are designed to include both. A blanket rule of never mixing them is not used here. Irritation is still possible, and an individual label can forbid the combination.",
      practicalAction: "Follow each label. If either product says not to combine them, do not. If your skin is already irritated, do not start both at once.",
      sourceIds: ["dermnet-topical-acne", "dermnet-retinoids"],
      uncertain: true,
    };
  }

  const sharedIds = [...canonicalIds(a)].filter((id) => canonicalIds(b).has(id));
  const meaningful = sharedIds.filter(
    (id) => !["glycerin", "phenoxyethanol", "tocopherol", "dimethicone"].includes(id),
  );
  if (meaningful.length > 0) {
    triggers.push(...meaningful);
    return {
      productAId: a.id,
      productBId: b.id,
      kind: "ingredient-overlap",
      level: "INFORMATION",
      title: "Shared ingredients",
      triggers: meaningful,
      evidenceSummary:
        "The products list some of the same ingredients. Overlap is not harm by itself. It can make a routine redundant.",
      practicalAction: "You do not have to separate them for safety unless another rule applies. Prefer the one that matches your goal if they do the same job.",
      sourceIds: ["fda-labeling-guide"],
      uncertain: false,
    };
  }

  const supportive =
    (a.category === "moisturizer" && b.category === "sunscreen") ||
    (b.category === "moisturizer" && a.category === "sunscreen") ||
    (a.category === "cleanser" && (b.category === "moisturizer" || b.category === "sunscreen")) ||
    (b.category === "cleanser" && (a.category === "moisturizer" || a.category === "sunscreen")) ||
    ((aClasses.has("humectant") || aClasses.has("barrier-lipid")) && b.category === "moisturizer") ||
    ((bClasses.has("humectant") || bClasses.has("barrier-lipid")) && a.category === "moisturizer");
  if (supportive && !isIrritantActive(a) && !isIrritantActive(b)) {
    return {
      productAId: a.id,
      productBId: b.id,
      kind: "complementary",
      level: "COMPATIBLE",
      title: "Different jobs in a simple routine",
      triggers: [`${a.category} and ${b.category} cover different steps.`],
      evidenceSummary:
        "No specific conflict was identified from the available ingredient lists. Compatible here means no known issue in this data, not that the combination is universally safe.",
      practicalAction: "Use them in ordinary texture order: cleanser, watery serum, moisturizer, and sunscreen last in the morning.",
      sourceIds: ["fda-labeling-guide"],
      uncertain: false,
    };
  }

  return {
    productAId: a.id,
    productBId: b.id,
    kind: "no-specific-issue",
    level: "COMPATIBLE",
    title: "No specific issue identified",
    triggers: ["No allergen, label conflict, or overlapping irritant class was found in the stored data."],
    evidenceSummary:
      "COMPATIBLE means no specific issue was identified from the available data. It does not mean the combination has been proven safe for every person.",
    practicalAction: "Introduce one new leave-on product at a time if your tolerance is unknown.",
    sourceIds: ["fda-labeling-guide"],
    uncertain: false,
  };
}

export function assessInventory(products: readonly Product[], profile: UserProfile): ProductRelationship[] {
  const active = products.filter((product) => product.status === "in-use");
  const relationships: ProductRelationship[] = [];
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const left = active[i];
      const right = active[j];
      if (!left || !right) continue;
      relationships.push(assessPair(left, right, profile));
    }
  }
  return relationships.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level]);
}

export { LEVEL_RANK };
