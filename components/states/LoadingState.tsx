export function LoadingState({ label = "Loading your shelf" }: { label?: string }) {
  return (
    <div role="status" className="py-16">
      <p className="kicker">CelestCare</p>
      <p className="mt-3 text-sm text-muted">{label}</p>
    </div>
  );
}
