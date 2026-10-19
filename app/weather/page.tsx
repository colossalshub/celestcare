"use client";

import { useState } from "react";
import { WeatherSummary } from "@/components/weather/WeatherSummary";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { useApp } from "@/components/providers/AppProvider";
import { fetchForecast, searchPlaces, WeatherParseError } from "@/lib/weather/open-meteo";
import type { GeocodingPlace } from "@/lib/weather/types";

export default function WeatherPage() {
  const { ready, data, update, demo } = useApp();
  const [city, setCity] = useState("");
  const [places, setPlaces] = useState<GeocodingPlace[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <LoadingState />;

  async function choose(place: GeocodingPlace) {
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    try {
      const snapshot = await fetchForecast(place.latitude, place.longitude, place.label, controller.signal);
      update((current) => ({
        ...current,
        weatherCache: snapshot,
        settings: {
          ...current.settings,
          location: {
            label: place.label,
            latitude: place.latitude,
            longitude: place.longitude,
            source: "manual",
          },
          useDemoWeather: false,
        },
      }));
      setPlaces([]);
    } catch (reason) {
      setError(reason instanceof WeatherParseError ? reason.message : "The weather service could not be reached. Your baseline routine is unchanged.");
    } finally {
      setBusy(false);
    }
  }

  async function search() {
    setBusy(true);
    setError(null);
    try {
      setPlaces(await searchPlaces(city));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Location search failed.");
    } finally {
      setBusy(false);
    }
  }

  function useDevice() {
    if (!navigator.geolocation) {
      setError("This browser has no geolocation. Search for a city instead.");
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void choose({
          id: 0,
          name: "This device",
          country: "",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Current device location",
        });
        update((current) => ({
          ...current,
          settings: {
            ...current.settings,
            location: {
              ...(current.settings.location ?? {
                label: "Current device location",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                source: "geolocation" as const,
              }),
              source: "geolocation",
              consentedAt: new Date().toISOString(),
            },
          },
        }));
      },
      () => setError("Location permission was denied. You can search for a city instead. The rest of CelestCare still works."),
      { enableHighAccuracy: false, maximumAge: 60 * 60 * 1000, timeout: 10000 },
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="kicker">Conditions</p>
      <h1 className="display mt-2 text-4xl">Weather</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        A city or device location is sent only to Open-Meteo to request a forecast. It is optional. Coordinates are not sent anywhere else by this app. Weather does not measure skin hydration.
      </p>
      <div className="mt-6">
        <WeatherSummary weather={data.weatherCache} unit={data.settings.temperatureUnit} />
      </div>
      {demo && data.settings.useDemoWeather ? (
        <p className="mt-4 text-sm leading-6">
          The demo routine is using an illustrative weather scenario, separate from this live panel. Turn that off in settings to let a real forecast change the demo routine.
        </p>
      ) : null}
      <form
        className="mt-6 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <label className="min-w-0 flex-1 text-sm">
          City
          <input className="field mt-1" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Seattle" />
        </label>
        <button type="submit" className="mt-6 border border-line px-3 py-2 text-sm" disabled={busy}>
          Search
        </button>
        <button type="button" className="mt-6 border border-line px-3 py-2 text-sm" onClick={useDevice}>
          Use this device
        </button>
      </form>
      {busy ? <p className="mt-3 text-sm text-muted">Contacting Open-Meteo.</p> : null}
      {error ? <div className="mt-4"><ErrorState body={error} /></div> : null}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {places.map((place) => (
          <li key={place.id}>
            <button type="button" className="w-full py-3 text-left text-sm hover:text-accent" onClick={() => void choose(place)}>
              {place.label}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs leading-5 text-muted">
        Weather data by <a className="underline" href="https://open-meteo.com/">Open-Meteo</a>, CC BY 4.0. The free API is for non-commercial use.
      </p>
    </div>
  );
}
