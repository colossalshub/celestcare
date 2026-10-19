import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseGeocoding, parseOpenMeteoForecast, WeatherParseError } from "@/lib/weather/open-meteo";

const fixture = JSON.parse(readFileSync(new URL("./fixtures/open-meteo-nyc-2026-10-19.json", import.meta.url), "utf8")) as unknown;

describe("Open-Meteo parsing", () => {
  it("parses a response captured from the live API on 2026-10-19", () => {
    const weather = parseOpenMeteoForecast(fixture, {
      label: "New York, United States",
      latitude: 40.7128,
      longitude: -74.006,
      fetchedAt: "2026-10-19T10:05:00.000Z",
    });
    expect(weather.temperatureC).toBe(4.9);
    expect(weather.relativeHumidityPct).toBe(93);
    expect(weather.precipitationMm).toBe(0);
    expect(weather.windSpeedKph).toBe(5.8);
    expect(weather.weatherCode).toBe(0);
    expect(weather.uvIndexMaxToday).toBe(4.35);
    expect(weather.timezone).toBe("America/New_York");
    expect(weather.observationTime).toBe("2026-10-19T06:00");
    expect(weather.kind).toBe("live");
    expect(weather.attribution).toContain("Open-Meteo");
    expect(weather.unavailableFields).not.toContain("UV index");
    expect(weather.daily).toHaveLength(2);
  });

  it("rejects an error payload instead of inventing weather", () => {
    expect(() =>
      parseOpenMeteoForecast(
        { error: true, reason: "Cannot initialize WeatherVariable" },
        { label: "Test", latitude: 10, longitude: 10, fetchedAt: "2026-10-19T00:00:00.000Z" },
      ),
    ).toThrow(WeatherParseError);
  });

  it("rejects invalid coordinates", () => {
    expect(() =>
      parseOpenMeteoForecast(fixture, {
        label: "Bad",
        latitude: 120,
        longitude: 0,
        fetchedAt: "2026-10-19T00:00:00.000Z",
      }),
    ).toThrow(/Latitude/);
  });

  it("parses a geocoding payload", () => {
    const places = parseGeocoding({
      results: [
        {
          id: 5809844,
          name: "Seattle",
          latitude: 47.60621,
          longitude: -122.33207,
          country: "United States",
          admin1: "Washington",
          timezone: "America/Los_Angeles",
        },
      ],
    });
    expect(places[0]?.label).toBe("Seattle, Washington, United States");
  });
});
