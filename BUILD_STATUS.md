# Build status

The app lives at the repository root. It started from an empty README.

## Done

- Next.js App Router, TypeScript, Tailwind, IndexedDB persistence, and a demo database kept separate from the personal shelf
- Deterministic allergy, compatibility, weather, and routine modules
- Today, shelf, routine studio, ingredients, compatibility, goals, journal, weather, profile, onboarding, sources, and settings
- Open-Meteo client with validation, city search, optional geolocation, and a stale-data fallback
- Export and delete
- Research and safety notes for sources reviewed on 2026-10-19

## Latest checks

- `npx tsc --noEmit`: passed
- `npx next lint`: passed
- `npx vitest run`: 36 tests passed
- `npx next build`: passed
- `npx playwright test`: 4 passed (desktop and mobile Chromium)
- Live Open-Meteo: a Seattle search in the running app returned an observation (8°C, 85% humidity, UV max 3.15, overcast) on 2026-10-19. That was a real response, not a fixture. The unit fixture is a trimmed New York response captured the same day.

## Not in this version

- Hosted sync
- OCR
- A licensed product database
- A paid Open-Meteo key
