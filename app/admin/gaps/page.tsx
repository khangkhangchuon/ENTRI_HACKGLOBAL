"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Send } from "lucide-react";
import { ReferralDialog, type ReferralTarget } from "@/components/admin/referral-dialog";
import { TierBadge } from "@/components/admin/resource-card";
import { WhenReady } from "@/components/admin/shared";
import { AiChip } from "@/components/ui/ai-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, PageHeader, SectionTitle } from "@/components/ui/card";
import type { GapFindings } from "@/lib/ai/schemas";
import { useAi } from "@/lib/ai/use-ai";
import { useDemo } from "@/lib/demo/store";
import type { DemoData } from "@/lib/demo/types";
import { NEED_CHIPS } from "@/lib/demo/types";
import { timeAgo } from "@/lib/format";
import { gapFacts, gapLine } from "@/lib/insights/facts";

// The request leaves out client ids. The AI only needs counts and first
// names to word a finding.
const requestBody = (data: DemoData) => ({
  caseloadSize: data.clients.length,
  gaps: gapFacts(data).map((g) => ({
    need: g.need,
    borough: g.borough,
    clientCount: g.clientCount,
    clientNames: g.clientNames,
    candidates: g.candidates,
  })),
});

function Gaps() {
  const seededAt = useDemo((s) => s.seededAt);
  const clients = useDemo((s) => s.clients);
  const resources = useDemo((s) => s.resources);
  const organizations = useDemo((s) => s.organizations);
  const [target, setTarget] = useState<ReferralTarget | null>(null);

  const { data, status, message, generatedAt, run } = useAi<GapFindings>(
    `gaps:${seededAt}`,
    "/api/gaps",
  );

  // A fresh analysis on every visit.
  useEffect(() => {
    run(requestBody(useDemo.getState()));
  }, [run]);

  const gaps = useMemo(
    () => gapFacts({ clients, resources, organizations }),
    [clients, resources, organizations],
  );
  const loading = status === "loading" || status === "idle";

  // Show a finding only while its gap still exists in the live data.
  const findings = (data?.findings ?? []).flatMap((f) => {
    const gap = gaps.find((g) => g.need === f.need && g.borough === f.borough);
    const resource = resources.find((r) => r.id === f.suggestedResourceId);
    return gap && resource ? [{ ...f, gap, resource }] : [];
  });

  return (
    <>
      <PageHeader
        title="Gap Analysis"
        intro="What the people on your caseload need, compared with what the network offers near them."
      >
        <Button onClick={() => run(requestBody(useDemo.getState()))} disabled={loading}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Run again
        </Button>
      </PageHeader>

      <section
        aria-labelledby="findings-title"
        className="mt-6 rounded-xl border-2 border-dashed border-ember-400/70 bg-white p-5"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 id="findings-title" className="font-display text-xl">
            Unmet needs
          </h2>
          <AiChip />
          {loading && data && <Badge tone="steel">Updating</Badge>}
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          The counts come from your caseload data. The AI words each finding and suggests who
          could help. You decide whether to refer anyone.
          {generatedAt && !loading && ` Updated ${timeAgo(generatedAt).toLowerCase()}.`}
        </p>

        <div aria-live="polite" className="mt-4">
          {loading && !data && (
            <div className="space-y-3">
              <p className="text-ink-soft">Comparing needs with the network…</p>
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg bg-sand-100" />
              ))}
            </div>
          )}

          {status === "error" && (
            <p className="mb-3 rounded-lg bg-amber-100 px-4 py-3 text-amber-700">
              {data
                ? "The analysis could not update just now. This is the last one."
                : `${message} The numbers below still come straight from your data.`}
            </p>
          )}

          {data && findings.length === 0 && (
            <p className="rounded-lg bg-moss-100 px-4 py-3 text-moss-700">
              No unmet needs right now. Every need on your caseload has a resource in the same
              borough.
            </p>
          )}

          <ul className="space-y-4">
            {findings.map((f) => {
              const org = organizations.find((o) => o.id === f.resource.orgId);
              const affected = clients.filter((c) => f.gap.clientIds.includes(c.id));
              return (
                <li
                  key={`${f.need}-${f.borough}`}
                  className="rounded-lg border border-sand-200 bg-paper p-4"
                >
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="amber">{NEED_CHIPS[f.need]}</Badge>
                    <Badge tone="steel">{f.borough}</Badge>
                  </div>
                  <p className="mt-2 text-lg font-semibold leading-snug">{f.headline}</p>
                  <p className="mt-1 text-ink-soft">{f.detail}</p>
                  <p className="mt-2 text-[15px]">
                    <span className="font-semibold">Clients affected:</span>{" "}
                    {affected.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 && ", "}
                        <Link href={`/admin/clients/${c.id}`} className="underline">
                          {c.firstName} {c.lastName}
                        </Link>
                      </span>
                    ))}
                  </p>

                  <div className="mt-3 rounded-lg border border-sand-200 bg-white p-3.5">
                    <p className="text-sm font-semibold text-ink-soft">Who could help</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{org?.name}</p>
                      <TierBadge org={org} />
                    </div>
                    <p className="text-sm text-ink-soft">
                      {f.resource.name}, {f.resource.borough}
                    </p>
                    <p className="mt-1.5 text-[15px]">{f.reason}</p>
                    <Button
                      size="sm"
                      variant="primary"
                      className="mt-3"
                      onClick={() =>
                        setTarget({ resourceId: f.resource.id, clientIds: f.gap.clientIds })
                      }
                    >
                      <Send className="h-4 w-4" aria-hidden />
                      Start a referral
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <Card className="mt-6">
        <SectionTitle>The numbers behind this</SectionTitle>
        <p className="mt-1 text-sm text-ink-soft">
          Worked out by plain code, with no AI. Help that takes one trip, such as an ID or a
          bank account, is left out.
        </p>
        {gaps.length === 0 ? (
          <p className="mt-3 text-ink-soft">No gaps found.</p>
        ) : (
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px]">
            {gaps.map((g) => (
              <li key={`${g.need}-${g.borough}`}>{gapLine(g)}</li>
            ))}
          </ul>
        )}
      </Card>

      <ReferralDialog target={target} onClose={() => setTarget(null)} />
    </>
  );
}

export default function GapsPage() {
  return (
    <WhenReady>
      <Gaps />
    </WhenReady>
  );
}
