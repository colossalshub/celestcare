"use client";

import { useEffect, useRef } from "react";

export function ConfirmationDialog({
  open,
  title,
  body,
  confirmLabel,
  tone = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md border border-line bg-surface p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="display text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="border border-line px-3 py-2 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`px-3 py-2 text-sm ${tone === "danger" ? "bg-block text-white" : "bg-ink text-bg"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
