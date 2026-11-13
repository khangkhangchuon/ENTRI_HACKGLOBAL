"use client";

import { Check } from "lucide-react";
import { useDemoReady } from "@/components/demo/demo-provider";
import { selectMainClient, useDemo } from "@/lib/demo/store";

// Phase 0 placeholder for the user side. It proves that a change made as
// Marcus reaches Diane. The full app arrives in Phase 3.
export default function UserFoundationPage() {
  const ready = useDemoReady();
  const marcus = useDemo(selectMainClient);
  const completeStep = useDemo((s) => s.completeStep);

  if (!ready) return <div className="p-10 text-ink-soft">Loading the demo…</div>;

  const current = marcus.plan.find((s) => s.status === "current");
  const index = current ? marcus.plan.indexOf(current) : marcus.plan.length;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-ember-700">
        Phase 0 foundation check
      </p>
      <h1 className="mt-1 font-display text-4xl">Hi, {marcus.firstName}</h1>

      {current ? (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sand-200">
          <p className="text-ink-soft">
            Step {index + 1} of {marcus.plan.length}
          </p>
          <h2 className="mt-1 font-display text-3xl">{current.title}</h2>
          <p className="mt-3 text-lg">{current.what}</p>
          <p className="mt-4 font-semibold">Where to go</p>
          <p className="text-lg">{current.where}</p>
          <p className="mt-4 font-semibold">What to bring</p>
          <ul className="list-disc pl-5 text-lg">
            {current.bring.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => completeStep(marcus.id, current.id)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ember-600 px-5 py-4 text-xl font-semibold text-white hover:bg-ember-700"
          >
            <Check className="h-6 w-6" aria-hidden />I did this
          </button>
        </section>
      ) : (
        <p className="mt-6 text-lg">
          {marcus.plan.length > 0
            ? "You finished every step in your plan."
            : "Your caseworker is getting your plan ready."}
        </p>
      )}

      <ol className="mt-6 space-y-2">
        {marcus.plan.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 text-lg">
            <span
              className={
                s.status === "done"
                  ? "flex h-7 w-7 items-center justify-center rounded-full bg-moss-600 text-white"
                  : s.status === "current"
                    ? "flex h-7 w-7 items-center justify-center rounded-full bg-ember-600 text-white"
                    : "flex h-7 w-7 items-center justify-center rounded-full bg-sand-200 text-ink-soft"
              }
            >
              {s.status === "done" ? <Check className="h-4 w-4" aria-label="Done" /> : i + 1}
            </span>
            <span className={s.status === "locked" ? "text-ink-soft" : ""}>{s.title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
