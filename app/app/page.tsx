"use client";

import Link from "next/link";
import { ChevronRight, Compass, ListChecks, MessageCircle, MessagesSquare } from "lucide-react";
import { bigSecondary } from "@/components/user/app-shell";
import { StepDoneButton } from "@/components/user/step-done";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { greeting } from "@/lib/format";

const DOORS = [
  { href: "/app/plan", label: "My plan", text: "All your steps", icon: ListChecks },
  { href: "/app/find", label: "Find help", text: "Jobs, housing, health", icon: Compass },
  { href: "/app/ask", label: "Ask Entri", text: "Ask in your own words", icon: MessageCircle },
];

export default function HomePage() {
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);
  const current = me.plan.find((s) => s.status === "current");
  const done = me.plan.filter((s) => s.status === "done").length;
  const number = current ? me.plan.indexOf(current) + 1 : me.plan.length;

  return (
    <div className="px-5 pb-8 pt-5 text-lg">
      {/* The greeting depends on the visitor's own clock. */}
      <p className="text-ink-soft" suppressHydrationWarning>
        {greeting()}, {me.firstName}
      </p>
      <h1 className="font-display text-3xl leading-tight">Your next step</h1>

      {current ? (
        <section
          aria-label="Your next step"
          className="mt-4 rounded-3xl border-2 border-ember-400 bg-white p-5 shadow-sm"
        >
          <p className="text-[15px] font-semibold text-ember-700">
            Step {number} of {me.plan.length}
            {done > 0 && `. ${done} done already.`}
          </p>
          <h2 className="mt-1 font-display text-[1.75rem] leading-tight">{current.title}</h2>
          <p className="mt-2">{current.what}</p>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-[15px] font-semibold text-ink-soft">Where to go</dt>
              <dd>{current.where}</dd>
            </div>
            {current.bring.length > 0 && (
              <div>
                <dt className="text-[15px] font-semibold text-ink-soft">What to bring</dt>
                <dd>
                  <ul className="list-disc pl-5">
                    {current.bring.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-5 space-y-2.5">
            <StepDoneButton stepId={current.id} />
            <Link href={`/app/plan/${current.id}`} className={bigSecondary}>
              Help me with this
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-3xl bg-moss-100 p-5">
          {me.plan.length > 0 ? (
            <>
              <h2 className="font-display text-2xl">You finished every step.</h2>
              <p className="mt-1 text-ink-soft">
                That took real work. Find help is still here whenever you need it.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl">You have the basics in place.</h2>
              <p className="mt-1 text-ink-soft">
                There are no steps waiting. Find help is here whenever you need it.
              </p>
            </>
          )}
        </section>
      )}

      <nav aria-label="More" className="mt-5 space-y-2.5">
        {DOORS.map(({ href, label, text, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3.5 rounded-2xl border border-sand-200 bg-white p-4"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ember-100 text-ember-700">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{label}</span>
              <span className="block text-[17px] text-ink-soft">{text}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-ink-soft" aria-hidden />
          </Link>
        ))}
      </nav>

      <Link
        href="/app/messages"
        className="mt-5 flex items-center gap-3.5 rounded-2xl bg-sand-100 p-4"
      >
        <MessagesSquare className="h-6 w-6 shrink-0 text-ember-700" aria-hidden />
        <span>
          <span className="block font-semibold">Talk to {caseworker.firstName}</span>
          <span className="block text-[17px] text-ink-soft">
            Your caseworker at Brooklyn Bridges. A real person.
          </span>
        </span>
      </Link>
    </div>
  );
}
