const PUNCTUATION = /[^a-z0-9\s]/g;

export function normalizeIngredientName(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(?:\.\d+)?\s*%/g, " ")
    .replace(PUNCTUATION, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseIngredientPaste(text: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of text.split(/[\n,;]+/)) {
    const cleaned = part.replace(/^\s*\d+[.)]\s*/, "").replace(/^[\s\-•·]+/, "").trim();
    if (!cleaned) continue;
    const key = normalizeIngredientName(cleaned);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    names.push(cleaned);
  }
  return names;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word or whole-phrase match. Avoids matching "mi" inside unrelated words. */
export function termAppearsIn(normalizedIngredient: string, normalizedTerm: string): boolean {
  if (!normalizedTerm || !normalizedIngredient) return false;
  if (normalizedIngredient === normalizedTerm) return true;
  const pattern = new RegExp(`(?:^|\\s)${escapeRegExp(normalizedTerm)}(?:\\s|$)`);
  return pattern.test(normalizedIngredient);
}
