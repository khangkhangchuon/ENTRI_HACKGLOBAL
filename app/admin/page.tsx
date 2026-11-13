"use client";

import { useDemoReady } from "@/components/demo/demo-provider";
import { daysSince, timeAgo } from "@/lib/format";
import { selectMainClient, useDemo } from "@/lib/demo/store";

// Phase 0 placeholder for the caseworker side. It proves that Diane and
// Marcus read the same data. The full dashboard arrives in Phase 2.
export default function AdminFoundationPage() {
  const ready = useDemoReady();
  const caseworker = useDemo((s) => s.caseworker);
  const clients = useDemo((s) => s.clients);
  const referrals = useDemo((s) => s.referrals);
  const activity = useDemo((s) => s.activity);
  const marcus = useDemo(selectMainClient);

  if (!ready) return <div className="p-10 text-ink-soft">Loading the demo…</div>;

  const stepsThisWeek = clients
    .flatMap((c) => c.plan)
    .filter((s) => s.completedAt && daysSince(s.completedAt) < 7).length;
  const cards = [
    { label: "Active clients", value: clients.length },
    { label: "New this week", value: clients.filter((c) => daysSince(c.createdAt) < 7).length },
    { label: "Steps completed this week", value: stepsThisWeek },
    { label: "Open referrals", value: referrals.filter((r) => r.status !== "completed").length },
  ];
  const current = marcus.plan.find((s) => s.status === "current");
  const done = marcus.plan.filter((s) => s.status === "done").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-ember-700">
        Phase 0 foundation check
      </p>
      <h1 className="mt-1 font-display text-4xl">Good morning, {caseworker.firstName}</h1>
      <p className="mt-2 text-ink-soft">
        This placeholder shows the shared demo data from the caseworker side. Open the Marcus side
        in a second tab, mark his step done, and watch this page update.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-sand-200 bg-white p-4">
            <dt className="text-sm text-ink-soft">{c.label}</dt>
            <dd className="mt-1 font-display text-4xl">{c.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-sand-200 bg-white p-5">
          <h2 className="font-semibold">Marcus Bell</h2>
          <p className="mt-2 text-ink-soft">
            {done} of {marcus.plan.length} steps done.
          </p>
          <p className="mt-1">
            Current step: <strong>{current ? current.title : "Plan complete"}</strong>
          </p>
        </section>

        <section className="rounded-xl border border-sand-200 bg-white p-5">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-3 space-y-3">
            {activity.slice(0, 7).map((a) => (
              <li key={a.id} className="flex justify-between gap-4 text-sm">
                <span>{a.text}</span>
                <span className="shrink-0 text-ink-soft">{timeAgo(a.at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
