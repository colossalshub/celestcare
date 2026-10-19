import { weatherCodeLabel } from "@/lib/weather/codes";
import { formatTemperature } from "@/lib/skincare/weather-adaptation";
import type { WeatherSnapshot } from "@/lib/weather/types";

export function WeatherSummary({
  weather,
  unit,
  demoScenario = false,
}: {
  weather: WeatherSnapshot | null;
  unit: "c" | "f";
  demoScenario?: boolean;
}) {
  if (!weather) {
    return (
      <section className="border border-line px-4 py-4" aria-label="Weather">
        <p className="kicker">Weather</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          No weather is loaded. The baseline routine is unchanged. Choose a city or allow location on the weather page. Nothing here is a guessed forecast.
        </p>
      </section>
    );
  }
  const items = [
    ["Temperature", formatTemperature(weather.temperatureC, unit)],
    ["Humidity", weather.relativeHumidityPct == null ? "Unavailable" : `${Math.round(weather.relativeHumidityPct)}%`],
    ["UV max", weather.uvIndexMaxToday == null ? "Unavailable" : String(weather.uvIndexMaxToday)],
    ["Precipitation", weather.precipitationMm == null ? "Unavailable" : `${weather.precipitationMm} mm`],
    ["Wind", weather.windSpeedKph == null ? "Unavailable" : `${Math.round(weather.windSpeedKph)} km/h`],
    ["Sky", weatherCodeLabel(weather.weatherCode) ?? "Unavailable"],
  ];
  return (
    <section className="border border-line px-4 py-4" aria-label="Weather">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="kicker">{demoScenario ? "Illustrative weather scenario" : "Weather"}</p>
        <p className="text-xs text-muted">{weather.locationLabel}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-5 text-muted">
        {weather.kind === "live" ? "Observation" : "Scenario"} {weather.observationTime ?? "without an observation time"} · fetched{" "}
        {new Date(weather.fetchedAt).toLocaleString()} · {weather.timezone}. {weather.attribution}
      </p>
      {weather.unavailableFields.length > 0 ? (
        <p className="mt-1 text-xs text-muted">Unavailable: {weather.unavailableFields.join(", ")}.</p>
      ) : null}
    </section>
  );
}
