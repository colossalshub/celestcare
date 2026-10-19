import { classesForProduct, canonicalIds } from "@/lib/skincare/product-validation";
import { evidenceWeight, gradeForClaims } from "@/lib/skincare/evidence-ranking";
import type { GoalId, Product, UserProfile } from "@/lib/skincare/types";

export interface GoalDefinition {
  id: GoalId;
  label: string;
  expectation: string;
}

export const GOAL_DEFINITIONS: readonly GoalDefinition[] = [
  {
    id: "acne-prone",
    label: "Acne-prone skin",
    expectation: "Some leave-on ingredients have acne evidence. A product name is not a treatment plan, and this app does not diagnose acne.",
  },
  {
    id: "even-tone",
    label: "More even-looking tone",
    expectation: "Visible tone can change slowly. No product here is described as erasing discoloration.",
  },
  {
    id: "hyperpigmentation",
    label: "Hyperpigmentation concerns",
    expectation: "Dark marks have many causes. CelestCare will not identify the cause from a photo or a product list.",
  },
  {
    id: "hydration",
    label: "Hydration",
    expectation: "Moisturizers and humectants can help skin feel more comfortable. Weather and ingredient lists do not measure your skin's water content.",
  },
  {
    id: "barrier",
    label: "Barrier support",
    expectation: "A simpler routine and bland moisturizers are the practical starting point. The app cannot diagnose a damaged barrier.",
  },
  {
    id: "oiliness",
    label: "Oiliness",
    expectation: "Niacinamide has some evidence for sebum appearance. Stripping the skin with extra cleansers is not a goal.",
  },
  {
    id: "texture",
    label: "Texture",
    expectation: "Acids and retinoids are sometimes used for texture, with irritation as the tradeoff. Results are not guaranteed.",
  },
  {
    id: "fine-lines",
    label: "Fine-line appearance",
    expectation: "Prescription tretinoin has photoaging evidence that should not be copied onto every cosmetic retinol.",
  },
  {
    id: "sensitive-simplification",
    label: "Sensitive-skin simplification",
    expectation: "Fewer products, fewer new actives, and no fragrance when that is a recorded issue.",
  },
  {
    id: "maintenance",
    label: "General maintenance",
    expectation: "Cleanse, moisturize, and use a labeled sunscreen. Extra steps need a reason.",
  },
];

export function goalDefinition(id: GoalId): GoalDefinition {
  return GOAL_DEFINITIONS.find((goal) => goal.id === id) ?? GOAL_DEFINITIONS[GOAL_DEFINITIONS.length - 1]!;
}

export interface GoalSupport {
  supports: boolean;
  claimIds: string[];
  limitation: string;
}

const CONCENTRATION =
  "The ingredient list does not prove that this finished product contains an effective concentration.";

export function goalSupport(product: Product, goalId: GoalId): GoalSupport {
  const ids = canonicalIds(product);
  const classes = classesForProduct(product);
  const none: GoalSupport = {
    supports: false,
    claimIds: [],
    limitation: "Nothing in the stored ingredient list maps to this goal.",
  };

  switch (goalId) {
    case "hydration":
      if (product.category === "moisturizer" || product.category === "oil" || classes.has("humectant") || classes.has("barrier-lipid")) {
        return {
          supports: true,
          claimIds: ids.has("niacinamide") ? ["niacinamide-topical"] : [],
          limitation: `Moisturizers and humectants are grouped here for comfort. ${CONCENTRATION}`,
        };
      }
      return none;
    case "barrier":
      if (classes.has("barrier-lipid") || ids.has("niacinamide") || ids.has("panthenol") || product.category === "moisturizer") {
        return {
          supports: true,
          claimIds: ids.has("niacinamide") ? ["niacinamide-topical"] : [],
          limitation: ids.has("niacinamide")
            ? `DermNet summarizes barrier-related nicotinamide findings. ${CONCENTRATION}`
            : `Barrier lipids and bland moisturizers are organizational matches. No separate clinical claim is stored for every lipid. ${CONCENTRATION}`,
        };
      }
      return none;
    case "oiliness":
      if (ids.has("niacinamide")) {
        return {
          supports: true,
          claimIds: ["niacinamide-topical"],
          limitation: `DermNet describes reduced sebum appearance in specific niacinamide studies. ${CONCENTRATION}`,
        };
      }
      return none;
    case "acne-prone":
      if (ids.has("salicylic-acid") || ids.has("benzoyl-peroxide") || ids.has("adapalene") || ids.has("tretinoin") || ids.has("azelaic-acid") || ids.has("niacinamide")) {
        const claimIds = [
          ids.has("salicylic-acid") ? "salicylic-acne" : null,
          ids.has("benzoyl-peroxide") ? "bpo-acne" : null,
          ids.has("adapalene") || ids.has("tretinoin") ? "retinoid-uses" : null,
          ids.has("niacinamide") ? "niacinamide-topical" : null,
        ].filter((id): id is string => Boolean(id));
        return {
          supports: true,
          claimIds,
          limitation: `These ingredients are associated with acne care in the reviewed sources. This is not a diagnosis or a prescription. ${CONCENTRATION}`,
        };
      }
      return none;
    case "texture":
      if (classes.has("exfoliant-acid") || classes.has("retinoid")) {
        return {
          supports: true,
          claimIds: classes.has("retinoid") ? ["retinoid-uses", "retinol-distinction"] : classes.has("exfoliant-acid") && ids.has("salicylic-acid") ? ["salicylic-acne"] : [],
          limitation: classes.has("exfoliant-acid") && !ids.has("salicylic-acid")
            ? `This acid is tracked for texture routines, but a product-specific clinical claim was not reviewed. ${CONCENTRATION}`
            : `Texture changes are slow and irritation is common. ${CONCENTRATION}`,
        };
      }
      return none;
    case "even-tone":
    case "hyperpigmentation":
      if (ids.has("niacinamide") || ids.has("tretinoin") || ids.has("adapalene")) {
        return {
          supports: true,
          claimIds: [
            ids.has("niacinamide") ? "niacinamide-topical" : null,
            ids.has("tretinoin") || ids.has("adapalene") ? "retinoid-uses" : null,
          ].filter((id): id is string => Boolean(id)),
          limitation: `DermNet discusses nicotinamide and prescription retinoids for uneven pigment in specific contexts. That is not a promise about this product, and sunscreen matters because UV can darken spots. ${CONCENTRATION}`,
        };
      }
      return none;
    case "fine-lines":
      if (ids.has("tretinoin")) {
        return {
          supports: true,
          claimIds: ["retinoid-uses"],
          limitation: `The photoaging statement DermNet makes is about long-term topical tretinoin, used as prescribed. ${CONCENTRATION}`,
        };
      }
      if (classes.has("retinoid")) {
        return {
          supports: true,
          claimIds: ["retinol-distinction"],
          limitation: "Cosmetic retinoids are not given the tretinoin photoaging claim.",
        };
      }
      return none;
    case "sensitive-simplification":
      if (!classes.has("retinoid") && !classes.has("exfoliant-acid") && !classes.has("benzoyl-peroxide") && !classes.has("fragrance") && !classes.has("vitamin-c")) {
        return {
          supports: true,
          claimIds: [],
          limitation: "Included because it does not add a tracked irritant or fragrance in the stored list.",
        };
      }
      return none;
    case "maintenance":
      if (product.category === "cleanser" || product.category === "moisturizer" || product.category === "sunscreen") {
        return {
          supports: true,
          claimIds: product.category === "sunscreen" ? ["sunscreen-essentials", "sunscreen-reapply"] : [],
          limitation: product.category === "sunscreen" ? "Only label fields marked on this product are treated as SPF, broad spectrum, or water resistance." : "A short cleanse-and-moisturize routine is the maintenance default.",
        };
      }
      return none;
    default:
      return none;
  }
}

export function scoreProductForGoals(product: Product, profile: UserProfile): number {
  let score = 0;
  const goals = [...profile.goals].sort((a, b) => a.priority - b.priority);
  for (const goal of goals) {
    const support = goalSupport(product, goal.id);
    if (!support.supports) continue;
    const priorityWeight = Math.max(1, 5 - goal.priority);
    score += priorityWeight * (evidenceWeight(gradeForClaims(support.claimIds)) + 1);
  }
  return score;
}
