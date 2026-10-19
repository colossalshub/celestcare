import type { PlanAlert } from "@/lib/skincare/types";

const TONE: Record<PlanAlert["tone"], string> = {
  emergency: "border-block bg-block-bg text-block",
  block: "border-block bg-block-bg text-block",
  caution: "border-caution bg-caution-bg text-caution",
  info: "border-line bg-soft text-ink",
};

export function SafetyAlert({ alert }: { alert: PlanAlert }) {
  return (
    <article className={`border px-4 py-3 ${TONE[alert.tone]}`} role={alert.tone === "emergency" ? "alert" : "status"}>
      <h3 className="text-sm font-medium">{alert.title}</h3>
      <p className="mt-1 text-sm leading-6">{alert.body}</p>
    </article>
  );
}
