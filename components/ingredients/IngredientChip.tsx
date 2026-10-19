import { getAliasRecord } from "@/lib/skincare/ingredient-aliases";
import Link from "next/link";

export function IngredientChip({ id, name }: { id?: string; name: string }) {
  const record = id ? getAliasRecord(id) : undefined;
  const label = record?.name ?? name;
  if (!id) {
    return <span className="border border-dashed border-line px-2 py-1 text-xs text-muted">{label} · unrecognized</span>;
  }
  return (
    <Link href={`/ingredients/${id}`} className="border border-line px-2 py-1 text-xs text-ink hover:border-accent">
      {label}
    </Link>
  );
}
