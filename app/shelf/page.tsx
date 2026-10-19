"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { useApp } from "@/components/providers/AppProvider";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import { findActiveOverlaps, missingIngredientInfo } from "@/lib/skincare/product-validation";
import type { ProductCategory, ProductStatus } from "@/lib/skincare/types";

const CATEGORIES: Array<ProductCategory | "all"> = ["all", "cleanser", "toner", "serum", "treatment", "exfoliant", "moisturizer", "sunscreen", "oil", "eye", "mask", "other"];

export default function ShelfPage() {
  const { ready, data } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const overlaps = useMemo(() => findActiveOverlaps(data.products), [data.products]);
  if (!ready) return <LoadingState />;
  const products = data.products.filter((product) => {
    const haystack = `${product.name} ${product.brand} ${product.ingredients.map((item) => item.name).join(" ")}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (category !== "all" && product.category !== category) return false;
    if (status !== "all" && product.status !== status) return false;
    return true;
  });
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Inventory</p>
          <h1 className="display mt-2 text-4xl">My shelf</h1>
        </div>
        <Link href="/shelf/new" className="bg-ink px-4 py-2 text-sm text-bg">
          Add product
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, brand, ingredient" aria-label="Search products" />
        <select className="field" value={category} onChange={(event) => setCategory(event.target.value as (typeof CATEGORIES)[number])} aria-label="Filter by category">
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="field" value={status} onChange={(event) => setStatus(event.target.value as ProductStatus | "all")} aria-label="Filter by status">
          {["all", "in-use", "paused", "finished", "discarded"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      {overlaps.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-caution">
          {overlaps.map((overlap) => (
            <li key={overlap.key}>
              Overlap: {overlap.label} in {overlap.productNames.join(", ")}.
            </li>
          ))}
        </ul>
      ) : null}
      {data.products.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="The shelf is empty." body="Add a product from its package. CelestCare will not invent an ingredient list from the name." action={<Link href="/shelf/new" className="border border-line px-3 py-2 text-sm">Add the first product</Link>} />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
              {missingIngredientInfo(product) ? null : null}
            </div>
          ))}
          {products.length === 0 ? <p className="text-sm text-muted">No products match that filter.</p> : null}
        </div>
      )}
    </div>
  );
}
