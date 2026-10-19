import { z } from "zod";
import { getAliasRecord, lookupAlias } from "@/lib/skincare/ingredient-aliases";
import { parseIngredientPaste } from "@/lib/skincare/ingredient-normalization";
import { resolveProductIngredients } from "@/lib/skincare/allergy-screening";
import type { IngredientClass, Product, ProductCategory, ProductIngredient } from "@/lib/skincare/types";

const categoryValues = [
  "cleanser",
  "toner",
  "serum",
  "treatment",
  "exfoliant",
  "moisturizer",
  "sunscreen",
  "oil",
  "eye",
  "mask",
  "other",
] as const satisfies readonly ProductCategory[];

const classValues = [
  "retinoid",
  "exfoliant-acid",
  "benzoyl-peroxide",
  "vitamin-c",
  "humectant",
  "barrier-lipid",
  "niacinamide",
  "sunscreen-filter",
  "fragrance",
  "preservative",
] as const satisfies readonly IngredientClass[];

export const productInputSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a product name.").max(120),
    brand: z.string().trim().min(1, "Enter a brand, or “Unknown” if it is not on the label.").max(120),
    category: z.enum(categoryValues),
    status: z.enum(["in-use", "paused", "finished", "discarded"]),
    ingredientText: z.string().max(8000),
    ingredientListStatus: z.enum([
      "user-confirmed",
      "manufacturer",
      "database",
      "extracted-unconfirmed",
      "incomplete",
      "unknown",
    ]),
    provenanceSource: z.enum([
      "user-label",
      "manufacturer",
      "database",
      "extracted",
      "illustrative-demo",
      "unknown",
    ]),
    provenanceDetail: z.string().trim().min(1, "Describe where the ingredient information came from.").max(400),
    confirmedFromLabel: z.boolean(),
    texture: z.string().max(80).optional(),
    instructions: z.string().max(800).optional(),
    frequency: z.string().max(160).optional(),
    amountGuidance: z.string().max(200).optional(),
    waitTime: z.string().max(160).optional(),
    applicationPeriod: z.enum(["am", "pm", "both", "as-needed"]),
    prescription: z.boolean(),
    prescriberInstructions: z.string().max(800).optional(),
    doNotCombineWith: z.array(z.enum(classValues)).optional(),
    timesPerWeek: z.number().int().min(1).max(7).optional(),
    scheduleExact: z.boolean().optional(),
    schedulePeriod: z.enum(["am", "pm", "both"]).optional(),
    spf: z.number().min(1).max(100).nullable().optional(),
    broadSpectrum: z.boolean().nullable().optional(),
    waterResistant: z.boolean().nullable().optional(),
    waterResistantMinutes: z.union([z.literal(40), z.literal(80)]).nullable().optional(),
    purchaseDate: z.string().optional(),
    openedDate: z.string().optional(),
    expiryDate: z.string().optional(),
    paoMonths: z.number().int().min(1).max(36).nullable().optional(),
    remaining: z.enum(["full", "plenty", "half", "low", "empty", "unknown"]),
    moisturizerWeight: z.enum(["light", "medium", "rich"]).nullable().optional(),
    newProduct: z.boolean(),
    benefitsText: z.string().max(400).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.ingredientListStatus === "user-confirmed" && !value.confirmedFromLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmedFromLabel"],
        message: "Confirm that you checked this list against the product label before marking it verified.",
      });
    }
    if (value.waterResistant === true && value.waterResistantMinutes == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["waterResistantMinutes"],
        message: "Enter 40 or 80 only if the label states that water-resistance time.",
      });
    }
    if (value.prescription && value.scheduleExact && value.timesPerWeek == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["timesPerWeek"],
        message: "Enter the prescribed days per week so the routine does not invent a frequency.",
      });
    }
  });

export type ProductInput = z.infer<typeof productInputSchema>;

export function ingredientsFromText(text: string): ProductIngredient[] {
  return parseIngredientPaste(text).map((name) => {
    const canonicalId = lookupAlias(name) ?? undefined;
    return { name, canonicalId, unmatched: !canonicalId };
  });
}

export function canonicalIds(product: Product): Set<string> {
  const resolved = resolveProductIngredients(product);
  return new Set(
    resolved.ingredients.flatMap((ingredient) => (ingredient.canonicalId ? [ingredient.canonicalId] : [])),
  );
}

export function classesForProduct(product: Product): Set<IngredientClass> {
  const found = new Set<IngredientClass>();
  for (const id of canonicalIds(product)) {
    const record = getAliasRecord(id);
    if (!record) continue;
    for (const item of record.classes) found.add(item);
  }
  return found;
}

export interface ActiveOverlap {
  key: string;
  label: string;
  productIds: string[];
  productNames: string[];
}

const OVERLAP_GROUPS: { className: IngredientClass; label: string }[] = [
  { className: "exfoliant-acid", label: "Exfoliating acids" },
  { className: "retinoid", label: "Retinoids" },
  { className: "benzoyl-peroxide", label: "Benzoyl peroxide" },
  { className: "vitamin-c", label: "Vitamin C" },
  { className: "niacinamide", label: "Niacinamide" },
];

export function findActiveOverlaps(products: readonly Product[]): ActiveOverlap[] {
  const active = products.filter((product) => product.status === "in-use");
  const overlaps: ActiveOverlap[] = [];
  for (const group of OVERLAP_GROUPS) {
    const matched = active.filter((product) => classesForProduct(product).has(group.className));
    if (matched.length < 2) continue;
    overlaps.push({
      key: group.className,
      label: group.label,
      productIds: matched.map((product) => product.id),
      productNames: matched.map((product) => product.name),
    });
  }
  return overlaps;
}

export function missingIngredientInfo(product: Product): boolean {
  return (
    product.ingredientListStatus === "unknown" ||
    product.ingredientListStatus === "incomplete" ||
    product.ingredientListStatus === "extracted-unconfirmed" ||
    product.ingredients.length === 0
  );
}

export function isIrritantActive(product: Product): boolean {
  const classes = classesForProduct(product);
  return (
    classes.has("retinoid") ||
    classes.has("exfoliant-acid") ||
    classes.has("benzoyl-peroxide") ||
    classes.has("vitamin-c")
  );
}

export function isOilCleanser(product: Product): boolean {
  if (product.category !== "cleanser") return false;
  const texture = `${product.texture ?? ""} ${product.name}`.toLowerCase();
  return texture.includes("oil") || texture.includes("balm");
}
