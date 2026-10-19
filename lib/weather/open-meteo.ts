import { z } from "zod";
import { OPEN_METEO_ATTRIBUTION, type GeocodingPlace, type WeatherSnapshot } from "@/lib/weather/types";

const numberOrNull = z.number().finite().nullable();

const forecastSchema = z.object({
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  timezone: z.string().min(1),
  current: z
    .object({
      time: z.string(),
      temperature_2m: numberOrNull.optional(),
      relative_humidity_2m: numberOrNull.optional(),
      precipitation: numberOrNull.optional(),
      weather_code: numberOrNull.optional(),
      wind_speed_10m: numberOrNull.optional(),
    })
    .optional(),
  daily: z
    .object({
      time: z.array(z.string()),
      uv_index_max: z.array(numberOrNull).optional(),
      precipitation_sum: z.array(numberOrNull).optional(),
      temperature_2m_max: z.array(numberOrNull).optional(),
      temperature_2m_min: z.array(numberOrNull).optional(),
      weather_code: z.array(numberOrNull).optional(),
      precipitation_probability_max: z.array(numberOrNull).optional(),
    })
    .optional(),
  error: z.boolean().optional(),
  reason: z.string().optional(),
});

const geocodingSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number().finite(),
        longitude: z.number().finite(),
        country: z.string(),
        admin1: z.string().optional(),
        timezone: z.string().optional(),
      }),
    )
    .optional(),
});

export class WeatherParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherParseError";
  }
}

export function assertCoordinates(latitude: number, longitude: number): void {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new WeatherParseError("Latitude must be between -90 and 90.");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new WeatherParseError("Longitude must be between -180 and 180.");
  }
}

function at<T>(values: readonly T[] | undefined, index: number): T | null {
  if (!values) return null;
  const value = values[index];
  return value === undefined ? null : value;
}

export function parseOpenMeteoForecast(
  payload: unknown,
  context: { label: string; latitude: number; longitude: number; fetchedAt: string },
): WeatherSnapshot {
  const parsed = forecastSchema.safeParse(payload);
  if (!parsed.success) {
    throw new WeatherParseError("The weather service returned data CelestCare could not validate.");
  }
  if (parsed.data.error) {
    throw new WeatherParseError(parsed.data.reason ?? "The weather service reported an error.");
  }
  assertCoordinates(context.latitude, context.longitude);
  const unavailable: string[] = [];
  const current = parsed.data.current;
  const temperatureC = current?.temperature_2m ?? null;
  const relativeHumidityPct = current?.relative_humidity_2m ?? null;
  const precipitationMm = current?.precipitation ?? null;
  const windSpeedKph = current?.wind_speed_10m ?? null;
  const weatherCode = current?.weather_code ?? null;
  if (temperatureC == null) unavailable.push("temperature");
  if (relativeHumidityPct == null) unavailable.push("relative humidity");
  if (precipitationMm == null) unavailable.push("precipitation");
  if (windSpeedKph == null) unavailable.push("wind");
  if (weatherCode == null) unavailable.push("weather code");

  const daily = parsed.data.daily;
  const days = daily?.time ?? [];
  const dailyRows = days.map((date, index) => ({
    date,
    uvIndexMax: at(daily?.uv_index_max, index),
    precipitationSumMm: at(daily?.precipitation_sum, index),
    temperatureMaxC: at(daily?.temperature_2m_max, index),
    temperatureMinC: at(daily?.temperature_2m_min, index),
    weatherCode: at(daily?.weather_code, index),
    precipitationProbabilityMax: at(daily?.precipitation_probability_max, index),
  }));
  const today = dailyRows[0];
  const uvIndexMaxToday = today?.uvIndexMax ?? null;
  if (uvIndexMaxToday == null) unavailable.push("UV index");

  return {
    kind: "live",
    provider: "open-meteo",
    fetchedAt: context.fetchedAt,
    observationTime: current?.time ?? null,
    locationLabel: context.label,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    timezone: parsed.data.timezone,
    temperatureC,
    relativeHumidityPct,
    precipitationMm,
    windSpeedKph,
    weatherCode,
    uvIndexMaxToday,
    unavailableFields: unavailable,
    daily: dailyRows,
    attribution: OPEN_METEO_ATTRIBUTION,
  };
}

export function parseGeocoding(payload: unknown): GeocodingPlace[] {
  const parsed = geocodingSchema.safeParse(payload);
  if (!parsed.success) {
    throw new WeatherParseError("The location search returned data CelestCare could not validate.");
  }
  return (parsed.data.results ?? []).map((place) => ({
    id: place.id,
    name: place.name,
    admin1: place.admin1,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
    label: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
  }));
}

export function forecastUrl(latitude: number, longitude: number): string {
  assertCoordinates(latitude, longitude);
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude.toFixed(4));
  url.searchParams.set("longitude", longitude.toFixed(4));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
  );
  url.searchParams.set(
    "daily",
    "uv_index_max,precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "3");
  url.searchParams.set("wind_speed_unit", "kmh");
  return url.toString();
}

export function geocodingUrl(name: string): string {
  const query = name.trim();
  if (query.length < 2) throw new WeatherParseError("Enter at least two letters of a city name.");
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  return url.toString();
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  label: string,
  signal?: AbortSignal,
): Promise<WeatherSnapshot> {
  const response = await fetch(forecastUrl(latitude, longitude), { signal });
  if (!response.ok) {
    throw new WeatherParseError(`Weather request failed (${response.status}).`);
  }
  const payload: unknown = await response.json();
  return parseOpenMeteoForecast(payload, {
    label,
    latitude,
    longitude,
    fetchedAt: new Date().toISOString(),
  });
}

export async function searchPlaces(name: string, signal?: AbortSignal): Promise<GeocodingPlace[]> {
  const response = await fetch(geocodingUrl(name), { signal });
  if (!response.ok) {
    throw new WeatherParseError(`Location search failed (${response.status}).`);
  }
  const payload: unknown = await response.json();
  return parseGeocoding(payload);
}
