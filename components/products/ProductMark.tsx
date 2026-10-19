import type { ProductCategory } from "@/lib/skincare/types";

export function ProductMark({ category, name }: { category: ProductCategory; name: string }) {
  const tall = category === "cleanser" || category === "toner" || category === "serum" || category === "treatment";
  return (
    <svg viewBox="0 0 64 80" aria-hidden className="h-16 w-12 text-accent">
      <title>{name}</title>
      {category === "sunscreen" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="18" y="22" width="28" height="42" />
          <rect x="24" y="14" width="16" height="8" />
          <path d="M32 8v4M22 12l3 3M42 12l-3 3" />
        </g>
      ) : category === "moisturizer" || category === "oil" || category === "mask" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="16" y="28" width="32" height="34" />
          <path d="M22 28c0-8 20-8 20 0" />
        </g>
      ) : (
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d={tall ? "M24 18h16v8H24zM22 26h20l4 40H18z" : "M20 24h24v40H20z"} />
        </g>
      )}
    </svg>
  );
}
