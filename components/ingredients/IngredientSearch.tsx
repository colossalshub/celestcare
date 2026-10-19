"use client";

import { useMemo, useState } from "react";
import { ALIAS_RECORDS, lookupAlias } from "@/lib/skincare/ingredient-aliases";
import { canonicalIds } from "@/lib/skincare/product-validation";
import { getMonograph } from "@/lib/research/ingredients";
import type { Product } from "@/lib/skincare/types";
import Link from "next/link";

export function IngredientSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (normalized.length < 2) return ALIAS_RECORDS.slice(0, 8);
    return ALIAS_RECORDS.filter((record) =>
      [record.name, record.id, ...record.aliases].join(" ").toLowerCase().includes(normalized),
    ).slice(0, 12);
  }, [normalized]);
  const alias = lookupAlias(query);
  const containing = alias
    ? products.filter((product) => canonicalIds(product).has(alias) && product.status === "in-use")
    : [];

  return (
    <div>
      <label className="text-sm" htmlFor="ingredient-query">
        Search ingredients
      </label>
      <input
        id="ingredient-query"
        className="field mt-2"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Niacinamide, salicylic acid, parfum"
      />
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {matches.map((record) => {
          const monograph = getMonograph(record.id);
          return (
            <li key={record.id} className="py-3">
              <Link href={`/ingredients/${record.id}`} className="text-base hover:text-accent">
                {record.name}
              </Link>
              <p className="text-sm text-muted">
                {monograph ? monograph.category : "Recognized for matching. No clinical monograph is stored."}
              </p>
            </li>
          );
        })}
      </ul>
      {alias ? (
        <div className="mt-4">
          <h3 className="text-sm font-medium">On your active shelf</h3>
          {containing.length === 0 ? (
            <p className="mt-2 text-sm text-muted">None of your in-use products list this ingredient.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {containing.map((product) => (
                <li key={product.id}>
                  <Link href={`/shelf/${product.id}`} className="hover:text-accent">
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
