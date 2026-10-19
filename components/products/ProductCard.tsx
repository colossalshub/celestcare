import Link from "next/link";
import { IngredientChip } from "@/components/ingredients/IngredientChip";
import { ProductMark } from "@/components/products/ProductMark";
import { missingIngredientInfo } from "@/lib/skincare/product-validation";
import type { Product } from "@/lib/skincare/types";

const STATUS: Record<Product["status"], string> = {
  "in-use": "In use",
  paused: "Paused",
  finished: "Finished",
  discarded: "Discarded",
};

export function ProductCard({ product }: { product: Product }) {
  const actives = product.ingredients.filter((ingredient) => ingredient.isActive || ingredient.canonicalId).slice(0, 4);
  return (
    <article className="panel flex gap-4 p-4">
      <ProductMark category={product.category} name={product.name} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="kicker">{product.brand}</p>
            <h3 className="mt-1 text-lg">
              <Link href={`/shelf/${product.id}`} className="hover:text-accent">
                {product.name}
              </Link>
            </h3>
          </div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            {product.category} · {STATUS[product.status]}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {actives.map((ingredient) => (
            <IngredientChip key={ingredient.name} id={ingredient.canonicalId} name={ingredient.name} />
          ))}
          {missingIngredientInfo(product) ? (
            <span className="border border-caution px-2 py-1 text-xs text-caution">Ingredient list incomplete</span>
          ) : null}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">{product.provenance.detail}</p>
      </div>
    </article>
  );
}
