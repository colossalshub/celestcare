import type { IngredientClass } from "@/lib/skincare/types";
import { normalizeIngredientName } from "@/lib/skincare/ingredient-normalization";

export interface AliasRecord {
  id: string;
  name: string;
  aliases: string[];
  classes: IngredientClass[];
  /** Confirmed allergies to these groups also match this ingredient. */
  allergyGroups: string[];
}

export const ALIAS_RECORDS: readonly AliasRecord[] = [
  {
    id: "niacinamide",
    name: "Niacinamide",
    aliases: ["nicotinamide", "nicotinic acid amide"],
    classes: ["niacinamide"],
    allergyGroups: [],
  },
  {
    id: "niacin",
    name: "Niacin",
    aliases: ["nicotinic acid"],
    classes: [],
    allergyGroups: [],
  },
  {
    id: "glycerin",
    name: "Glycerin",
    aliases: ["glycerol"],
    classes: ["humectant"],
    allergyGroups: [],
  },
  {
    id: "hyaluronic-acid",
    name: "Hyaluronic acid",
    aliases: ["sodium hyaluronate", "hydrolyzed hyaluronic acid", "hyaluronate"],
    classes: ["humectant"],
    allergyGroups: [],
  },
  {
    id: "panthenol",
    name: "Panthenol",
    aliases: ["dexpanthenol", "d-panthenol"],
    classes: ["humectant"],
    allergyGroups: [],
  },
  {
    id: "ceramide-np",
    name: "Ceramide NP",
    aliases: ["ceramide 3", "ceramide np"],
    classes: ["barrier-lipid"],
    allergyGroups: [],
  },
  {
    id: "ceramide-ap",
    name: "Ceramide AP",
    aliases: ["ceramide 6 ii", "ceramide ap"],
    classes: ["barrier-lipid"],
    allergyGroups: [],
  },
  {
    id: "ceramide-eop",
    name: "Ceramide EOP",
    aliases: ["ceramide 1", "ceramide eop"],
    classes: ["barrier-lipid"],
    allergyGroups: [],
  },
  {
    id: "petrolatum",
    name: "Petrolatum",
    aliases: ["petroleum jelly", "white petrolatum"],
    classes: ["barrier-lipid"],
    allergyGroups: [],
  },
  {
    id: "dimethicone",
    name: "Dimethicone",
    aliases: ["polydimethylsiloxane"],
    classes: [],
    allergyGroups: [],
  },
  {
    id: "salicylic-acid",
    name: "Salicylic acid",
    aliases: ["2-hydroxybenzoic acid", "bha"],
    classes: ["exfoliant-acid"],
    allergyGroups: [],
  },
  {
    id: "glycolic-acid",
    name: "Glycolic acid",
    aliases: ["hydroxyacetic acid"],
    classes: ["exfoliant-acid"],
    allergyGroups: [],
  },
  {
    id: "lactic-acid",
    name: "Lactic acid",
    aliases: [],
    classes: ["exfoliant-acid"],
    allergyGroups: [],
  },
  {
    id: "mandelic-acid",
    name: "Mandelic acid",
    aliases: [],
    classes: ["exfoliant-acid"],
    allergyGroups: [],
  },
  {
    id: "azelaic-acid",
    name: "Azelaic acid",
    aliases: [],
    classes: [],
    allergyGroups: [],
  },
  {
    id: "retinol",
    name: "Retinol",
    aliases: [],
    classes: ["retinoid"],
    allergyGroups: [],
  },
  {
    id: "retinaldehyde",
    name: "Retinaldehyde",
    aliases: ["retinal"],
    classes: ["retinoid"],
    allergyGroups: [],
  },
  {
    id: "retinyl-palmitate",
    name: "Retinyl palmitate",
    aliases: ["vitamin a palmitate"],
    classes: ["retinoid"],
    allergyGroups: [],
  },
  {
    id: "tretinoin",
    name: "Tretinoin",
    aliases: ["retinoic acid", "all-trans retinoic acid"],
    classes: ["retinoid"],
    allergyGroups: [],
  },
  {
    id: "adapalene",
    name: "Adapalene",
    aliases: [],
    classes: ["retinoid"],
    allergyGroups: [],
  },
  {
    id: "tazarotene",
    name: "Tazarotene",
    aliases: [],
    classes: ["retinoid"],
    allergyGroups: [],
  },
  {
    id: "isotretinoin",
    name: "Isotretinoin",
    aliases: [],
    classes: ["retinoid"],
    allergyGroups: [],
  },
  {
    id: "benzoyl-peroxide",
    name: "Benzoyl peroxide",
    aliases: ["bpo"],
    classes: ["benzoyl-peroxide"],
    allergyGroups: [],
  },
  {
    id: "ascorbic-acid",
    name: "Ascorbic acid",
    aliases: ["l-ascorbic acid", "vitamin c"],
    classes: ["vitamin-c"],
    allergyGroups: [],
  },
  {
    id: "sodium-ascorbyl-phosphate",
    name: "Sodium ascorbyl phosphate",
    aliases: [],
    classes: ["vitamin-c"],
    allergyGroups: [],
  },
  {
    id: "ascorbyl-glucoside",
    name: "Ascorbyl glucoside",
    aliases: [],
    classes: ["vitamin-c"],
    allergyGroups: [],
  },
  {
    id: "tocopherol",
    name: "Tocopherol",
    aliases: ["vitamin e", "tocopheryl acetate"],
    classes: [],
    allergyGroups: [],
  },
  {
    id: "zinc-oxide",
    name: "Zinc oxide",
    aliases: [],
    classes: ["sunscreen-filter"],
    allergyGroups: [],
  },
  {
    id: "titanium-dioxide",
    name: "Titanium dioxide",
    aliases: ["ci 77891"],
    classes: ["sunscreen-filter"],
    allergyGroups: [],
  },
  {
    id: "fragrance",
    name: "Fragrance",
    aliases: ["parfum", "perfume", "aroma"],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "limonene",
    name: "Limonene",
    aliases: ["d-limonene"],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "linalool",
    name: "Linalool",
    aliases: [],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "citronellol",
    name: "Citronellol",
    aliases: [],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "geraniol",
    name: "Geraniol",
    aliases: [],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "eugenol",
    name: "Eugenol",
    aliases: [],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "citral",
    name: "Citral",
    aliases: [],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "hexyl-cinnamal",
    name: "Hexyl cinnamal",
    aliases: [],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "coumarin",
    name: "Coumarin",
    aliases: [],
    classes: ["fragrance"],
    allergyGroups: ["fragrance"],
  },
  {
    id: "lanolin",
    name: "Lanolin",
    aliases: ["wool wax", "wool alcohols", "lanolin alcohol"],
    classes: [],
    allergyGroups: [],
  },
  {
    id: "methylisothiazolinone",
    name: "Methylisothiazolinone",
    aliases: ["mit"],
    classes: ["preservative"],
    allergyGroups: [],
  },
  {
    id: "methylchloroisothiazolinone",
    name: "Methylchloroisothiazolinone",
    aliases: ["mci"],
    classes: ["preservative"],
    allergyGroups: [],
  },
  {
    id: "hydroquinone",
    name: "Hydroquinone",
    aliases: [],
    classes: [],
    allergyGroups: [],
  },
  {
    id: "phenoxyethanol",
    name: "Phenoxyethanol",
    aliases: [],
    classes: ["preservative"],
    allergyGroups: [],
  },
];

const index = new Map<string, string>();
for (const record of ALIAS_RECORDS) {
  for (const alias of [record.name, ...record.aliases, record.id]) {
    const key = normalizeIngredientName(alias);
    const existing = index.get(key);
    if (existing && existing !== record.id) {
      throw new Error(`Ingredient alias collision for "${key}" between ${existing} and ${record.id}`);
    }
    index.set(key, record.id);
  }
}

export const ALIAS_INDEX: ReadonlyMap<string, string> = index;

const byId = new Map(ALIAS_RECORDS.map((record) => [record.id, record]));

export function getAliasRecord(id: string): AliasRecord | undefined {
  return byId.get(id);
}

export function lookupAlias(name: string): string | null {
  return index.get(normalizeIngredientName(name)) ?? null;
}

export function recordsInClass(ingredientClass: IngredientClass): AliasRecord[] {
  return ALIAS_RECORDS.filter((record) => record.classes.includes(ingredientClass));
}
