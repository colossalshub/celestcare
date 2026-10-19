import { getSource } from "@/lib/research/sources";

export function SourceCitation({ sourceId }: { sourceId: string }) {
  const source = getSource(sourceId);
  if (!source) return null;
  return (
    <li className="text-sm leading-6">
      <a className="text-accent underline-offset-2 hover:underline" href={source.url} target="_blank" rel="noreferrer">
        {source.title}
      </a>
      <span className="text-muted"> — {source.organization}</span>
      {source.publishedOrRevised ? <span className="text-muted"> · {source.publishedOrRevised}</span> : null}
      <span className="text-muted"> · verified {source.lastVerified}</span>
    </li>
  );
}
