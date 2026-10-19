import { describe, expect, it } from "vitest";
import { lookupAlias } from "@/lib/skincare/ingredient-aliases";
import { normalizeIngredientName, parseIngredientPaste, termAppearsIn } from "@/lib/skincare/ingredient-normalization";

describe("ingredient normalization and aliases", () => {
  it("normalizes punctuation, case, and concentrations", () => {
    expect(normalizeIngredientName("  L-Ascorbic Acid (10%) ")).toBe("l ascorbic acid");
    expect(normalizeIngredientName("Niacinamide")).toBe("niacinamide");
  });

  it("maps recognized aliases and leaves unknown names unmatched", () => {
    expect(lookupAlias("Parfum")).toBe("fragrance");
    expect(lookupAlias("nicotinamide")).toBe("niacinamide");
    expect(lookupAlias("sodium hyaluronate")).toBe("hyaluronic-acid");
    expect(lookupAlias("BHA")).toBe("salicylic-acid");
    expect(lookupAlias("mystery blossom extract")).toBeNull();
  });

  it("parses a pasted ingredient list without duplicating names", () => {
    const names = parseIngredientPaste("Aqua, Glycerin; Niacinamide\n2. Parfum\nGlycerin");
    expect(names).toEqual(["Aqua", "Glycerin", "Niacinamide", "Parfum"]);
  });

  it("matches phrases on word boundaries", () => {
    expect(termAppearsIn("butyrospermum parkii shea butter", "shea butter")).toBe(true);
    expect(termAppearsIn("dimethicone", "mi")).toBe(false);
  });
});
