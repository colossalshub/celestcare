"use client";

import { useState } from "react";
import { assessInventory, type ProductRelationship } from "@/lib/skincare/compatibility-rules";
import type { Product, UserProfile } from "@/lib/skincare/types";
import { CompatibilityDetail } from "@/components/compatibility/CompatibilityDetail";

const LEVEL_CLASS: Record<string, string> = {
  BLOCK: "bg-block",
  HIGH_CAUTION: "bg-block",
  CAUTION: "bg-caution",
  INFORMATION: "bg-accent",
  UNKNOWN: "bg-muted",
  COMPATIBLE: "bg-ok",
};

export function CompatibilityMap({ products, profile }: { products: Product[]; profile: UserProfile }) {
  const active = products.filter((product) => product.status === "in-use");
  const relationships = assessInventory(products, profile).filter((item) => item.level !== "COMPATIBLE" || item.kind === "complementary");
  const [selected, setSelected] = useState<ProductRelationship | null>(relationships[0] ?? null);
  const shown = relationships.slice(0, 24);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <ul className="mb-4 flex flex-wrap gap-3 text-xs text-muted" aria-label="Legend">
          {[
            ["Block or high caution", "bg-block"],
            ["Caution", "bg-caution"],
            ["Information", "bg-accent"],
            ["Unknown", "bg-muted"],
            ["No specific issue", "bg-ok"],
          ].map(([label, color]) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`h-2 w-2 ${color}`} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
        {active.length < 2 ? (
          <p className="text-sm text-muted">Add at least two in-use products to map relationships.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {shown.map((relationship) => {
              const left = active.find((product) => product.id === relationship.productAId);
              const right = active.find((product) => product.id === relationship.productBId);
              const selectedPair = selected?.productAId === relationship.productAId && selected.productBId === relationship.productBId;
              return (
                <li key={`${relationship.productAId}-${relationship.productBId}`}>
                  <button
                    type="button"
                    className={`flex w-full items-start gap-3 py-3 text-left ${selectedPair ? "bg-soft" : ""}`}
                    onClick={() => setSelected(relationship)}
                  >
                    <span className={`mt-1 h-2 w-2 shrink-0 ${LEVEL_CLASS[relationship.level] ?? "bg-muted"}`} aria-hidden />
                    <span>
                      <span className="block text-sm">
                        {left?.name ?? "Product"} and {right?.name ?? "Product"}
                      </span>
                      <span className="text-xs uppercase tracking-[0.12em] text-muted">
                        {relationship.level} · {relationship.kind}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <CompatibilityDetail relationship={selected} products={active} />
    </div>
  );
}
