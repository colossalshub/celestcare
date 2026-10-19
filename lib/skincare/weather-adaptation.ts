import type { UserProfile } from "@/lib/skincare/types";
import { isWetWeatherCode } from "@/lib/weather/codes";
import type { WeatherSnapshot } from "@/lib/weather/types";

export const WEATHER_MAX_AGE_MS = 3 * 60 * 60 * 1000;

export interface WeatherInterpretation {
  applied: boolean;
  stale: boolean;
  missing: boolean;
  preferRicher: boolean;
  preferLighter: boolean;
  emphasizeSunscreen: boolean;
  preferWaterResistant: boolean;
  changesProducts: boolean;
  notes: string[];
  reasons: string[];
}

export function neutralWeatherAdvice(profile: UserProfile): WeatherInterpretation {
  return {
    applied: false,
    stale: false,
    missing: true,
    preferRicher: false,
    preferLighter: false,
    emphasizeSunscreen: profile.outdoorExposure !== "minimal",
    preferWaterResistant: false,
    changesProducts: false,
    notes: [],
    reasons: [],
  };
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function interpretWeather(
  weather: WeatherSnapshot | null,
  profile: UserProfile,
  now: Date,
): WeatherInterpretation {
  if (!weather) {
    return {
      ...neutralWeatherAdvice(profile),
      notes: [
        "Weather data is unavailable, so product selection stays on the baseline routine. UV-based adjustments cannot be determined.",
      ],
    };
  }

  const fetched = Date.parse(weather.fetchedAt);
  const age = now.getTime() - fetched;
  if (!Number.isFinite(fetched) || age > WEATHER_MAX_AGE_MS) {
    return {
      ...neutralWeatherAdvice(profile),
      stale: true,
      missing: false,
      notes: [
        "The saved weather data is more than 3 hours old, so it is not being used to change products. Refresh weather before relying on it.",
      ],
    };
  }

  const notes: string[] = [];
  const reasons: string[] = [];
  let preferRicher = false;
  let preferLighter = false;
  let emphasize = false;
  let waterResistant = false;

  if (weather.kind === "demo-scenario") {
    notes.push("Routine choices below can use this illustrative scenario. It is not a live observation.");
  }

  const uv = weather.uvIndexMaxToday;
  if (uv == null) {
    notes.push("UV index was not in the weather response. Do not assume exposure is low.");
    if (profile.outdoorExposure !== "minimal") emphasize = true;
  } else if (uv >= 3) {
    emphasize = true;
    reasons.push(`Reported daily maximum UV index is ${formatNumber(uv)}.`);
    notes.push(
      "Sun protection is emphasized because the reported daily maximum UV index is 3 or higher. Clouds are not treated as zero UV.",
    );
  } else {
    notes.push(
      `Reported daily maximum UV index is ${formatNumber(uv)}. A low number is not a reason to skip sunscreen if you will be outdoors.`,
    );
    if (profile.outdoorExposure === "extended") emphasize = true;
  }

  const forecast = weather.daily[0];
  const wet =
    (weather.precipitationMm != null && weather.precipitationMm > 0) ||
    (forecast?.precipitationSumMm != null && forecast.precipitationSumMm > 0) ||
    isWetWeatherCode(weather.weatherCode) ||
    isWetWeatherCode(forecast?.weatherCode ?? null);
  if (wet) {
    notes.push("Rain or drizzle does not cancel UV exposure. Keep sunscreen if you will be outdoors.");
    if (profile.outdoorExposure !== "minimal") emphasize = true;
  }

  const humidity = weather.relativeHumidityPct;
  const temp = weather.temperatureC;
  if (humidity != null && humidity < 35) {
    preferRicher = true;
    reasons.push(`Relative humidity is ${Math.round(humidity)}%.`);
    notes.push(
      "Humidity is low. A richer moisturizer you already own is preferred for comfort. Weather does not measure skin hydration or show barrier damage.",
    );
  } else if (humidity != null && temp != null && humidity >= 75 && temp >= 27) {
    preferLighter = true;
    reasons.push(`Temperature is ${formatNumber(temp)}°C and relative humidity is ${Math.round(humidity)}%.`);
    notes.push(
      "It is warm and humid. A lighter moisturizer you already own may feel more comfortable. This is not a reason to stop moisturizing, and humidity does not show whether a product will clog pores.",
    );
  } else {
    notes.push(
      "Temperature and humidity are inside a moderate band, so the moisturizer is not being changed. A small temperature difference alone does not change the routine.",
    );
  }

  if (weather.windSpeedKph != null && weather.windSpeedKph >= 30 && preferRicher) {
    notes.push("Wind is high along with low humidity. That can make skin feel drier. It is a comfort note, not a diagnosis.");
  }

  if (emphasize && profile.outdoorExposure === "extended") {
    waterResistant = true;
    notes.push(
      "Extended time outdoors favors a water-resistant sunscreen only when the label actually says water resistant.",
    );
  }

  return {
    applied: true,
    stale: false,
    missing: false,
    preferRicher,
    preferLighter,
    emphasizeSunscreen: emphasize,
    preferWaterResistant: waterResistant,
    changesProducts: preferRicher || preferLighter || waterResistant,
    notes,
    reasons,
  };
}

export function celsiusToFahrenheit(value: number): number {
  return (value * 9) / 5 + 32;
}

export function formatTemperature(celsius: number | null, unit: "c" | "f"): string {
  if (celsius == null) return "Unavailable";
  if (unit === "f") return `${Math.round(celsiusToFahrenheit(celsius))}°F`;
  return `${Math.round(celsius)}°C`;
}
