"use client";

import { useParams } from "next/navigation";
import { ProductDetailPanel } from "@/components/products/ProductDetailPanel";
import { ProductActions } from "@/components/products/ProductActions";
import { useApp } from "@/components/providers/AppProvider";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const { ready, data } = useApp();
  if (!ready) return <LoadingState />;
  const product = data.products.find((item) => item.id === params.id);
  if (!product) return <EmptyState title="That product is not on this shelf." body="It may have been deleted, or you may be looking at the other inventory." />;
  return (
    <div className="mx-auto max-w-4xl">
      <ProductDetailPanel product={product} profile={data.profile} />
      <ProductActions productId={product.id} />
    </div>
  );
}
