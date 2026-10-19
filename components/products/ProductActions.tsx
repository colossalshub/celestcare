"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { ConfirmationDialog } from "@/components/states/ConfirmationDialog";
import { createId, deleteProduct } from "@/lib/state/model";
import type { ProductReaction } from "@/lib/skincare/types";

export function ProductActions({ productId }: { productId: string }) {
  const { update } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<ProductReaction["severity"]>("mild");
  const [description, setDescription] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <section className="mt-10 border-t border-line pt-6">
      <h2 className="text-lg">Observed reaction</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        A severe or emergency reaction removes the product from recommendations. This is not a diagnosis.
      </p>
      <div className="mt-4 grid max-w-xl gap-3">
        <label className="text-sm">
          Severity
          <select className="field mt-1" value={severity} onChange={(event) => setSeverity(event.target.value as ProductReaction["severity"])}>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </label>
        <label className="text-sm">
          What happened
          <textarea className="field mt-1" value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={emergency} onChange={(event) => setEmergency(event.target.checked)} />
          Breathing trouble, swelling of the tongue or throat, faintness, or a rapidly spreading reaction
        </label>
        <button
          type="button"
          className="w-fit border border-line px-3 py-2 text-sm"
          onClick={() => {
            if (!description.trim() && !emergency && severity === "mild") return;
            update((current) => ({
              ...current,
              products: current.products.map((product) =>
                product.id === productId
                  ? {
                      ...product,
                      reactions: [
                        ...product.reactions,
                        {
                          id: createId("reaction"),
                          date: new Date().toISOString().slice(0, 10),
                          severity: emergency ? "severe" : severity,
                          emergency,
                          description: description.trim() || "Reaction recorded without a note.",
                          ongoing: severity !== "mild" || emergency,
                        },
                      ],
                    }
                  : product,
              ),
            }));
            setDescription("");
            setOpen(true);
          }}
        >
          Save reaction
        </button>
        {open ? <p className="text-sm text-muted">Saved on this device. Refresh today&apos;s routine to see the effect.</p> : null}
      </div>
      <button type="button" className="mt-8 text-sm text-block" onClick={() => setConfirmDelete(true)}>
        Remove product
      </button>
      <ConfirmationDialog
        open={confirmDelete}
        title="Remove this product?"
        body="It will leave this device's shelf. The routine will be rebuilt without it."
        confirmLabel="Remove"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          update((current) => deleteProduct(current, productId));
          router.push("/shelf");
        }}
      />
    </section>
  );
}
