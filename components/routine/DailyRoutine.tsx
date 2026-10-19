import { RoutineStep } from "@/components/routine/RoutineStep";
import type { AdherenceEvent, PlannedStep } from "@/lib/skincare/types";

export function DailyRoutine({
  title,
  steps,
  adherence,
  onComplete,
  onSkip,
  onRemove,
}: {
  title: string;
  steps: PlannedStep[];
  adherence: AdherenceEvent[];
  onComplete?: (step: PlannedStep) => void;
  onSkip?: (step: PlannedStep) => void;
  onRemove?: (step: PlannedStep) => void;
}) {
  const done = steps.filter((step) => adherence.some((event) => event.productId === step.productId && event.period === step.period && event.action === "completed")).length;
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="display text-3xl">{title}</h2>
        <p className="text-sm text-muted">
          {done} of {steps.length} done
        </p>
      </div>
      {steps.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nothing is scheduled for this part of the day.</p>
      ) : (
        <ol className="mt-5">
          {steps.map((step) => {
            const event = adherence.find((item) => item.productId === step.productId && item.period === step.period);
            return (
              <RoutineStep
                key={step.id}
                step={step}
                action={event?.action}
                onComplete={onComplete ? () => onComplete(step) : undefined}
                onSkip={onSkip ? () => onSkip(step) : undefined}
                onRemove={onRemove ? () => onRemove(step) : undefined}
              />
            );
          })}
        </ol>
      )}
    </section>
  );
}
