import { SourceCitation } from "@/components/evidence/SourceCitation";
import type { ProductRelationship } from "@/lib/skincare/compatibility-rules";
import type { Product } from "@/lib/skincare/types";

export function CompatibilityDetail({
  relationship,
  products,
}: {
  relationship: ProductRelationship | null;
  products: Product[];
}) {
  if (!relationship) {
    return <p className="text-sm text-muted">Select a relationship to see why it was flagged.</p>;
  }
  const left = products.find((product) => product.id === relationship.productAId);
  const right = products.find((product) => product.id === relationship.productBId);
  return (
    <article className="border border-line p-4">
      <p className="kicker">{relationship.level}</p>
      <h2 className="display mt-2 text-3xl">{relationship.title}</h2>
      <p className="mt-2 text-sm text-muted">
        {left?.name} · {right?.name}
      </p>
      <h3 className="mt-5 text-sm font-medium">What triggered this</h3>
      <ul className="mt-2 list-disc pl-4 text-sm leading-6">
        {relationship.triggers.map((trigger) => (
          <li key={trigger}>{trigger}</li>
        ))}
      </ul>
      <h3 className="mt-5 text-sm font-medium">Evidence</h3>
      <p className="mt-2 text-sm leading-6">{relationship.evidenceSummary}</p>
      <h3 className="mt-5 text-sm font-medium">What you can do</h3>
      <p className="mt-2 text-sm leading-6">{relationship.practicalAction}</p>
      {relationship.uncertain ? <p className="mt-3 text-sm text-caution">This assessment is uncertain.</p> : null}
      <ul className="mt-4 space-y-2">
        {relationship.sourceIds.map((sourceId) => (
          <SourceCitation key={sourceId} sourceId={sourceId} />
        ))}
      </ul>
    </article>
  );
}
