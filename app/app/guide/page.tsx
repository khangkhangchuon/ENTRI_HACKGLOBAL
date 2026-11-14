"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Compass, ListChecks, MessageCircle } from "lucide-react";
import { LoopDiagram } from "@/components/landing/loop-diagram";
import { bigPrimary } from "@/components/user/app-shell";
import { ReadAloud } from "@/components/user/read-aloud";
import { selectMainClient, useDemo } from "@/lib/demo/store";

// The short guide a person sees right after signing in for the first time.
export default function GuidePage() {
  const router = useRouter();
  const me = useDemo(selectMainClient);
  const markGuideSeen = useDemo((s) => s.markGuideSeen);
  const [page, setPage] = useState(0);
  const steps = me.plan.slice(0, 4);

  const finish = () => {
    markGuideSeen();
    router.replace("/app");
  };

  return (
    <div className="flex min-h-full flex-col px-6 pb-8 pt-6 text-lg">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-ember-700">
          Your guide, {page + 1} of 3
        </p>
        <ReadAloud />
      </div>

      {page === 0 && (
        <div className="mt-4">
          <h1 className="font-display text-3xl leading-tight">
            Welcome, {me.firstName}. Coming home can feel like a loop.
          </h1>
          <LoopDiagram className="mx-auto mt-2 w-full max-w-xs" />
          <p className="text-ink-soft">
            A home needs a job. A job needs an ID. An ID needs an address. It is
            hard to know where to begin.
          </p>
        </div>
      )}

      {page === 1 && (
        <div className="mt-4">
          <h1 className="font-display text-3xl leading-tight">
            Entri turns the loop into a path.
          </h1>
          <p className="mt-2 text-ink-soft">
            Your plan is ready now. You do one step at a time, and each step
            opens the next.
          </p>
          <ol className="mt-5">
            {steps.map((s, i) => (
              <li key={s.id} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold ${i === 0 ? "bg-ember-500 text-white" : "bg-sand-200 text-ink-soft"}`}
                  >
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="h-6 w-0.5 bg-sand-300" />
                  )}
                </div>
                <p
                  className={`pt-1 ${i === 0 ? "font-semibold" : "text-ink-soft"}`}
                >
                  {s.title}
                </p>
              </li>
            ))}
          </ol>
          {me.plan.length > steps.length && (
            <p className="mt-2 text-ink-soft">
              And {me.plan.length - steps.length} more after that.
            </p>
          )}
        </div>
      )}

      {page === 2 && (
        <div className="mt-4">
          <h1 className="font-display text-3xl leading-tight">
            Help is here when you want it.
          </h1>
          <ul className="mt-5 space-y-4">
            {[
              {
                icon: ListChecks,
                title: "My plan",
                text: "See every step and what comes next.",
              },
              {
                icon: Compass,
                title: "Find help",
                text: "Jobs, housing, health care and more, from many organizations.",
              },
              {
                icon: MessageCircle,
                title: "Ask Entri",
                text: "Ask a question in your own words, any time.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ember-100 text-ember-700">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-ink-soft">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-2xl bg-sand-100 p-4 text-[17px]">
            You can do all of this on your own. If you ever want a person to
            help, you can ask for a caseworker in Find help.
          </p>
        </div>
      )}

      <div className="mt-auto space-y-3 pt-8">
        <button
          type="button"
          className={bigPrimary}
          onClick={() => (page < 2 ? setPage(page + 1) : finish())}
        >
          {page < 2 ? "Next" : "Show me my first step"}
        </button>
        {page < 2 && (
          <button
            type="button"
            onClick={finish}
            className="w-full py-2 text-center font-semibold text-ink-soft underline"
          >
            Skip the guide
          </button>
        )}
      </div>
    </div>
  );
}
