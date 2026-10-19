import { describe, expect, it } from "vitest";
import { screenProduct } from "@/lib/skincare/allergy-screening";
import type { Product, UserProfile } from "@/lib/skincare/types";
import { makeProduct, makeProfile } from "@/lib/test/factories";

function fragranceProfile(): UserProfile {
  return makeProfile({
    allergies: [
      {
        id: "allergy-fragrance",
        kind: "confirmed",
        label: "Fragrance",
        ingredientIds: ["fragrance"],
        customTerms: [],
        severity: "moderate",
      },
    ],
  });
}

describe("allergy screening", () => {
  it("blocks a confirmed fragrance allergy when the label says parfum", () => {
    const product = makeProduct({
      id: "soft",
      name: "Soft cream",
      ingredients: [{ name: "Parfum" }],
    });
    const screen = screenProduct(product, fragranceProfile());
    expect(screen.assessment).toBe("blocked");
    expect(screen.matches[0]?.canonicalId).toBe("fragrance");
    expect(screen.matches[0]?.confidence).toBe("alias");
    expect(screen.summary.toLowerCase()).not.toContain("safe");
  });

  it("matches limonene as part of a confirmed fragrance allergy", () => {
    const product = makeProduct({
      id: "citrus",
      name: "Citrus gel",
      ingredients: [{ name: "Limonene" }],
    });
    const screen = screenProduct(product, fragranceProfile());
    expect(screen.assessment).toBe("blocked");
    expect(screen.matches[0]?.confidence).toBe("group");
  });

  it("does not clear an incomplete ingredient list", () => {
    const product = makeProduct({
      id: "unknown",
      name: "Unlabeled mist",
      ingredientListStatus: "unknown",
      ingredients: [],
    });
    const screen = screenProduct(product, fragranceProfile());
    expect(screen.assessment).toBe("incomplete");
    expect(screen.listComplete).toBe(false);
    expect(screen.summary).toContain("cannot be cleared");
  });

  it("reports no match without calling a complete list allergy-safe", () => {
    const product = makeProduct({
      id: "plain",
      name: "Plain cream",
      ingredients: [{ name: "Glycerin" }, { name: "Water" }],
    });
    const screen = screenProduct(product, fragranceProfile());
    expect(screen.assessment).toBe("no-match-found");
    expect(screen.summary).toContain("not a determination that the product is safe");
  });

  it("keeps a suspected sensitivity at high caution rather than a confirmed block", () => {
    const product = makeProduct({
      id: "tea",
      name: "Tea serum",
      ingredients: [{ name: "shea butter" }],
    });
    const profile = makeProfile({
      allergies: [
        {
          id: "shea",
          kind: "suspected",
          label: "Shea butter",
          ingredientIds: [],
          customTerms: ["shea butter"],
          severity: "mild",
        },
      ],
    });
    const screen = screenProduct(product, profile);
    expect(screen.assessment).toBe("high-caution");
    expect(screen.matches[0]?.level).toBe("HIGH_CAUTION");
  });
});

describe("product validation helpers", () => {
  it("flags duplicate exfoliating acids", async () => {
    const { findActiveOverlaps } = await import("@/lib/skincare/product-validation");
    const products: Product[] = [
      makeProduct({
        id: "sa",
        name: "SA",
        category: "treatment",
        ingredients: [{ name: "Salicylic acid" }],
      }),
      makeProduct({
        id: "ga",
        name: "GA",
        category: "exfoliant",
        ingredients: [{ name: "Glycolic acid" }],
      }),
    ];
    const overlaps = findActiveOverlaps(products);
    expect(overlaps.some((item) => item.key === "exfoliant-acid")).toBe(true);
  });
});
