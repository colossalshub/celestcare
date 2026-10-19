import { describe, expect, it } from "vitest";
import { assessPair } from "@/lib/skincare/compatibility-rules";
import { validateExplanation } from "@/lib/skincare/explanations";
import {
  applyExternalSuggestion,
  isScheduledToday,
  localDayIndex,
  optimizeRoutine,
} from "@/lib/skincare/routine-optimizer";
import { makeProduct, makeProfile } from "@/lib/test/factories";
import type { JournalEntry, RoutinePlan } from "@/lib/skincare/types";
import type { WeatherSnapshot } from "@/lib/weather/types";

function baseWeather(overrides: Partial<WeatherSnapshot> = {}): WeatherSnapshot {
  return {
    kind: "live",
    provider: "open-meteo",
    fetchedAt: "2026-10-19T14:30:00.000Z",
    observationTime: "2026-10-19T14:00",
    locationLabel: "Test",
    latitude: 40,
    longitude: -73,
    timezone: "America/New_York",
    temperatureC: 18,
    relativeHumidityPct: 55,
    precipitationMm: 0,
    windSpeedKph: 10,
    weatherCode: 2,
    uvIndexMaxToday: 4,
    unavailableFields: [],
    daily: [],
    attribution: "Weather data by Open-Meteo.com, CC BY 4.0",
    ...overrides,
  };
}

const now = new Date("2026-10-19T15:00:00.000Z");

function ids(plan: RoutinePlan): string[] {
  return [...plan.morning, ...plan.evening].map((step) => step.productId);
}

describe("routine optimizer safety", () => {
  const cleanser = makeProduct({
    id: "cleanser",
    name: "Cream cleanser",
    category: "cleanser",
    texture: "cream",
    ingredients: [{ name: "Glycerin" }, { name: "Panthenol" }],
  });
  const light = makeProduct({
    id: "light",
    name: "Light gel",
    category: "moisturizer",
    moisturizerWeight: "light",
    ingredients: [{ name: "Glycerin" }, { name: "Sodium hyaluronate" }],
  });
  const rich = makeProduct({
    id: "rich",
    name: "Rich cream",
    category: "moisturizer",
    moisturizerWeight: "rich",
    ingredients: [{ name: "Glycerin" }, { name: "Ceramide NP" }, { name: "Petrolatum" }],
  });
  const scented = makeProduct({
    id: "scented",
    name: "Petal cream",
    category: "moisturizer",
    moisturizerWeight: "rich",
    ingredients: [{ name: "Glycerin" }, { name: "Ceramide NP" }, { name: "Parfum" }],
    benefits: ["Hydration"],
  });
  const sunscreen = makeProduct({
    id: "screen",
    name: "Mineral screen",
    category: "sunscreen",
    spf: 50,
    broadSpectrum: true,
    waterResistant: true,
    waterResistantMinutes: 40,
    ingredients: [{ name: "Zinc oxide" }, { name: "Glycerin" }],
  });
  const salicylic = makeProduct({
    id: "sa",
    name: "Salicylic treatment",
    category: "treatment",
    applicationPeriod: "pm",
    ingredients: [{ name: "Salicylic acid" }],
  });
  const glycolic = makeProduct({
    id: "ga",
    name: "Glycolic liquid",
    category: "exfoliant",
    applicationPeriod: "pm",
    ingredients: [{ name: "Glycolic acid" }],
  });
  const retinol = makeProduct({
    id: "retinol",
    name: "Retinol night",
    category: "treatment",
    applicationPeriod: "pm",
    ingredients: [{ name: "Retinol" }],
  });

  const profile = makeProfile({
    goals: [
      { id: "hydration", priority: 1 },
      { id: "texture", priority: 2 },
    ],
    allergies: [
      {
        id: "fragrance",
        kind: "confirmed",
        label: "Fragrance",
        ingredientIds: ["fragrance"],
        customTerms: [],
        severity: "moderate",
      },
    ],
  });

  const shelf = [cleanser, light, rich, scented, sunscreen, salicylic, glycolic, retinol];

  it("keeps an allergen out even when that product would score well for hydration", () => {
    const plan = optimizeRoutine({ profile, products: shelf, now, mode: "balanced", journal: [], weather: null });
    expect(ids(plan)).not.toContain("scented");
    expect(plan.excluded.find((item) => item.productId === "scented")?.level).toBe("BLOCK");
    expect(ids(plan)).toContain("light");
  });

  it("does not clear a product with an unknown ingredient list when an allergy is recorded", () => {
    const unknown = makeProduct({
      id: "mist",
      name: "Unlabeled mist",
      category: "toner",
      ingredientListStatus: "unknown",
      ingredients: [],
    });
    const plan = optimizeRoutine({
      profile,
      products: [cleanser, light, sunscreen, unknown],
      now,
      mode: "balanced",
      journal: [],
      weather: null,
    });
    expect(ids(plan)).not.toContain("mist");
    const exclusion = plan.excluded.find((item) => item.productId === "mist");
    expect(exclusion?.code).toBe("incomplete-ingredients");
    expect(exclusion?.level).toBe("UNKNOWN");
  });

  it("does not schedule two leave-on exfoliants on the same night", () => {
    const plan = optimizeRoutine({
      profile,
      products: [cleanser, light, sunscreen, salicylic, glycolic],
      now,
      mode: "balanced",
      journal: [],
      weather: null,
    });
    const eveningActives = plan.evening.filter((step) => step.productId === "sa" || step.productId === "ga");
    expect(eveningActives).toHaveLength(1);
    expect(plan.excluded.some((item) => item.code === "alternated")).toBe(true);
  });

  it("simplifies the routine after reported irritation", () => {
    const journal: JournalEntry[] = [
      {
        id: "j1",
        date: "2026-10-18",
        comfort: "uncomfortable",
        drynessOiliness: "dry",
        irritation: "moderate",
        breakouts: "not-logged",
        notes: "Stinging after the acid.",
        emergencySymptoms: false,
        createdAt: "2026-10-18T12:00:00.000Z",
      },
    ];
    const plan = optimizeRoutine({
      profile,
      products: shelf,
      now,
      mode: "goal-focused",
      journal,
      weather: null,
    });
    expect(plan.modeUsed).toBe("recovery");
    expect(ids(plan)).not.toContain("sa");
    expect(ids(plan)).not.toContain("ga");
    expect(ids(plan)).not.toContain("retinol");
    expect(plan.excluded.some((item) => item.code === "irritation-hold")).toBe(true);
  });

  it("honors a prescription label over a higher-scoring exfoliant", () => {
    const adapalene = makeProduct({
      id: "adapalene",
      name: "Adapalene gel",
      category: "treatment",
      prescription: true,
      applicationPeriod: "pm",
      schedule: { period: "pm", timesPerWeek: 7, exact: true },
      doNotCombineWith: ["exfoliant-acid"],
      prescriberInstructions: "Pea-sized amount nightly. Do not use other leave-on exfoliants.",
      ingredients: [{ name: "Adapalene" }],
    });
    const plan = optimizeRoutine({
      profile: makeProfile({ goals: [{ id: "texture", priority: 1 }] }),
      products: [cleanser, light, sunscreen, glycolic, salicylic, adapalene],
      now,
      mode: "goal-focused",
      journal: [],
      weather: null,
    });
    expect(ids(plan)).toContain("adapalene");
    expect(ids(plan)).not.toContain("ga");
    expect(ids(plan)).not.toContain("sa");
    expect(plan.excluded.filter((item) => item.code === "label-conflict").map((item) => item.productId).sort()).toEqual([
      "ga",
      "sa",
    ]);
  });

  it("does not raise a prescription above its recorded weekly frequency", () => {
    let offDay: Date | null = null;
    let onDay: Date | null = null;
    for (let day = 1; day <= 21; day += 1) {
      const date = new Date(2026, 0, day, 12, 0, 0);
      const slot = localDayIndex(date) % 7;
      if (slot >= 3 && !offDay) offDay = date;
      if (slot < 3 && !onDay) onDay = date;
    }
    expect(offDay).not.toBeNull();
    expect(onDay).not.toBeNull();
    const rx = makeProduct({
      id: "rx",
      name: "Night retinoid",
      category: "treatment",
      prescription: true,
      schedule: { period: "pm", timesPerWeek: 3, exact: true },
      frequency: "Three nights a week",
      ingredients: [{ name: "Tretinoin" }],
    });
    expect(isScheduledToday(rx, onDay!)).toBe(true);
    expect(isScheduledToday(rx, offDay!)).toBe(false);
    const offPlan = optimizeRoutine({
      profile: makeProfile(),
      products: [cleanser, light, sunscreen, rx],
      now: offDay!,
      mode: "minimal",
      journal: [],
      weather: null,
    });
    expect(ids(offPlan)).not.toContain("rx");
    expect(offPlan.excluded.find((item) => item.productId === "rx")?.code).toBe("not-scheduled-today");
    const onPlan = optimizeRoutine({
      profile: makeProfile(),
      products: [cleanser, light, sunscreen, rx],
      now: onDay!,
      mode: "minimal",
      journal: [],
      weather: null,
    });
    expect(ids(onPlan)).toContain("rx");
    expect(onPlan.evening.filter((step) => step.productId === "rx")).toHaveLength(1);
  });

  it("rejects an external suggestion that adds a blocked product", () => {
    const plan = optimizeRoutine({ profile, products: shelf, now, mode: "balanced", journal: [], weather: null });
    const guarded = applyExternalSuggestion(plan, { addProductIds: ["scented"] }, shelf);
    expect(ids(guarded)).not.toContain("scented");
    expect(guarded.rejectedExternalProductIds).toContain("scented");
    const prose = validateExplanation(guarded, "You should use Petal cream tonight. It is safe for everyone.");
    expect(prose.ok).toBe(false);
  });

  it("withholds an unknown treatment instead of recommending it on a goal score", () => {
    const mystery = makeProduct({
      id: "mystery",
      name: "Mystery active",
      category: "treatment",
      ingredientListStatus: "incomplete",
      ingredients: [{ name: "Active complex" }],
      benefits: ["Clinically transformative texture"],
    });
    const plan = optimizeRoutine({
      profile: makeProfile({ goals: [{ id: "texture", priority: 1 }], allergies: [] }),
      products: [cleanser, light, sunscreen, mystery],
      now,
      mode: "goal-focused",
      journal: [],
      weather: null,
    });
    expect(ids(plan)).not.toContain("mystery");
    expect(plan.excluded.find((item) => item.productId === "mystery")?.code).toBe("insufficient-evidence");
  });

  it("returns an empty routine when the shelf has no products", () => {
    const plan = optimizeRoutine({
      profile: makeProfile({ allergies: [] }),
      products: [],
      now,
      mode: "balanced",
      journal: [],
      weather: null,
    });
    expect(plan.morning).toHaveLength(0);
    expect(plan.evening).toHaveLength(0);
    expect(plan.uncertainties.join(" ")).toContain("no routine was invented");
  });

  it("ignores stale weather that would otherwise swap moisturizers", () => {
    const fresh = optimizeRoutine({
      profile: makeProfile({ allergies: [], skinType: "combination" }),
      products: [cleanser, light, rich, sunscreen],
      now,
      mode: "minimal",
      journal: [],
      weather: baseWeather({ relativeHumidityPct: 28, temperatureC: 11, uvIndexMaxToday: 2 }),
    });
    expect(ids(fresh)).toContain("rich");
    expect(fresh.differsFromBaseline).toBe(true);

    const stale = optimizeRoutine({
      profile: makeProfile({ allergies: [], skinType: "combination" }),
      products: [cleanser, light, rich, sunscreen],
      now,
      mode: "minimal",
      journal: [],
      weather: baseWeather({
        fetchedAt: "2026-10-19T08:00:00.000Z",
        relativeHumidityPct: 28,
        temperatureC: 11,
      }),
    });
    expect(stale.weatherStale).toBe(true);
    expect(stale.weatherApplied).toBe(false);
    expect(ids(stale)).toContain("light");
    expect(ids(stale)).not.toContain("rich");
    expect(stale.differsFromBaseline).toBe(false);
  });

  it("does not swap products when temperature is the only mild change", () => {
    const plan = optimizeRoutine({
      profile: makeProfile({ allergies: [], skinType: "combination" }),
      products: [cleanser, light, rich, sunscreen],
      now,
      mode: "minimal",
      journal: [],
      weather: baseWeather({ temperatureC: 22, relativeHumidityPct: 52, uvIndexMaxToday: 2 }),
    });
    expect(plan.differsFromBaseline).toBe(false);
    expect(ids(plan)).toContain("light");
    expect(plan.weatherNotes.join(" ")).toContain("small temperature difference");
  });

  it("flags a retinoid and acid pair as caution rather than a universal ban", () => {
    const relation = assessPair(salicylic, retinol, profile);
    expect(relation.level).toBe("CAUTION");
    expect(relation.kind).toBe("cumulative-irritation");
    expect(relation.evidenceSummary.toLowerCase()).not.toContain("dangerous");
  });

  it("describes benzoyl peroxide plus a retinoid as formulation-dependent", () => {
    const peroxide = makeProduct({
      id: "bpo",
      name: "Peroxide gel",
      category: "treatment",
      ingredients: [{ name: "Benzoyl peroxide" }],
    });
    const relation = assessPair(peroxide, retinol, profile);
    expect(relation.level).toBe("INFORMATION");
    expect(relation.kind).toBe("needs-verification");
  });
});
