"use client";

import { ProductMark } from "@/components/products/ProductMark";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { gradeForClaims } from "@/lib/skincare/evidence-ranking";
import type { PlannedStep } from "@/lib/skincare/types";

export function RoutineStep({
  step,
  action,
  onComplete,
  onSkip,
  onRemove,
}: {
  step: PlannedStep;
  action?: "completed" | "skipped";
  onComplete?: () => void;
  onSkip?: () => void;
  onRemove?: () => void;
}) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
      <div className="flex flex-col items-center">
        <span className="flex h-7 w-7 items-center justify-center border border-line text-xs">{step.order}</span>
        <span className="mt-2 w-px flex-1 bg-line" aria-hidden />
      </div>
      <article className="pb-6">
        <div className="flex gap-3">
          <ProductMark category={step.category} name={step.productName} />
          <div className="min-w-0">
            <p className="kicker">{step.brand}</p>
            <h3 className="mt-1 text-lg">{step.productName}</h3>
            <p className="text-sm text-muted">{step.purpose}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6">{step.why}</p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="kicker">Frequency</dt>
            <dd>{step.frequency}</dd>
          </div>
          {step.amount ? (
            <div>
              <dt className="kicker">Amount</dt>
              <dd>{step.amount}</dd>
            </div>
          ) : null}
          {step.waitTime ? (
            <div>
              <dt className="kicker">Wait from the label</dt>
              <dd>{step.waitTime}</dd>
            </div>
          ) : null}
        </dl>
        {step.limitations.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-4 text-sm leading-6 text-muted">
            {step.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {step.evidenceClaimIds.length > 0 ? <div className="mt-3"><EvidenceBadge grade={gradeForClaims(step.evidenceClaimIds)} /></div> : null}
        {step.safetyNote ? <p className="mt-3 text-sm text-caution">{step.safetyNote}</p> : null}
        {onComplete && onSkip ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="border border-line px-3 py-2 text-sm" onClick={onComplete} aria-pressed={action === "completed"}>
              {action === "completed" ? "Done" : "Mark done"}
            </button>
            <button type="button" className="px-3 py-2 text-sm text-muted" onClick={onSkip} aria-pressed={action === "skipped"}>
              {action === "skipped" ? "Skipped" : "Skip"}
            </button>
            {onRemove ? (
              <button type="button" className="px-3 py-2 text-sm text-muted" onClick={onRemove}>
                Remove from plan
              </button>
            ) : null}
          </div>
        ) : null}
      </article>
    </li>
  );
}
