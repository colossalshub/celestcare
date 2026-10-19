# Known limitations

- CelestCare is not a medical device and does not diagnose acne, eczema, rosacea, melasma, allergy, or barrier damage.
- The starter evidence library is small. Many cosmetic ingredients are recognized only so they can be matched. They do not carry a benefit claim.
- Cosmetic ingredient lists do not prove concentration. Drug-facts percentages are whatever the user typed from a label.
- Fragrance allergy matching includes several named fragrance allergens. That can over-match. A short custom allergy term can also over-match.
- "BHA" is treated as salicylic acid, which is the usual skincare meaning and can be wrong for butylated hydroxyanisole.
- Pregnancy rules withhold retinoids and leave-on salicylic acid. They do not replace obstetric care. Breastfeeding does not automatically withhold retinoids, because a separate rule was not reviewed.
- Benzoyl peroxide with a retinoid is information, not a ban, unless a label forbids it.
- Niacinamide is not automatically separated from ascorbic acid.
- There is no OCR engine. A label photo is a reference until the user confirms the text. Barcode detection depends on the browser and does not identify the product.
- There is no hosted account. Data on one browser is not synced. Supabase is documented as unused.
- Open-Meteo was called successfully during development on 2026-10-19. A later outage leaves the last valid cache, or the baseline routine if the cache is missing or older than three hours.
- The UV reminder threshold of 3 is an application rule. A WHO page was not retrieved, so it is not cited as WHO guidance.
- Weather does not measure skin hydration, pore clogging, or UV dose on a person's skin.
- Journal photos are observational. The app does not measure them.
- Demo products are fictional formulas with deliberate gaps. They must not be quoted as real manufacturer disclosures.
- Automated tests cover the safety engine, weather parsing of a captured live response, and persistence. The Playwright journey runs in Chromium. It does not prove a physical device camera, a live weather call inside the browser test, or clinical validity.
