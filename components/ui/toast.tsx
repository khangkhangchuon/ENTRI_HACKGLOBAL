"use client";

import { create } from "zustand";
import { Check } from "lucide-react";

interface ToastState {
  toasts: { id: number; text: string }[];
  show: (text: string) => void;
}

let next = 1;

const useToasts = create<ToastState>((set) => ({
  toasts: [],
  show: (text) => {
    const id = next++;
    set((s) => ({ toasts: [...s.toasts, { id, text }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      4500,
    );
  },
}));

// Call toast("Saved") from anywhere to confirm an action.
export const toast = (text: string) => useToasts.getState().show(text);

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-full bg-night-900 px-4 py-2.5 text-[15px] text-paper shadow-lg"
        >
          <Check className="h-4 w-4 text-ember-400" aria-hidden />
          {t.text}
        </div>
      ))}
    </div>
  );
}
