import Link from "next/link";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { IngredientChip } from "@/components/ingredients/IngredientChip";
import { ProductMark } from "@/components/products/ProductMark";
import { SourceCitation } from "@/components/evidence/SourceCitation";
import { gradeForClaims } from "@/lib/skincare/evidence-ranking";
import { screenProduct } from "@/lib/skincare/allergy-screening";
import { classesForProduct } from "@/lib/skincare/product-validation";
import { goalSupport } from "@/lib/skincare/goals";
import { getClaim } from "@/lib/research/claims";
import type { Product, UserProfile } from "@/lib/skincare/types";

export function ProductDetailPanel({ product, profile }: { product: Product; profile: UserProfile | null }) {
  const screen = profile ? screenProduct(product, profile) : null;
  const classes = [...classesForProduct(product)];
  const claimIds = profile
    ? [...new Set(profile.goals.flatMap((goal) => (goalSupport(product, goal.id).supports ? goalSupport(product, goal.id).claimIds : [])))]
    : [];
  return (
    <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
      <div className="panel flex items-center justify-center py-6">
        {product.labelImageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.labelImageDataUrl} alt="Photo of the product label, stored only on this device" className="max-h-64 w-full object-contain" />
        ) : (
          <ProductMark category={product.category} name={product.name} />
        )}
      </div>
      <div>
        <p className="kicker">{product.brand}</p>
        <h1 className="display mt-2 text-4xl">{product.name}</h1>
        <p className="mt-3 text-sm text-muted">
          {product.category} · {product.status} · {product.remaining} remaining
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="kicker">Provenance</dt>
            <dd className="mt-1 text-sm leading-6">{product.provenance.detail}</dd>
          </div>
          <div>
            <dt className="kicker">List status</dt>
            <dd className="mt-1 text-sm">{product.ingredientListStatus}</dd>
          </div>
          {product.instructions ? (
            <div>
              <dt className="kicker">Instructions</dt>
              <dd className="mt-1 text-sm leading-6">{product.instructions}</dd>
            </div>
          ) : null}
          {product.frequency ? (
            <div>
              <dt className="kicker">Frequency</dt>
              <dd className="mt-1 text-sm">{product.frequency}</dd>
            </div>
          ) : null}
          {product.amountGuidance ? (
            <div>
              <dt className="kicker">Amount</dt>
              <dd className="mt-1 text-sm leading-6">{product.amountGuidance}</dd>
            </div>
          ) : null}
          {product.waitTime ? (
            <div>
              <dt className="kicker">Wait</dt>
              <dd className="mt-1 text-sm">{product.waitTime}</dd>
            </div>
          ) : null}
          {product.category === "sunscreen" ? (
            <div>
              <dt className="kicker">Label sun claims</dt>
              <dd className="mt-1 text-sm leading-6">
                SPF {product.spf ?? "not recorded"}. Broad spectrum {product.broadSpectrum == null ? "not recorded" : product.broadSpectrum ? "yes" : "no"}.
                Water resistant {product.waterResistant == null ? "not recorded" : product.waterResistant ? `${product.waterResistantMinutes ?? "time not recorded"} min` : "no"}.
              </dd>
            </div>
          ) : null}
        </dl>
        <h2 className="mt-8 text-sm font-medium">Ingredients</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.ingredients.length === 0 ? (
            <p className="text-sm text-muted">No ingredient list is stored. This product is not allergy-cleared.</p>
          ) : (
            product.ingredients.map((ingredient) => (
              <IngredientChip key={ingredient.name} id={ingredient.canonicalId} name={ingredient.name} />
            ))
          )}
        </div>
        {classes.length > 0 ? <p className="mt-3 text-xs text-muted">Tracked groups: {classes.join(", ")}</p> : null}
        {screen ? (
          <p className="mt-4 border border-line bg-elevated px-3 py-3 text-sm leading-6">{screen.summary}</p>
        ) : null}
        {product.prescription ? (
          <p className="mt-4 text-sm leading-6">
            Prescription instructions on file: {product.prescriberInstructions || "None recorded beyond the schedule."} CelestCare will not increase this frequency.
          </p>
        ) : null}
        {claimIds.length > 0 ? (
          <div className="mt-6">
            <EvidenceBadge grade={gradeForClaims(claimIds)} />
            <ul className="mt-3 space-y-2">
              {[...new Set(claimIds)].map((id) => (
                <ClaimSources key={id} claimId={id} />
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">No graded clinical claim is attached to this product. Ingredient presence is not an outcome.</p>
        )}
        <div className="mt-6 flex gap-3 text-sm">
          <Link href={`/shelf/${product.id}/edit`} className="border border-line px-3 py-2">
            Edit
          </Link>
          <Link href="/shelf" className="px-3 py-2 text-muted">
            Back to shelf
          </Link>
        </div>
      </div>
    </div>
  );
}

function ClaimSources({ claimId }: { claimId: string }) {
  const claim = getClaim(claimId);
  if (!claim) return null;
  return (
    <li>
      <p className="text-sm leading-6">{claim.text}</p>
      <ul className="mt-1">
        {claim.sourceIds.map((sourceId) => (
          <SourceCitation key={sourceId} sourceId={sourceId} />
        ))}
      </ul>
    </li>
  );
}
