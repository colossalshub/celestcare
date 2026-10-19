"use client";

import Link from "next/link";
import { IngredientSearch } from "@/components/ingredients/IngredientSearch";
import { useApp } from "@/components/providers/AppProvider";
import { LoadingState } from "@/components/states/LoadingState";
import { findActiveOverlaps } from "@/lib/skincare/product-validation";
import { screenProduct } from "@/lib/skincare/allergy-screening";

export default function IngredientsPage() {
  const { ready, data } = useApp();
  if (!ready) return <LoadingState />;
  const overlaps = findActiveOverlaps(data.products);
  const profile = data.profile;
  const unsuitable = profile
    ? data.products.filter((product) => {
        const screen = screenProduct(product, profile);
        return screen.assessment === "blocked" || screen.assessment === "high-caution" || screen.assessment === "incomplete";
      })
    : [];
  return (
    <div className="mx-auto max-w-3xl">
      <p className="kicker">Library</p>
      <h1 className="display mt-2 text-4xl">Ingredient intelligence</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          An ingredient&apos;s known properties are not the same as a proven result from a finished product. Concentration is usually unknown on a cosmetic list.
        </p>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link className="border border-line px-3 py-2" href="/ingredients/niacinamide">What does niacinamide do?</Link>
        <Link className="border border-line px-3 py-2" href="/ingredients/salicylic-acid">Where is salicylic acid?</Link>
        <Link className="border border-line px-3 py-2" href="/compatibility">Why are products separated?</Link>
      </div>
      <div className="mt-8">
        <IngredientSearch products={data.products} />
      </div>
      <section className="mt-8">
        <h2 className="text-lg">Duplicated exfoliants or actives</h2>
        {overlaps.length === 0 ? <p className="mt-2 text-sm text-muted">No overlapping active groups in the in-use shelf.</p> : null}
        <ul className="mt-2 text-sm leading-6">
          {overlaps.map((overlap) => (
            <li key={overlap.key}>{overlap.label}: {overlap.productNames.join(", ")}</li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-lg">Unsuitable or unverified for your record</h2>
        {unsuitable.length === 0 ? <p className="mt-2 text-sm text-muted">Nothing on the shelf is currently blocked or incomplete against the profile.</p> : null}
        <ul className="mt-2 space-y-2 text-sm">
          {unsuitable.map((product) => (
            <li key={product.id}>
              <Link href={`/shelf/${product.id}`} className="hover:text-accent">{product.name}</Link>
              <span className="text-muted"> — {data.profile ? screenProduct(product, data.profile).summary : ""}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
