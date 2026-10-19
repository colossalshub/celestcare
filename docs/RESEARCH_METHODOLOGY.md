# Research methodology

CelestCare does not treat model memory as a source. Substantive skincare claims in the app come from records in `lib/research/claims.ts`, each tied to a source in `lib/research/sources.ts`.

## What was reviewed on 2026-10-19

Pages were opened or retrieved that day. The claim text is limited to what those pages supported. Dates shown on the source pages are stored when the page itself gave one.

Reviewed organizations:

- American Academy of Dermatology sunscreen and pregnancy-acne pages
- DermNet pages on nicotinamide, salicylic acid, topical retinoids, acne in pregnancy, and topical acne therapy
- U.S. Food and Drug Administration cosmetics labeling, fragrance, and ingredient pages
- The PubMed record for the 2005 Cosmetic Ingredient Review niacinamide assessment (abstract text only; the PubMed page returned HTTP 403 to a direct fetch)
- Open-Meteo forecast documentation and terms

A live Open-Meteo forecast for New York coordinates was requested on 2026-10-19 and the response shape was saved, trimmed, under `lib/weather/fixtures/`. Tests parse that fixture. They do not pretend each test run called the live service.

## Evidence labels

| Label | Meaning in this app |
| --- | --- |
| STRONG | Consistent authoritative guidance, or a direct statement from a primary regulator or dermatology organization |
| MODERATE | Credible clinical or textbook summary with meaningful limits, often concentration or population limits |
| LIMITED | Indirect, preliminary, or easy to over-apply |
| UNCERTAIN | Not enough reviewed evidence for a benefit claim |

These labels are product copy. They are not GRADE or a regulatory finding.

## What is refused

- Invented citations, DOIs, dates, or URLs
- Manufacturer marketing as proof of a clinical result
- Copying a prescription-tretinoin outcome onto a cosmetic retinol of unknown strength
- Treating the presence of an ingredient as proof of an effective concentration
- A WHO UV-index citation, because that page was not successfully retrieved. The app's UV threshold of 3 is documented as an internal rule

Ingredient monographs without a reviewed benefit say so, and the optimizer can still use the name for allergy and overlap matching.
