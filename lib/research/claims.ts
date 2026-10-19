import type { EvidenceGrade } from "@/lib/skincare/types";

export interface ClaimRecord {
  id: string;
  text: string;
  subject: string;
  grade: EvidenceGrade;
  sourceIds: string[];
  limitations: string;
}

export const CLAIMS: readonly ClaimRecord[] = [
  {
    id: "sunscreen-essentials",
    subject: "sunscreen",
    grade: "STRONG",
    sourceIds: ["aad-sunscreen-select", "aad-sunscreen-faqs"],
    text: "The American Academy of Dermatology recommends choosing a sunscreen labeled SPF 30 or higher, broad spectrum, and water resistant.",
    limitations:
      "These are label claims. CelestCare does not treat an unlabeled product, or the mere presence of a UV filter, as SPF 30, broad spectrum, or water resistant. Water resistance refers to 40 or 80 minutes on the label, not all-day protection.",
  },
  {
    id: "sunscreen-reapply",
    subject: "sunscreen",
    grade: "STRONG",
    sourceIds: ["aad-sunscreen-faqs", "aad-sunscreen-labels"],
    text: "AAD says most adults need about one ounce to cover skin not covered by clothing, and that sunscreen should be reapplied about every two hours outdoors, including cloudy days, and after swimming or sweating. No sunscreen filters 100% of UVB rays, and a higher SPF does not last longer.",
    limitations:
      "The one-ounce figure is for body coverage, not a face-only dose. Face amounts vary; follow the product label when it gives one. This does not guarantee prevention of skin cancer, pigmentation, or aging.",
  },
  {
    id: "sunscreen-not-alone",
    subject: "sunscreen",
    grade: "STRONG",
    sourceIds: ["aad-sunscreen-faqs", "aad-sunscreen-labels"],
    text: "AAD states that sunscreen alone cannot fully protect the skin. Shade, a long-sleeved shirt, pants, a wide-brimmed hat, and UV-protective sunglasses are also recommended. The sun's rays are strongest between 10 a.m. and 2 p.m.",
    limitations: "Clothing and shade are not products on the shelf. CelestCare can remind you; it cannot measure your exposure.",
  },
  {
    id: "niacinamide-topical",
    subject: "niacinamide",
    grade: "MODERATE",
    sourceIds: ["dermnet-nicotinamide"],
    text: "DermNet summarizes studies in which topical nicotinamide (niacinamide) was associated with improvements in acne, facial sebum appearance, barrier function, and some visible signs of aging. The page says more research is needed to clarify its value.",
    limitations:
      "The DermNet page was updated in March 2018. Study concentrations, such as 2%, 4%, or 5% in the trials DermNet describes, are not established by seeing niacinamide anywhere on an ingredient list.",
  },
  {
    id: "niacinamide-not-sunscreen",
    subject: "niacinamide",
    grade: "STRONG",
    sourceIds: ["dermnet-nicotinamide"],
    text: "DermNet states that nicotinamide does not work as a sunscreen and does not prevent sunburn.",
    limitations: "A moisturizer that contains niacinamide still needs a separate labeled sunscreen for sun protection.",
  },
  {
    id: "salicylic-acne",
    subject: "salicylic-acid",
    grade: "MODERATE",
    sourceIds: ["dermnet-salicylic"],
    text: "DermNet describes salicylic acid as a keratolytic. In acne, it says topical salicylic acid helps slow shedding inside follicles and helps break down blackheads and whiteheads.",
    limitations:
      "The reviewed DermNet page is author-dated 2005 and lists strengths from 0.5% to 30% for different uses. A product that merely lists salicylic acid is not proof of an acne-treatment strength.",
  },
  {
    id: "salicylic-combining",
    subject: "salicylic-acid",
    grade: "MODERATE",
    sourceIds: ["dermnet-salicylic"],
    text: "DermNet advises against using salicylic acid on the same area with alcohol-containing products, other medicated agents such as benzoyl peroxide or topical retinoids, abrasive cleansers, or peeling products unless a doctor directs it.",
    limitations:
      "This is an irritation and absorption precaution for salicylic acid preparations. It is not a statement that every combination is chemically incompatible, and a prescriber's instructions take precedence.",
  },
  {
    id: "retinoid-uses",
    subject: "retinoid",
    grade: "MODERATE",
    sourceIds: ["dermnet-retinoids"],
    text: "DermNet describes prescription topical retinoids such as adapalene and tretinoin as treatment for comedonal and inflammatory acne, and says long-term topical tretinoin can reduce some features of photoaging. It also notes cosmetic use of retinol and retinaldehyde.",
    limitations:
      "Acne improvement may take 12 weeks or longer. Cosmetic retinol should not be treated as if it were prescription tretinoin. CelestCare does not set a prescription dose.",
  },
  {
    id: "retinoid-irritation",
    subject: "retinoid",
    grade: "STRONG",
    sourceIds: ["dermnet-retinoids"],
    text: "DermNet lists dryness, peeling, irritant dermatitis, and sun sensitivity among the effects of topical retinoids.",
    limitations: "Tolerance varies. A reaction that includes severe burning, swelling, or blistering is a reason to stop and seek care, not to push through.",
  },
  {
    id: "retinol-distinction",
    subject: "retinol",
    grade: "LIMITED",
    sourceIds: ["dermnet-retinoids"],
    text: "DermNet notes that retinol and retinaldehyde are commonly added to cosmetics, while the acne and photoaging statements on the page refer to prescription retinoids and, for photoaging, long-term tretinoin.",
    limitations: "A cosmetic retinol percentage on a demo or user label is not clinical proof of the tretinoin outcomes DermNet describes.",
  },
  {
    id: "pregnancy-retinoid",
    subject: "pregnancy",
    grade: "STRONG",
    sourceIds: ["aad-acne-pregnancy", "dermnet-acne-pregnancy", "dermnet-retinoids"],
    text: "AAD says oral isotretinoin and tazarotene can cause serious birth defects and that most experts recommend stopping adapalene and tretinoin during pregnancy. DermNet advises avoiding topical retinoids, including tretinoin, isotretinoin, and adapalene, in pregnancy or when pregnancy is being contemplated.",
    limitations:
      "CelestCare withholds retinoid products from the generated routine when someone says they are pregnant or trying to conceive. That is a conservative scheduling rule, not obstetric care. Cosmetic retinol is included in this withhold because it is still a retinoid and this library does not have a separate pregnancy clearance for it.",
  },
  {
    id: "pregnancy-salicylic",
    subject: "pregnancy",
    grade: "MODERATE",
    sourceIds: ["aad-acne-pregnancy", "dermnet-acne-pregnancy", "dermnet-salicylic"],
    text: "AAD says salicylic acid is generally considered safe for a limited time in pregnancy and still says to check with an obstetrician or dermatologist. DermNet says low-concentration salicylic acid is among treatments often considered, and high-concentration salicylic acid should be avoided.",
    limitations:
      "When the concentration is unknown, CelestCare withholds leave-on salicylic acid from the automatic routine and leaves rinse-off cleansers as a discussion point rather than declaring them safe.",
  },
  {
    id: "pregnancy-bpo",
    subject: "pregnancy",
    grade: "MODERATE",
    sourceIds: ["aad-acne-pregnancy", "dermnet-acne-pregnancy"],
    text: "AAD says experts consider benzoyl peroxide safe in limited amounts during pregnancy and recommends talking with a clinician first. DermNet lists benzoyl peroxide among topical treatments often considered in pregnancy.",
    limitations: "CelestCare does not automatically block benzoyl peroxide for pregnancy. It surfaces the clinician-discussion note.",
  },
  {
    id: "bpo-acne",
    subject: "benzoyl-peroxide",
    grade: "MODERATE",
    sourceIds: ["dermnet-topical-acne"],
    text: "DermNet describes benzoyl peroxide as a topical treatment for mild to moderate acne with antiseptic and keratolytic effects. It can bleach fabric, and the page says it may be combined with other topical or oral therapy.",
    limitations:
      "Concentrations differ. A historical concern about using benzoyl peroxide with a particular retinoid is formulation-specific. CelestCare does not apply a universal ban, and it does follow an explicit product label that says not to combine them.",
  },
  {
    id: "fragrance-sensitivity",
    subject: "fragrance",
    grade: "STRONG",
    sourceIds: ["fda-fragrance", "fda-labeling-guide"],
    text: "FDA explains that fragrance formulas may be listed simply as fragrance, that some fragrance components can cause allergic reactions or sensitivities, and that people with that concern may want fragrance-free products and a careful reading of the ingredient list.",
    limitations:
      "A missing fragrance term is not proof a product is fragrance-free. Unscented products can still contain masking fragrance. Matching the word fragrance or a named fragrance allergen does not measure severity.",
  },
  {
    id: "ingredient-list-not-dose",
    subject: "ingredient-list",
    grade: "STRONG",
    sourceIds: ["fda-labeling-guide", "fda-cosmetic-ingredients"],
    text: "US retail cosmetic labels list ingredients in descending order of predominance. Ingredients other than color additives that are present at 1% or less may be listed in any order after the higher-concentration ingredients. FDA does not preapprove cosmetic ingredients other than certain color additives.",
    limitations:
      "An ingredient's place on a cosmetic list does not establish an effective concentration. OTC drug facts panels are a different label and may state active concentrations. Those concentrations still describe the product, not a personal treatment plan.",
  },
  {
    id: "cir-niacinamide-abstract",
    subject: "niacinamide",
    grade: "MODERATE",
    sourceIds: ["cir-niacinamide-pubmed"],
    text: "The 2005 Cosmetic Ingredient Review safety assessment abstract indexed on PubMed describes niacinamide and niacin as cosmetic hair- and skin-conditioning ingredients and reports niacinamide use concentrations ranging from 0.0001% to 3% depending on product type.",
    limitations:
      "The full CIR report was not retrieved on 2026-10-19. This claim does not restate a panel conclusion that was not visible in the abstract text reviewed. It is a safety-assessment citation, not evidence that a finished product has a clinical effect.",
  },
];

const byId = new Map(CLAIMS.map((claim) => [claim.id, claim]));

export function getClaim(id: string): ClaimRecord | undefined {
  return byId.get(id);
}

export function claimsByIds(ids: readonly string[]): ClaimRecord[] {
  return ids.flatMap((id) => {
    const claim = byId.get(id);
    return claim ? [claim] : [];
  });
}
