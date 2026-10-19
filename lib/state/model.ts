import type { AdherenceEvent, JournalEntry, Product, RoutineProfile, UserProfile } from "@/lib/skincare/types";
import type { WeatherSnapshot } from "@/lib/weather/types";

export interface SavedLocation {
  label: string;
  latitude: number;
  longitude: number;
  source: "manual" | "geolocation";
  consentedAt?: string;
}

export interface Settings {
  theme: "dark" | "light" | "system";
  temperatureUnit: "c" | "f";
  routineMode: RoutineProfile;
  location: SavedLocation | null;
  useDemoWeather: boolean;
}

export interface RoutineOverrides {
  hiddenProductIds: string[];
  forcedProductIds: string[];
}

export interface RoutineSnapshot {
  fingerprint: string;
  generatedAt: string;
  mode: RoutineProfile;
  morningProductIds: string[];
  eveningProductIds: string[];
  excludedProductIds: string[];
}

export interface AppData {
  version: 1;
  profile: UserProfile | null;
  onboardingStep: number;
  onboardingComplete: boolean;
  products: Product[];
  journal: JournalEntry[];
  adherence: AdherenceEvent[];
  settings: Settings;
  weatherCache: WeatherSnapshot | null;
  overrides: RoutineOverrides;
  routineHistory: RoutineSnapshot[];
}

export function defaultSettings(): Settings {
  return {
    theme: "dark",
    temperatureUnit: "c",
    routineMode: "balanced",
    location: null,
    useDemoWeather: false,
  };
}

export function emptyData(): AppData {
  return {
    version: 1,
    profile: null,
    onboardingStep: 0,
    onboardingComplete: false,
    products: [],
    journal: [],
    adherence: [],
    settings: defaultSettings(),
    weatherCache: null,
    overrides: { hiddenProductIds: [], forcedProductIds: [] },
    routineHistory: [],
  };
}

export function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function createId(prefix: string): string {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && "randomUUID" in cryptoRef) return `${prefix}_${cryptoRef.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function upsertProduct(data: AppData, product: Product): AppData {
  const index = data.products.findIndex((item) => item.id === product.id);
  const products = [...data.products];
  if (index === -1) products.push(product);
  else products[index] = product;
  return { ...data, products };
}

export function deleteProduct(data: AppData, productId: string): AppData {
  return {
    ...data,
    products: data.products.filter((product) => product.id !== productId),
    overrides: {
      hiddenProductIds: data.overrides.hiddenProductIds.filter((id) => id !== productId),
      forcedProductIds: data.overrides.forcedProductIds.filter((id) => id !== productId),
    },
  };
}

export function saveProfile(data: AppData, profile: UserProfile): AppData {
  return { ...data, profile };
}

export function recordAdherence(data: AppData, event: AdherenceEvent): AppData {
  const adherence = data.adherence.filter(
    (item) => !(item.date === event.date && item.period === event.period && item.productId === event.productId),
  );
  adherence.push(event);
  return { ...data, adherence };
}

export function clearAdherence(data: AppData, date: string, period: "am" | "pm", productId: string): AppData {
  return {
    ...data,
    adherence: data.adherence.filter(
      (item) => !(item.date === date && item.period === period && item.productId === productId),
    ),
  };
}

export function addJournal(data: AppData, entry: JournalEntry): AppData {
  return { ...data, journal: [entry, ...data.journal].slice(0, 200) };
}

export function deleteJournal(data: AppData, entryId: string): AppData {
  return { ...data, journal: data.journal.filter((entry) => entry.id !== entryId) };
}

export function rememberRoutine(data: AppData, snapshot: RoutineSnapshot): AppData {
  if (data.routineHistory[0]?.fingerprint === snapshot.fingerprint) return data;
  return { ...data, routineHistory: [snapshot, ...data.routineHistory].slice(0, 21) };
}

export interface ExportEnvelope {
  app: "celestcare";
  exportedAt: string;
  note: string;
  data: AppData;
}

export function serializeExport(data: AppData, exportedAt: string): string {
  const envelope: ExportEnvelope = {
    app: "celestcare",
    exportedAt,
    note: "This file can contain allergy, journal, and photo data. Store it privately.",
    data,
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseExport(text: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") throw new Error("That file is not a CelestCare export.");
  const envelope = parsed as Partial<ExportEnvelope>;
  if (envelope.app !== "celestcare" || !envelope.data || envelope.data.version !== 1) {
    throw new Error("That file is not a CelestCare export.");
  }
  if (!Array.isArray(envelope.data.products) || !Array.isArray(envelope.data.journal)) {
    throw new Error("The export is missing product or journal data.");
  }
  return envelope.data;
}
