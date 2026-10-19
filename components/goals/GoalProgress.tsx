import Link from "next/link";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { GOAL_DEFINITIONS, goalSupport } from "@/lib/skincare/goals";
import { gradeForClaims } from "@/lib/skincare/evidence-ranking";
import type { JournalEntry, Product, UserProfile } from "@/lib/skincare/types";

export function GoalProgress({
  profile,
  products,
  journal,
  adherenceDays,
}: {
  profile: UserProfile;
  products: Product[];
  journal: JournalEntry[];
  adherenceDays: { completed: number; logged: number };
}) {
  const active = products.filter((product) => product.status === "in-use");
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        {adherenceDays.completed} of {adherenceDays.logged} logged routine steps were marked done. That is adherence, not a change in your skin.
        Journal entries: {journal.length}. Weekly notes are enough for most goals.
      </p>
      {profile.goals.map((goal) => {
        const definition = GOAL_DEFINITIONS.find((item) => item.id === goal.id);
        const matches = active
          .map((product) => ({ product, support: goalSupport(product, goal.id) }))
          .filter((item) => item.support.supports);
        return (
          <article key={goal.id} className="border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg">{definition?.label}</h3>
              <span className="text-xs uppercase tracking-[0.14em] text-muted">Priority {goal.priority}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{definition?.expectation}</p>
            {matches.length === 0 ? (
              <p className="mt-3 text-sm">No eligible product on your shelf maps to this goal. Nothing will be recommended for purchase.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {matches.map(({ product, support }) => (
                  <li key={product.id}>
                    <Link href={`/shelf/${product.id}`} className="text-sm hover:text-accent">
                      {product.name}
                    </Link>
                    <p className="text-sm leading-6 text-muted">{support.limitation}</p>
                    {support.claimIds.length > 0 ? <EvidenceBadge grade={gradeForClaims(support.claimIds)} /> : <p className="text-xs text-muted">No graded claim stored.</p>}
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}
    </div>
  );
}
