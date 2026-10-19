"use client";

import { useParams } from "next/navigation";
import { ProductEditor } from "@/components/products/ProductEditor";
import { useApp } from "@/components/providers/AppProvider";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const { ready, data } = useApp();
  if (!ready) return <LoadingState />;
  const product = data.products.find((item) => item.id === params.id);
  if (!product) return <EmptyState title="That product is not on this shelf." body="Return to the shelf and choose another product." />;
  return (
    <div className="mx-auto max-w-3xl">
      <p className="kicker">Edit</p>
      <h1 className="display mt-2 text-4xl">{product.name}</h1>
      <div className="mt-6">
        <ProductEditor product={product} />
      </div>
    </div>
  );
}
