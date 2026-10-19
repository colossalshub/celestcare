export interface SourceRecord {
  id: string;
  title: string;
  organization: string;
  url: string;
  publishedOrRevised?: string;
  lastVerified: string;
  notes?: string;
}

export const LAST_REVIEWED = "2026-10-19";

export const SOURCES: readonly SourceRecord[] = [
  {
    id: "aad-sunscreen-labels",
    title: "How to decode a sunscreen label",
    organization: "American Academy of Dermatology",
    url: "https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/understand-sunscreen-labels",
    lastVerified: LAST_REVIEWED,
    notes: "Broad spectrum, SPF meaning, and the statement that no sunscreen filters 100% of UVB.",
  },
  {
    id: "aad-sunscreen-select",
    title: "How to select a sunscreen",
    organization: "American Academy of Dermatology",
    url: "https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-select-sunscreen/",
    lastVerified: LAST_REVIEWED,
    notes: "SPF 30 or higher, broad spectrum, and water resistance as selection points. Water resistance lasts 40 or 80 minutes.",
  },
  {
    id: "aad-sunscreen-faqs",
    title: "Sunscreen FAQs",
    organization: "American Academy of Dermatology",
    url: "https://www.aad.org/media/stats-sunscreen",
    lastVerified: LAST_REVIEWED,
    notes: "Reapplication about every two hours outdoors, including cloudy days, and after swimming or sweating. Sunscreen alone cannot fully protect skin.",
  },
  {
    id: "aad-acne-pregnancy",
    title: "Is any acne treatment safe to use during pregnancy?",
    organization: "American Academy of Dermatology",
    url: "https://www.aad.org/public/diseases/acne/derm-treat/pregnancy",
    lastVerified: LAST_REVIEWED,
    notes: "Oral isotretinoin and tazarotene are described as able to cause serious birth defects. Most experts recommend stopping adapalene and tretinoin. Salicylic acid and benzoyl peroxide are discussed as limited-use topics to review with a clinician.",
  },
  {
    id: "dermnet-nicotinamide",
    title: "Nicotinamide",
    organization: "DermNet",
    url: "https://dermnetnz.org/topics/nicotinamide",
    publishedOrRevised: "2018-03",
    lastVerified: LAST_REVIEWED,
    notes: "Page states it was updated by A/Prof Amanda Oakley in March 2018. Summarizes topical nicotinamide studies and states nicotinamide does not work as a sunscreen.",
  },
  {
    id: "dermnet-salicylic",
    title: "Salicylic acid",
    organization: "DermNet",
    url: "https://dermnetnz.org/topics/salicylic-acid",
    publishedOrRevised: "2005",
    lastVerified: LAST_REVIEWED,
    notes: "Author dated 2005. The page reviewed on 2026-10-19 did not show a later revision date. Describes keratolytic use and precautions about combining with other peeling or medicated products.",
  },
  {
    id: "dermnet-retinoids",
    title: "Topical retinoids",
    organization: "DermNet",
    url: "https://dermnetnz.org/topics/topical-retinoids",
    publishedOrRevised: "2021-07",
    lastVerified: LAST_REVIEWED,
    notes: "Updated July 2021. Distinguishes cosmetic retinol from prescription retinoids and describes irritation, photosensitivity, acne use, and pregnancy caution.",
  },
  {
    id: "dermnet-acne-pregnancy",
    title: "Acne in pregnancy",
    organization: "DermNet",
    url: "https://dermnetnz.org/topics/acne-in-pregnancy",
    lastVerified: LAST_REVIEWED,
    notes: "Lists topical retinoids and high-concentration salicylic acid among treatments to avoid in pregnancy, and lists benzoyl peroxide, azelaic acid, and low-concentration salicylic acid among treatments experts often consider.",
  },
  {
    id: "dermnet-topical-acne",
    title: "Topical therapy for acne",
    organization: "DermNet",
    url: "https://dermnetnz.org/cme/follicular/topical-therapy-for-acne",
    lastVerified: LAST_REVIEWED,
    notes: "Describes benzoyl peroxide, including fabric bleaching, and notes that it may be combined with other topical or oral therapy.",
  },
  {
    id: "fda-fragrance",
    title: "Fragrances in cosmetics",
    organization: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/cosmetics/cosmetic-ingredients/fragrances-cosmetics",
    lastVerified: LAST_REVIEWED,
    notes: "Fragrance may be listed as a single term. Some people have fragrance allergies or sensitivities. FDA suggests fragrance-free products and reading the ingredient list when that is a concern.",
  },
  {
    id: "fda-labeling-guide",
    title: "Cosmetics labeling guide",
    organization: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/cosmetics/cosmetics-labeling-regulations/cosmetics-labeling-guide",
    lastVerified: LAST_REVIEWED,
    notes: "Ingredient declaration in descending order of predominance, with special rules at 1% or less, and fragrance listed as fragrance.",
  },
  {
    id: "fda-cosmetic-ingredients",
    title: "Cosmetic ingredients",
    organization: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/cosmetics/cosmetic-products-ingredients/cosmetic-ingredients",
    lastVerified: LAST_REVIEWED,
    notes: "Cosmetics and ingredients are not preapproved by FDA except certain color additives. Firms are responsible for safety.",
  },
  {
    id: "cir-niacinamide-pubmed",
    title: "Final report of the safety assessment of niacinamide and niacin",
    organization: "Cosmetic Ingredient Review, via PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/16596767/",
    publishedOrRevised: "2005",
    lastVerified: LAST_REVIEWED,
    notes: "Int J Toxicol. 2005. Direct retrieval of the PubMed page returned HTTP 403 on 2026-10-19. The stored claim uses the abstract text visible in a search result the same day, not the full CIR report and not an unseen conclusion line.",
  },
  {
    id: "open-meteo-docs",
    title: "Weather forecast API documentation",
    organization: "Open-Meteo",
    url: "https://open-meteo.com/en/docs",
    lastVerified: LAST_REVIEWED,
    notes: "Forecast endpoint, current and daily variables including uv_index_max, and WMO weather codes.",
  },
  {
    id: "open-meteo-terms",
    title: "Open-Meteo terms",
    organization: "Open-Meteo",
    url: "https://open-meteo.com/en/terms",
    lastVerified: LAST_REVIEWED,
    notes: "Free API is for non-commercial use and the data licence is CC BY 4.0. Attribution is required.",
  },
  {
    id: "cc-by-4",
    title: "Creative Commons Attribution 4.0 International",
    organization: "Creative Commons",
    url: "https://creativecommons.org/licenses/by/4.0/",
    lastVerified: LAST_REVIEWED,
    notes: "Licence referenced by Open-Meteo for API data.",
  },
];

const byId = new Map(SOURCES.map((source) => [source.id, source]));

export function getSource(id: string): SourceRecord | undefined {
  return byId.get(id);
}

export function sourcesByIds(ids: readonly string[]): SourceRecord[] {
  return ids.flatMap((id) => {
    const source = byId.get(id);
    return source ? [source] : [];
  });
}
