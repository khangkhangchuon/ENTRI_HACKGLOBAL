"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Send } from "lucide-react";
import { ReferralDialog, type ReferralTarget } from "@/components/admin/referral-dialog";
import { ResourceCard } from "@/components/admin/resource-card";
import { ReferralBadge, WhenReady, fullName } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Card, PageHeader, SectionTitle } from "@/components/ui/card";
import { SelectField, TextField } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useCaseload, useDemo } from "@/lib/demo/store";
import { BOROUGHS, CATEGORY_LABELS, type Category } from "@/lib/demo/types";
import { timeAgo } from "@/lib/format";

function Network() {
  const resources = useDemo((s) => s.resources);
  const organizations = useDemo((s) => s.organizations);
  const referrals = useDemo((s) => s.referrals);
  const clients = useCaseload();
  const homeOrgId = useDemo((s) => s.homeOrgId);
  const setReferralStatus = useDemo((s) => s.setReferralStatus);

  const [view, setView] = useState<"resources" | "referrals">("resources");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [borough, setBorough] = useState("");
  const [fairChance, setFairChance] = useState(false);
  const [target, setTarget] = useState<ReferralTarget | null>(null);

  const orgOf = (id: string) => organizations.find((o) => o.id === id);
  const q = query.trim().toLowerCase();
  const shown = resources.filter((r) => {
    if (category && r.category !== category) return false;
    if (borough && r.borough !== borough) return false;
    if (fairChance && !r.fairChance) return false;
    if (!q) return true;
    return `${r.name} ${orgOf(r.orgId)?.name ?? ""} ${r.offers}`.toLowerCase().includes(q);
  });
  const open = referrals.filter((r) => r.status !== "completed").length;

  return (
    <>
      <PageHeader
        title="Network"
        intro={`${organizations.length} organizations and ${resources.length} resources, in one place. Partners work with you in Entri. Listed organizations are shown from public information.`}
      >
        <Button variant="primary" onClick={() => setTarget({})}>
          <Send className="h-4 w-4" aria-hidden />
          Refer a client
        </Button>
      </PageHeader>

      <div role="tablist" aria-label="Network views" className="mt-6 flex gap-1 border-b border-sand-200">
        {(
          [
            ["resources", "Resources"],
            ["referrals", `Referrals (${open} open)`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={clsx(
              "-mb-px border-b-2 px-4 py-2.5 font-semibold",
              view === id
                ? "border-ember-600 text-ink"
                : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "resources" ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TextField
              label="Search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or kind of help"
            />
            <SelectField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Borough"
              value={borough}
              onChange={(e) => setBorough(e.target.value)}
            >
              <option value="">All boroughs</option>
              {BOROUGHS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </SelectField>
            <label className="flex items-center gap-2.5 self-end rounded-lg border border-sand-300 bg-white px-3 py-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-ember-600"
                checked={fairChance}
                onChange={(e) => setFairChance(e.target.checked)}
              />
              Fair-chance employers only
            </label>
          </div>

          <p className="mt-4 text-sm text-ink-soft" aria-live="polite">
            Showing {shown.length} of {resources.length} resources.
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {shown.map((r) => (
              <ResourceCard key={r.id} resource={r} org={orgOf(r.orgId)}>
                {r.orgId === homeOrgId ? (
                  <Link
                    href="/admin/resources"
                    className="text-sm font-semibold text-ember-700 hover:underline"
                  >
                    Your own listing
                  </Link>
                ) : (
                  <Button size="sm" onClick={() => setTarget({ resourceId: r.id })}>
                    <Send className="h-4 w-4" aria-hidden />
                    Refer a client
                  </Button>
                )}
              </ResourceCard>
            ))}
          </div>
          {shown.length === 0 && (
            <p className="py-10 text-center text-ink-soft">
              No resources match those filters.
            </p>
          )}
        </>
      ) : (
        <Card className="mt-5">
          <SectionTitle>Referrals you sent</SectionTitle>
          <p className="mt-1 text-sm text-ink-soft">
            In real use, the other organization updates the status. In this demo you can do it
            for them to see how tracking works.
          </p>
          <ul className="mt-3 divide-y divide-sand-200">
            {referrals.map((r) => {
              const client = clients.find((c) => c.id === r.clientId);
              const resource = resources.find((x) => x.id === r.resourceId);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {client ? (
                        <Link href={`/admin/clients/${client.id}`} className="hover:underline">
                          {fullName(client)}
                        </Link>
                      ) : (
                        "A client"
                      )}{" "}
                      to {orgOf(r.toOrgId)?.name}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {resource?.name}. Sent {timeAgo(r.at).toLowerCase()}. Shared:{" "}
                      {r.shared.length ? r.shared.join(", ") : "nothing beyond the name"}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReferralBadge status={r.status} />
                    {r.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const next = r.status === "sent" ? "accepted" : "completed";
                          setReferralStatus(r.id, next);
                          toast(`Referral marked as ${next}`);
                        }}
                      >
                        Mark as {r.status === "sent" ? "accepted" : "completed"}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <ReferralDialog target={target} onClose={() => setTarget(null)} />
    </>
  );
}

export default function NetworkPage() {
  return (
    <WhenReady>
      <Network />
    </WhenReady>
  );
}
