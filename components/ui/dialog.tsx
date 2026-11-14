"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// A modal window built on the browser's own <dialog>, which keeps keyboard
// focus inside it and closes on Escape.
export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] rounded-2xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-night-950/50 ${wide ? "max-w-3xl" : "max-w-xl"}`}
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-2xl">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-ink-soft hover:bg-sand-100"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}
