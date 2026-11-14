"use client";

import Link from "next/link";
import { Building2, Send, Sparkles } from "lucide-react";
import { CaseloadDigest } from "@/components/admin/caseload-digest";
import { WhenReady } from "@/components/admin/shared";
import { buttonClass } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { useDemo } from "@/lib/demo/store";
import { daysSince, greeting, longDate, timeAgo } from "@/lib/format";

function Dashboard() {
  const caseworker = useDemo((s) => s.caseworker);
  const clients = useDemo((s) => s.clients);
  const referrals = useDemo((s) => s.referrals);
  const activity = useDemo((s) => s.activity);

  const cards = [
    { label: "Active clients", value: clients.length },
    {
      label: "New this week",
      value: clients.filter((c) => daysSince(c.createdAt) < 7).length,
    },
    {
      label: "Steps completed this week",
      value: clients
        .flatMap((c) => c.plan)
        .filter((s) => s.completedAt && daysSince(s.completedAt) < 7).length,
    },
    {
      label: "Open referrals",
      value: referrals.filter((r) => r.status !== "completed").length,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ink-soft">{longDate(new Date())}</p>
          <h1 className="font-display text-3xl sm:text-4xl">
            {greeting()}, {caseworker.firstName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/intake?client=new" className={buttonClass("primary")}>
            <Sparkles className="h-4 w-4" aria-hidden />
            New client
          </Link>
          <Link href="/admin/resources?add=1" className={buttonClass()}>
            <Building2 className="h-4 w-4" aria-hidden />
            Add resource
          </Link>
          <Link href="/admin/network" className={buttonClass()}>
            <Send className="h-4 w-4" aria-hidden />
            Refer a client
          </Link>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <dt className="text-sm text-ink-soft">{c.label}</dt>
            <dd className="mt-1 font-display text-4xl">{c.value}</dd>
          </Card>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[3fr_2fr]">
        <CaseloadDigest />

        <Card>
          <SectionTitle>Recent activity</SectionTitle>
          <ul className="mt-3 divide-y divide-sand-200">
            {activity.slice(0, 9).map((a) => (
              <li key={a.id} className="flex justify-between gap-4 py-2.5 text-[15px]">
                {a.clientId ? (
                  <Link href={`/admin/clients/${a.clientId}`} className="hover:underline">
                    {a.text}
                  </Link>
                ) : (
                  <span>{a.text}</span>
                )}
                <span className="shrink-0 text-sm text-ink-soft">{timeAgo(a.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <WhenReady>
      <Dashboard />
    </WhenReady>
  );
}
