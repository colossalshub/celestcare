export function ErrorState({ title = "Something went wrong", body, onRetry }: { title?: string; body: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="border border-block bg-block-bg px-5 py-4 text-block">
      <h2 className="text-base font-medium">{title}</h2>
      <p className="mt-2 text-sm leading-6">{body}</p>
      {onRetry ? (
        <button type="button" className="mt-3 text-sm underline" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
