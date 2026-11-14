"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Search } from "lucide-react";
import {
  ProgressBar,
  StatusBadge,
  WhenReady,
  fullName,
} from "@/components/admin/shared";
import { buttonClass } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { inputClass } from "@/components/ui/field";
import { useCaseload, useDemo } from "@/lib/demo/store";
import type { ClientStatus } from "@/lib/demo/types";
import { timeAgo } from "@/lib/format";

const FILTERS: { id: "all" | ClientStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "on-track", label: "On track" },
  { id: "needs-attention", label: "Needs attention" },
  { id: "new", label: "New" },
];

function Clients() {
  const clients = useCaseload();
  const homeOrgId = useDemo((s) => s.homeOrgId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ClientStatus>("all");

  const q = query.trim().toLowerCase();
  const rows = clients.filter(
    (c) =>
      (filter === "all" || c.status === filter) &&
      (!q || `${fullName(c)} ${c.borough}`.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader
        title="Clients"
        intro={`${clients.length} people on your caseload at Brooklyn Bridges.`}
      >
        <Link
          href="/admin/intake?client=new"
          className={buttonClass("primary")}
        >
          New client
        </Link>
      </PageHeader>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
            aria-hidden
          />
          <input
            type="search"
            aria-label="Search clients by name or borough"
            placeholder="Search by name or borough"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={clsx(inputClass, "pl-9")}
          />
        </div>
        <div
          role="group"
          aria-label="Filter by status"
          className="flex flex-wrap gap-1.5"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                filter === f.id
                  ? "bg-ink text-paper"
                  : "border border-sand-300 bg-white text-ink-soft hover:bg-sand-100",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-[15px]">
          <thead className="border-b border-sand-200 text-sm text-ink-soft">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Current step
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Progress
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Last check-in
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {rows.map((c) => {
              const current = c.plan.find((s) => s.status === "current");
              const done = c.plan.filter((s) => s.status === "done").length;
              const share = c.sharing[homeOrgId];
              const hidden = share && !(share.plan && share.progress);
              return (
                <tr key={c.id} className="hover:bg-paper">
                  <th scope="row" className="px-4 py-3 font-normal">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="font-semibold underline-offset-2 hover:underline"
                    >
                      {fullName(c)}
                    </Link>
                    <div className="text-sm text-ink-soft">{c.borough}</div>
                  </th>
                  <td className="px-4 py-3">
                    {hidden ? (
                      <span className="text-ink-soft">Not shared</span>
                    ) : c.planStatus === "none" ? (
                      <Link
                        href={`/admin/intake?client=${c.id}`}
                        className="font-semibold text-ember-700 hover:underline"
                      >
                        No plan yet. Start Smart Intake
                      </Link>
                    ) : (
                      <>
                        {current?.title ?? "Plan complete"}
                        {c.planStatus === "starter" && (
                          <Link
                            href={`/admin/intake?client=${c.id}`}
                            className="block text-sm font-semibold text-ember-700 hover:underline"
                          >
                            Starter plan. Make it personal
                          </Link>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.plan.length > 0 && !hidden && (
                      <ProgressBar done={done} total={c.plan.length} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {timeAgo(c.lastCheckIn)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-ink-soft">
            No clients match that search.
          </p>
        )}
      </div>
    </>
  );
}

export default function ClientsPage() {
  return (
    <WhenReady>
      <Clients />
    </WhenReady>
  );
}
