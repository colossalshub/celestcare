import { describe, expect, it } from "vitest";
import { makeProfile } from "@/lib/test/factories";
import { interpretWeather } from "@/lib/skincare/weather-adaptation";
import type { WeatherSnapshot } from "@/lib/weather/types";

function weather(overrides: Partial<WeatherSnapshot> = {}): WeatherSnapshot {
  return {
    kind: "live",
    provider: "open-meteo",
    fetchedAt: "2026-10-19T12:00:00.000Z",
    observationTime: "2026-10-19T12:00",
    locationLabel: "Test",
    latitude: 40.7,
    longitude: -74,
    timezone: "America/New_York",
    temperatureC: 21,
    relativeHumidityPct: 50,
    precipitationMm: 0,
    windSpeedKph: 8,
    weatherCode: 1,
    uvIndexMaxToday: 2,
    unavailableFields: [],
    daily: [
      {
        date: "2026-10-19",
        uvIndexMax: 2,
        precipitationSumMm: 0,
        temperatureMaxC: 22,
        temperatureMinC: 14,
        weatherCode: 1,
        precipitationProbabilityMax: 0,
      },
    ],
    attribution: "Weather data by Open-Meteo.com, CC BY 4.0",
    ...overrides,
  };
}

const now = new Date("2026-10-19T15:00:00.000Z");
const profile = makeProfile();

describe("weather adaptation", () => {
  it("does not change moisturizer choice for a moderate temperature and humidity", () => {
    const advice = interpretWeather(weather(), profile, now);
    expect(advice.applied).toBe(true);
    expect(advice.preferLighter).toBe(false);
    expect(advice.preferRicher).toBe(false);
    expect(advice.changesProducts).toBe(false);
  });

  it("prefers a richer moisturizer only when humidity is low", () => {
    const advice = interpretWeather(weather({ relativeHumidityPct: 30, temperatureC: 11 }), profile, now);
    expect(advice.preferRicher).toBe(true);
    expect(advice.notes.join(" ")).toContain("does not measure skin hydration");
  });

  it("does not use stale weather to change products", () => {
    const advice = interpretWeather(
      weather({ fetchedAt: "2026-10-19T08:00:00.000Z", relativeHumidityPct: 20 }),
      profile,
      now,
    );
    expect(advice.stale).toBe(true);
    expect(advice.applied).toBe(false);
    expect(advice.preferRicher).toBe(false);
  });

  it("does not invent a UV index when the field is missing", () => {
    const advice = interpretWeather(
      weather({ uvIndexMaxToday: null, unavailableFields: ["UV index"], daily: [] }),
      profile,
      now,
    );
    expect(advice.notes.join(" ")).toContain("UV index was not");
    expect(advice.notes.join(" ")).not.toMatch(/UV index is 0/);
  });

  it("keeps sunscreen relevant when rain is forecast", () => {
    const advice = interpretWeather(
      weather({
        precipitationMm: 1.2,
        weatherCode: 61,
        uvIndexMaxToday: 1,
        daily: [
          {
            date: "2026-10-19",
            uvIndexMax: 1,
            precipitationSumMm: 4,
            temperatureMaxC: 18,
            temperatureMinC: 12,
            weatherCode: 61,
            precipitationProbabilityMax: 80,
          },
        ],
      }),
      profile,
      now,
    );
    expect(advice.notes.join(" ")).toContain("does not cancel UV");
    expect(advice.emphasizeSunscreen).toBe(true);
  });
});

describe("product schema", () => {
  it("requires label confirmation before a list is marked user-confirmed", async () => {
    const { productInputSchema } = await import("@/lib/skincare/product-validation");
    const result = productInputSchema.safeParse({
      name: "Cream",
      brand: "North",
      category: "moisturizer",
      status: "in-use",
      ingredientText: "Glycerin",
      ingredientListStatus: "user-confirmed",
      provenanceSource: "user-label",
      provenanceDetail: "Typed from the carton.",
      confirmedFromLabel: false,
      applicationPeriod: "both",
      prescription: false,
      remaining: "plenty",
      newProduct: false,
    });
    expect(result.success).toBe(false);
  });
});
