import { createId, emptyData, type AppData } from "@/lib/state/model";
import type { Product, UserProfile } from "@/lib/skincare/types";
import type { WeatherSnapshot } from "@/lib/weather/types";
import { OPEN_METEO_ATTRIBUTION } from "@/lib/weather/types";

const STAMP = "2026-08-01T00:00:00.000Z";

function product(partial: Pick<Product, "id" | "name" | "brand" | "category"> & Partial<Product>): Product {
  return {
    status: "in-use",
    ingredients: [],
    ingredientListStatus: "user-confirmed",
    provenance: {
      source: "illustrative-demo",
      detail: "Illustrative demo formula. Not a commercial product and not a manufacturer disclosure.",
      retrievedAt: STAMP,
    },
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
    createdAt: STAMP,
    updatedAt: STAMP,
    ...partial,
  };
}

export function demoWeather(now: Date): WeatherSnapshot {
  const date = now.toISOString().slice(0, 10);
  return {
    kind: "demo-scenario",
    provider: "open-meteo",
    fetchedAt: now.toISOString(),
    observationTime: null,
    locationLabel: "Illustrative coastal morning",
    latitude: 47.6,
    longitude: -122.3,
    timezone: "America/Los_Angeles",
    temperatureC: 11,
    relativeHumidityPct: 30,
    precipitationMm: 0.2,
    windSpeedKph: 32,
    weatherCode: 61,
    uvIndexMaxToday: 6,
    unavailableFields: [],
    daily: [
      {
        date,
        uvIndexMax: 6,
        precipitationSumMm: 1.4,
        temperatureMaxC: 14,
        temperatureMinC: 8,
        weatherCode: 61,
        precipitationProbabilityMax: 60,
      },
    ],
    attribution: `${OPEN_METEO_ATTRIBUTION}. This particular snapshot is illustrative demo data, not a live forecast.`,
  };
}

export function createDemoData(_now = new Date("2026-10-19T15:00:00.000Z")): AppData {
  const profile: UserProfile = {
    id: "demo-profile",
    skinType: "combination",
    sensitivity: "moderate",
    concerns: ["Tightness after cleansing", "Uneven texture"],
    goals: [
      { id: "hydration", priority: 1 },
      { id: "barrier", priority: 2 },
      { id: "texture", priority: 3 },
    ],
    allergies: [
      {
        id: "demo-fragrance",
        kind: "confirmed",
        label: "Fragrance",
        ingredientIds: ["fragrance"],
        customTerms: [],
        severity: "moderate",
        notes: "Demo record. Hives after a scented moisturizer.",
      },
    ],
    fragranceSensitive: true,
    dermatologistGuidance: "",
    routineLength: "standard",
    morningTime: "07:30",
    eveningTime: "22:00",
    outdoorExposure: "commute",
    climateNote: "Demo profile only.",
    pregnancyStatus: "not-applicable",
    needsProfessionalCare: false,
    createdAt: STAMP,
    updatedAt: STAMP,
  };

  const products: Product[] = [
    product({
      id: "northwater",
      name: "Northwater Cream Cleanser",
      brand: "CelestCare Demo",
      category: "cleanser",
      texture: "cream",
      ingredients: [
        { name: "Glycerin", canonicalId: "glycerin" },
        { name: "Panthenol", canonicalId: "panthenol" },
        { name: "Ceramide NP", canonicalId: "ceramide-np" },
      ],
      benefits: ["First cleanse step"],
      instructions: "Massage onto damp skin and rinse.",
      frequency: "Morning and evening",
      remaining: "plenty",
    }),
    product({
      id: "reservoir",
      name: "Reservoir Gel Cream",
      brand: "CelestCare Demo",
      category: "moisturizer",
      moisturizerWeight: "light",
      texture: "gel cream",
      ingredients: [
        { name: "Glycerin", canonicalId: "glycerin" },
        { name: "Sodium hyaluronate", canonicalId: "hyaluronic-acid" },
      ],
      benefits: ["Light moisturizer"],
      frequency: "Morning and evening",
    }),
    product({
      id: "cedar",
      name: "Cedar Barrier Cream",
      brand: "CelestCare Demo",
      category: "moisturizer",
      moisturizerWeight: "rich",
      texture: "cream",
      ingredients: [
        { name: "Glycerin", canonicalId: "glycerin" },
        { name: "Ceramide NP", canonicalId: "ceramide-np" },
        { name: "Petrolatum", canonicalId: "petrolatum" },
      ],
      benefits: ["Richer moisturizer"],
      frequency: "Morning and evening",
    }),
    product({
      id: "petal",
      name: "Petal Soft Cream",
      brand: "CelestCare Demo",
      category: "moisturizer",
      moisturizerWeight: "rich",
      ingredients: [
        { name: "Glycerin", canonicalId: "glycerin" },
        { name: "Ceramide NP", canonicalId: "ceramide-np" },
        { name: "Parfum", canonicalId: "fragrance" },
      ],
      benefits: ["Scented moisturizer kept to show an allergy exclusion"],
      frequency: "Not recommended for this demo profile",
    }),
    product({
      id: "harbor",
      name: "Harbor Mineral Screen",
      brand: "CelestCare Demo",
      category: "sunscreen",
      texture: "lotion",
      ingredients: [
        { name: "Zinc oxide", canonicalId: "zinc-oxide" },
        { name: "Glycerin", canonicalId: "glycerin" },
      ],
      benefits: ["Sun protection step"],
      instructions: "Apply as the last morning step on skin you do not cover. Reapply when outdoors.",
      frequency: "Every morning",
      amountGuidance: "For the face and neck, follow the amount on the package. The one-ounce figure from AAD is for uncovered body skin, not the face alone.",
      spf: 50,
      broadSpectrum: true,
      waterResistant: true,
      waterResistantMinutes: 40,
      openedDate: "2026-08-01",
      paoMonths: 12,
      remaining: "half",
    }),
    product({
      id: "lumen",
      name: "Lumen Niacinamide Serum",
      brand: "CelestCare Demo",
      category: "serum",
      texture: "watery serum",
      ingredients: [
        { name: "Niacinamide", canonicalId: "niacinamide", concentration: "5%", isActive: true },
        { name: "Glycerin", canonicalId: "glycerin" },
      ],
      benefits: ["Support step for tone and comfort"],
      instructions: "A few drops after cleansing.",
      frequency: "Daily",
      applicationPeriod: "am",
    }),
    product({
      id: "clearstep",
      name: "Clearstep Salicylic Treatment",
      brand: "CelestCare Demo",
      category: "treatment",
      ingredients: [{ name: "Salicylic acid", canonicalId: "salicylic-acid", concentration: "2%", isActive: true }],
      benefits: ["Leave-on acid"],
      instructions: "Thin layer at night on dry skin.",
      frequency: "Alternate nights if tolerated",
      applicationPeriod: "pm",
    }),
    product({
      id: "orchard",
      name: "Orchard Glycolic Liquid",
      brand: "CelestCare Demo",
      category: "exfoliant",
      ingredients: [{ name: "Glycolic acid", canonicalId: "glycolic-acid", concentration: "8%", isActive: true }],
      benefits: ["Second leave-on acid, used to show overlap"],
      frequency: "Not on the same night as another acid",
      applicationPeriod: "pm",
    }),
    product({
      id: "fieldnote",
      name: "Fieldnote Retinol Night",
      brand: "CelestCare Demo",
      category: "treatment",
      ingredients: [{ name: "Retinol", canonicalId: "retinol", concentration: "0.3%", isActive: true }],
      benefits: ["Cosmetic retinoid"],
      frequency: "A few nights a week",
      applicationPeriod: "pm",
      newProduct: true,
    }),
    product({
      id: "adapalene",
      name: "Sample Adapalene Gel 0.1%",
      brand: "CelestCare Demo",
      category: "treatment",
      prescription: true,
      ingredients: [{ name: "Adapalene", canonicalId: "adapalene", concentration: "0.1%", isActive: true }],
      benefits: ["Recorded prescription step"],
      instructions: "Pea-sized amount at night.",
      prescriberInstructions: "Use a pea-sized amount nightly. Do not use other leave-on exfoliants with it.",
      frequency: "Nightly, as recorded",
      applicationPeriod: "pm",
      schedule: { period: "pm", timesPerWeek: 7, exact: true },
      doNotCombineWith: ["exfoliant-acid"],
      amountGuidance: "Pea-sized amount, as recorded from the demo label.",
    }),
    product({
      id: "unlabeled",
      name: "Unlabeled Mist",
      brand: "Unknown",
      category: "toner",
      ingredientListStatus: "unknown",
      ingredients: [],
      provenance: {
        source: "unknown",
        detail: "Demo case with no ingredient list. It must not be treated as allergy-safe.",
      },
      benefits: [],
      remaining: "unknown",
    }),
    product({
      id: "archive-mask",
      name: "Archive Clay Mask",
      brand: "CelestCare Demo",
      category: "mask",
      status: "paused",
      ingredients: [{ name: "Glycerin", canonicalId: "glycerin" }],
      frequency: "Not in the daily routine",
      applicationPeriod: "as-needed",
    }),
  ];

  const data = emptyData();
  data.profile = profile;
  data.onboardingComplete = true;
  data.onboardingStep = 7;
  data.products = products;
  data.settings = {
    theme: "dark",
    temperatureUnit: "c",
    routineMode: "balanced",
    location: null,
    useDemoWeather: true,
  };
  data.weatherCache = null;
  data.journal = [
    {
      id: createId("journal"),
      date: "2026-09-12",
      comfort: "comfortable",
      drynessOiliness: "balanced",
      irritation: "none",
      breakouts: "none",
      notes: "Illustrative check-in. This is not a real observation.",
      emergencySymptoms: false,
      createdAt: "2026-09-12T18:00:00.000Z",
    },
  ];
  return data;
}

export function isDemoDatabase(name: string): boolean {
  return name === "celestcare-demo";
}
