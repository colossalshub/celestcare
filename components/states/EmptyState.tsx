export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line px-6 py-10">
      <h2 className="display text-3xl">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
