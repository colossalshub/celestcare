import type { Product, ProductIngredient, UserProfile } from "@/lib/skincare/types";

export function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "profile-test",
    skinType: "combination",
    sensitivity: "moderate",
    concerns: [],
    goals: [{ id: "hydration", priority: 1 }],
    allergies: [],
    fragranceSensitive: false,
    routineLength: "standard",
    outdoorExposure: "commute",
    pregnancyStatus: "not-applicable",
    needsProfessionalCare: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function ing(name: string, extra: Partial<ProductIngredient> = {}): ProductIngredient {
  return { name, ...extra };
}

export function makeProduct(overrides: Partial<Product> & Pick<Product, "id" | "name">): Product {
  return {
    brand: "Example",
    category: "serum",
    status: "in-use",
    ingredients: [],
    ingredientListStatus: "user-confirmed",
    provenance: { source: "user-label", detail: "Test fixture copied from a label." },
    benefits: [],
    applicationPeriod: "both",
    prescription: false,
    spf: null,
    broadSpectrum: null,
    waterResistant: null,
    waterResistantMinutes: null,
    remaining: "plenty",
    reactions: [],
    newProduct: false,
    moisturizerWeight: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
