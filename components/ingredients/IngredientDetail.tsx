"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { SourceCitation } from "@/components/evidence/SourceCitation";
import { useApp } from "@/components/providers/AppProvider";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import { getAliasRecord } from "@/lib/skincare/ingredient-aliases";
import { canonicalIds } from "@/lib/skincare/product-validation";
import { getClaim } from "@/lib/research/claims";
import { getMonograph } from "@/lib/research/ingredients";

export function IngredientDetail() {
  const params = useParams<{ id: string }>();
  const { ready, data } = useApp();
  if (!ready) return <LoadingState />;
  const record = getAliasRecord(params.id);
  if (!record) return <EmptyState title="That ingredient is not in the library." body="Try the search on the ingredient page." />;
  const monograph = getMonograph(record.id);
  const products = data.products.filter((product) => canonicalIds(product).has(record.id));
  return (
    <article className="mx-auto max-w-3xl">
      <p className="kicker">Ingredient</p>
      <h1 className="display mt-2 text-4xl">{record.name}</h1>
      <p className="mt-2 text-sm text-muted">Also called {record.aliases.join(", ") || "no stored aliases"}.</p>
      {monograph ? (
        <>
          <div className="mt-4">
            <EvidenceBadge grade={monograph.grade} />
          </div>
          <p className="mt-4 text-sm">
            Category: {monograph.category}. Reviewed {monograph.lastReviewed}.
          </p>
          <h2 className="mt-6 text-lg">Functions</h2>
          <ul className="mt-2 list-disc pl-4 text-sm leading-6">
            {monograph.functions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2 className="mt-6 text-lg">What the reviewed sources support</h2>
          {monograph.benefitClaimIds.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No graded benefit claim is stored. The name is still used for matching and overlap.</p>
          ) : null}
          <ul className="mt-3 space-y-4">
            {monograph.benefitClaimIds.map((claimId) => {
              const claim = getClaim(claimId);
              if (!claim) return null;
              return (
                <li key={claimId}>
                  <p className="text-sm leading-6">{claim.text}</p>
                  <p className="mt-1 text-sm text-muted">{claim.limitations}</p>
                  <ul className="mt-2">
                    {claim.sourceIds.map((sourceId) => (
                      <SourceCitation key={sourceId} sourceId={sourceId} />
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
          <h2 className="mt-6 text-lg">Limits and precautions</h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-6">
            {[...monograph.limitations, ...monograph.irritation, ...monograph.precautions, ...monograph.compatibility].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {monograph.pregnancy ? <p className="mt-4 text-sm leading-6">Pregnancy note: {monograph.pregnancy}</p> : null}
        </>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted">This name is recognized for allergy and overlap matching. A clinical monograph was not added.</p>
      )}
      <h2 className="mt-8 text-lg">In your inventory</h2>
      {products.length === 0 ? (
        <p className="mt-2 text-sm text-muted">None of the saved products list it.</p>
      ) : (
        <ul className="mt-2 text-sm">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/shelf/${product.id}`} className="hover:text-accent">
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
