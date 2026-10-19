"use client";

import { useMemo } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { demoWeather } from "@/lib/demo/seed";
import { optimizeRoutine } from "@/lib/skincare/routine-optimizer";
import type { RoutinePlan } from "@/lib/skincare/types";
import type { WeatherSnapshot } from "@/lib/weather/types";

export function usePlan(): { plan: RoutinePlan | null; weather: WeatherSnapshot | null; demoScenario: boolean } {
  const { data, now, demo } = useApp();
  return useMemo(() => {
    const demoScenario = demo && data.settings.useDemoWeather;
    const weather = demoScenario ? demoWeather(now) : data.weatherCache;
    if (!data.profile) return { plan: null, weather, demoScenario };
    const plan = optimizeRoutine({
      profile: data.profile,
      products: data.products,
      now,
      mode: data.settings.routineMode,
      journal: data.journal,
      weather,
      overrides: data.overrides,
    });
    return { plan, weather, demoScenario };
  }, [data, demo, now]);
}
