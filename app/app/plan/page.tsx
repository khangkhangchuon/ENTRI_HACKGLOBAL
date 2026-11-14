"use client";

import Link from "next/link";
import { Check, ChevronRight, Lock } from "lucide-react";
import { Screen } from "@/components/user/app-shell";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { onCaseload } from "@/lib/demo/types";

export default function PlanPage() {
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);
  const done = me.plan.filter((s) => s.status === "done").length;

  return (
    <Screen
      title="My plan"
      intro={
        me.plan.length === 0
          ? "No steps right now."
          : `${done} of ${me.plan.length} steps done. One step at a time.`
      }
    >
      <p className="rounded-2xl bg-sand-100 p-3.5 text-[17px]">
        {me.planStatus === "approved"
          ? `${caseworker.firstName} reviewed this plan and made it personal for you.`
          : onCaseload(me)
            ? `This is your starter plan. ${caseworker.firstName} can make it more personal when you meet.`
            : "This is your starter plan. It works on its own, with no caseworker needed."}
      </p>

      <ol className="mt-5">
        {me.plan.map((s, i) => {
          const last = i === me.plan.length - 1;
          const previous = me.plan[i - 1];
          return (
            <li key={s.id} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold ${
                    s.status === "done"
                      ? "bg-moss-600 text-white"
                      : s.status === "current"
                        ? "bg-ember-500 text-white"
                        : "bg-sand-200 text-ink-soft"
                  }`}
                >
                  {s.status === "done" ? (
                    <Check className="h-5 w-5" aria-label="Done" />
                  ) : s.status === "locked" ? (
                    <Lock className="h-4 w-4" aria-label="Not open yet" />
                  ) : (
                    i + 1
                  )}
                </span>
                {!last && (
                  <span
                    className={`w-0.5 flex-1 ${s.status === "done" ? "bg-moss-600" : "bg-sand-300"}`}
                  />
                )}
              </div>
              <div className={`min-w-0 flex-1 ${last ? "" : "pb-5"}`}>
                {s.status === "locked" ? (
                  <div className="pt-1.5">
                    <p className="font-semibold text-ink-soft">{s.title}</p>
                    <p className="text-[17px] text-ink-soft">
                      Unlocks after &ldquo;{previous?.title}&rdquo;
                    </p>
                  </div>
                ) : (
                  <Link
                    href={`/app/plan/${s.id}`}
                    className={`flex items-center gap-2 rounded-2xl border bg-white p-3.5 ${
                      s.status === "current"
                        ? "border-2 border-ember-400"
                        : "border-sand-200"
                    }`}
                  >
                    <span className="flex-1">
                      <span className="block font-semibold">{s.title}</span>
                      <span className="block text-[17px] text-ink-soft">
                        {s.status === "done" ? "Done" : "This is your step now"}
                      </span>
                    </span>
                    <ChevronRight
                      className="h-5 w-5 text-ink-soft"
                      aria-hidden
                    />
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Screen>
  );
}
