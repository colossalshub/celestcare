export interface WeatherDaily {
  date: string;
  uvIndexMax: number | null;
  precipitationSumMm: number | null;
  temperatureMaxC: number | null;
  temperatureMinC: number | null;
  weatherCode: number | null;
  precipitationProbabilityMax: number | null;
}

export interface WeatherSnapshot {
  kind: "live" | "demo-scenario";
  provider: "open-meteo";
  fetchedAt: string;
  observationTime: string | null;
  locationLabel: string;
  latitude: number;
  longitude: number;
  timezone: string;
  temperatureC: number | null;
  relativeHumidityPct: number | null;
  precipitationMm: number | null;
  windSpeedKph: number | null;
  weatherCode: number | null;
  uvIndexMaxToday: number | null;
  unavailableFields: string[];
  daily: WeatherDaily[];
  attribution: string;
}

export interface GeocodingPlace {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  label: string;
}

export const OPEN_METEO_ATTRIBUTION =
  "Weather data by Open-Meteo.com, CC BY 4.0";
