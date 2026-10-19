# Data sources

## Skincare claims

Source records live in `lib/research/sources.ts`. Each has a title, organization, URL, the date it was verified for this project (2026-10-19), and a note about what was actually read.

The in-app Sources page lists the same records. Claim text is in `lib/research/claims.ts`.

## Product ingredients

Priority used by the product form:

1. Text the user confirms against the package
2. A manufacturer disclosure the user identifies
3. A database record the user identifies
4. Extracted or photographed text, which stays unconfirmed until the status is changed
5. Unknown or incomplete

The demo shelf is authored for this app and marked `illustrative-demo`. Those formulas are not commercial ingredient lists. There is no product-database lookup. A barcode, when the browser can read one, is not matched to a catalog.

No site is scraped.

## Weather

- Forecast: `https://api.open-meteo.com/v1/forecast`
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Docs: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- Terms: [https://open-meteo.com/en/terms](https://open-meteo.com/en/terms)

The public API is licensed CC BY 4.0 for non-commercial use, with rate limits described by Open-Meteo. Responses are validated with Zod. Missing fields stay missing. Cache older than three hours does not change the routine.

Commercial deployment would need Open-Meteo's paid terms. This project does not ship an API key.

## Photos and journals

Label photos and check-in photos are stored only in IndexedDB, and only under about 1.2 MB. They are not uploaded.
