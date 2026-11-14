"use client";

import { useRouter } from "next/navigation";
import { create } from "zustand";
import { Check } from "lucide-react";
import { bigPrimary } from "@/components/user/app-shell";
import { selectMainClient, useDemo } from "@/lib/demo/store";

// Which step was just finished, if any. Kept only for the moment itself.
const useCelebration = create<{ title: string | null; set: (title: string | null) => void }>(
  (set) => ({ title: null, set: (title) => set({ title }) }),
);

export function StepDoneButton({ stepId }: { stepId: string }) {
  const me = useDemo(selectMainClient);
  const completeStep = useDemo((s) => s.completeStep);
  const celebrate = useCelebration((s) => s.set);
  const step = me.plan.find((s) => s.id === stepId);
  if (!step || step.status !== "current") return null;

  return (
    <button
      type="button"
      className={bigPrimary}
      onClick={() => {
        completeStep(me.id, stepId);
        celebrate(step.title);
      }}
    >
      <Check className="h-6 w-6" aria-hidden />I did this
    </button>
  );
}

// The small, warm moment after a step is marked done. It covers the phone
// screen until the person moves on.
export function Celebration() {
  const router = useRouter();
  const me = useDemo(selectMainClient);
  const title = useCelebration((s) => s.title);
  const clear = useCelebration((s) => s.set);
  if (!title) return null;
  const next = me.plan.find((s) => s.status === "current");

  return (
    <div
      role="alertdialog"
      aria-label="Step done"
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-paper px-6 text-center text-lg"
      style={{ animation: "entri-rise 400ms ease-out" }}
    >
      <span
        className="flex h-20 w-20 items-center justify-center rounded-full bg-moss-600 text-white shadow-[0_0_0_12px_rgba(47,107,79,0.15)]"
        style={{ animation: "entri-pop 600ms ease-out" }}
      >
        <Check className="h-11 w-11" aria-hidden />
      </span>
      <h2 className="mt-6 font-display text-3xl leading-tight">
        Done. That is real progress, {me.firstName}.
      </h2>
      <p className="mt-2 text-ink-soft">
        &ldquo;{title}&rdquo; is checked off.{" "}
        {next
          ? `Your next step is open: ${next.title}.`
          : "You have finished every step in your plan."}
      </p>
      <button
        type="button"
        autoFocus
        className={`${bigPrimary} mt-8`}
        onClick={() => {
          clear(null);
          router.push("/app");
        }}
      >
        {next ? "See my next step" : "Back to home"}
      </button>
    </div>
  );
}
