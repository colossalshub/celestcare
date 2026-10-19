import { getAliasRecord, lookupAlias } from "@/lib/skincare/ingredient-aliases";
import { normalizeIngredientName, termAppearsIn } from "@/lib/skincare/ingredient-normalization";
import type {
  AllergyEntry,
  IngredientListStatus,
  Product,
  ProductIngredient,
  SafetyLevel,
  UserProfile,
} from "@/lib/skincare/types";

export interface AllergyHit {
  allergyId: string;
  allergyLabel: string;
  kind: AllergyEntry["kind"];
  matchedTerm: string;
  canonicalId?: string;
  confidence: "exact" | "alias" | "group";
  level: Extract<SafetyLevel, "BLOCK" | "HIGH_CAUTION" | "CAUTION">;
}

export interface ProductSafetyScreen {
  productId: string;
  listStatus: IngredientListStatus;
  listComplete: boolean;
  matches: AllergyHit[];
  assessment: "blocked" | "high-caution" | "incomplete" | "no-match-found";
  summary: string;
}

export function isIngredientListComplete(status: IngredientListStatus): boolean {
  return status === "user-confirmed" || status === "manufacturer" || status === "database";
}

export function resolveIngredient(ingredient: ProductIngredient): ProductIngredient {
  const canonicalId = ingredient.canonicalId ?? lookupAlias(ingredient.name) ?? undefined;
  return {
    ...ingredient,
    canonicalId,
    unmatched: !canonicalId,
  };
}

export function resolveProductIngredients(product: Product): Product {
  return {
    ...product,
    ingredients: product.ingredients.map(resolveIngredient),
  };
}

function allergyLevel(entry: AllergyEntry): AllergyHit["level"] {
  if (entry.kind === "confirmed") return "BLOCK";
  if (entry.severity === "severe") return "BLOCK";
  if (entry.kind === "suspected" || entry.kind === "prior-reaction") return "HIGH_CAUTION";
  return "CAUTION";
}

function expandedIds(entry: AllergyEntry): Set<string> {
  const ids = new Set(entry.ingredientIds);
  for (const id of entry.ingredientIds) {
    const record = getAliasRecord(id);
    if (!record) continue;
    if (record.allergyGroups.includes("fragrance") || id === "fragrance") {
      for (const candidate of ["fragrance", "limonene", "linalool", "citronellol", "geraniol", "eugenol", "citral", "hexyl-cinnamal", "coumarin"]) {
        ids.add(candidate);
      }
    }
  }
  return ids;
}

export function screenProductAllergies(product: Product, allergies: readonly AllergyEntry[]): AllergyHit[] {
  const resolved = resolveProductIngredients(product);
  const hits: AllergyHit[] = [];
  for (const allergy of allergies) {
    const ids = expandedIds(allergy);
    const terms = allergy.customTerms.map((term) => ({ raw: term, normalized: normalizeIngredientName(term) }));
    for (const ingredient of resolved.ingredients) {
      const normalized = normalizeIngredientName(ingredient.name);
      if (ingredient.canonicalId && ids.has(ingredient.canonicalId)) {
        const viaGroup = !allergy.ingredientIds.includes(ingredient.canonicalId);
        hits.push({
          allergyId: allergy.id,
          allergyLabel: allergy.label,
          kind: allergy.kind,
          matchedTerm: ingredient.name,
          canonicalId: ingredient.canonicalId,
          confidence: viaGroup ? "group" : "alias",
          level: allergyLevel(allergy),
        });
        continue;
      }
      for (const term of terms) {
        if (term.normalized && termAppearsIn(normalized, term.normalized)) {
          hits.push({
            allergyId: allergy.id,
            allergyLabel: allergy.label,
            kind: allergy.kind,
            matchedTerm: ingredient.name,
            canonicalId: ingredient.canonicalId,
            confidence: "exact",
            level: allergyLevel(allergy),
          });
        }
      }
    }
  }
  return hits;
}

export function screenProduct(product: Product, profile: UserProfile): ProductSafetyScreen {
  const matches = screenProductAllergies(product, profile.allergies);
  const listComplete = isIngredientListComplete(product.ingredientListStatus);
  const blocked = matches.some((match) => match.level === "BLOCK");
  const caution = matches.some((match) => match.level === "HIGH_CAUTION" || match.level === "CAUTION");
  const severeReaction = product.reactions.some((reaction) => reaction.severity === "severe" || reaction.emergency);

  let assessment: ProductSafetyScreen["assessment"];
  if (blocked || severeReaction) assessment = "blocked";
  else if (!listComplete) assessment = "incomplete";
  else if (caution) assessment = "high-caution";
  else assessment = "no-match-found";

  const summary = summaryFor(assessment, matches, listComplete, severeReaction);
  return {
    productId: product.id,
    listStatus: product.ingredientListStatus,
    listComplete,
    matches,
    assessment,
    summary,
  };
}

function summaryFor(
  assessment: ProductSafetyScreen["assessment"],
  matches: AllergyHit[],
  listComplete: boolean,
  severeReaction: boolean,
): string {
  if (severeReaction) {
    return "A severe or emergency reaction is recorded for this product, so it is not recommended.";
  }
  if (assessment === "blocked") {
    const first = matches.find((match) => match.level === "BLOCK");
    return first
      ? `Matches the recorded ${first.kind === "confirmed" ? "allergy" : "reaction"} “${first.allergyLabel}” via ${first.matchedTerm}.`
      : "Blocked by a recorded allergy or severe reaction.";
  }
  if (!listComplete) {
    return "The ingredient list is incomplete or unconfirmed, so this product cannot be cleared for allergy safety.";
  }
  if (assessment === "high-caution") {
    return "A suspected sensitivity or prior reaction matches an ingredient. It is kept out of the automatic routine.";
  }
  return matches.length === 0 && listComplete
    ? "No recorded allergen matched this ingredient list. That is not a determination that the product is safe."
    : "Review the match before using this product.";
}

export function hasConfirmedAllergy(profile: UserProfile): boolean {
  return profile.allergies.some((allergy) => allergy.kind === "confirmed" || allergy.severity === "severe");
}
