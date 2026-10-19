# CelestCare

CelestCare builds a short morning and evening routine from the skincare products you already own. It checks recorded allergies, keeps incomplete ingredient lists from being treated as safe, and explains each step with the sources it actually reviewed.

It is an educational organizer. It is not a dermatologist, and it does not diagnose or treat skin disease.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first screen can start a local profile or open the labeled demo shelf. No account and no API key are required.

Other checks:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

End-to-end tests need a Chromium install: `npx playwright install chromium`.

## What is stored

Inventory, profile, journal notes, adherence, and optional label or check-in photos stay in IndexedDB in this browser. The demo shelf uses a separate database (`celestcare-demo`) so it does not overwrite a personal shelf.

Settings can export a JSON file or delete the active database. The export can contain health-related notes and photos. Treat it as private.

## Weather

Live conditions come from [Open-Meteo](https://open-meteo.com/) when you search for a city or choose to share this device's location. The free API is for non-commercial use and the data is under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution is shown in the weather panel. If the request fails or the saved response is older than three hours, the baseline routine stays in place and no weather values are invented.

The demo shelf can also show a clearly labeled illustrative weather scenario. That scenario is not a forecast.

## Optional configuration

See `.env.example`. Cloud sync is not enabled. Leave the Supabase fields blank.

## Further reading

- [Research methodology](docs/RESEARCH_METHODOLOGY.md)
- [Safety model](docs/SAFETY_MODEL.md)
- [Data sources](docs/DATA_SOURCES.md)
- [Known limitations](docs/KNOWN_LIMITATIONS.md)
- [Build status](BUILD_STATUS.md)
