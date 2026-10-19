"use client";

import { ProductEditor } from "@/components/products/ProductEditor";
import { LoadingState } from "@/components/states/LoadingState";
import { useApp } from "@/components/providers/AppProvider";

export default function NewProductPage() {
  const { ready } = useApp();
  if (!ready) return <LoadingState />;
  return (
    <div className="mx-auto max-w-3xl">
      <p className="kicker">Shelf</p>
      <h1 className="display mt-2 text-4xl">Add a product</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Transcribe the ingredient list from the package. A photo is only a reference until you confirm the text. Barcode scanning, when the browser supports it, does not look the product up.
      </p>
      <div className="mt-6">
        <ProductEditor />
      </div>
    </div>
  );
}
