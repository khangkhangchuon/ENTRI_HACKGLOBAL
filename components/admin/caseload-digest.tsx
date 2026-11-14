"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Check, MessageSquare, RefreshCw, UserRound } from "lucide-react";
import { AiChip } from "@/components/ui/ai-draft";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { CaseloadDigest as Digest } from "@/lib/ai/schemas";
import { useAi } from "@/lib/ai/use-ai";
import { useDemo } from "@/lib/demo/store";
import { timeAgo } from "@/lib/format";
import { caseloadFacts, factLines } from "@/lib/insights/facts";

const flagId = (clientId: string) => `caseload:${clientId}`;

// Caseload Intelligence. Plain code works out the facts. The AI chooses who
// to flag and writes the wording. Diane decides what to do.
export function CaseloadDigest() {
  const seededAt = useDemo((s) => s.seededAt);
  const clients = useDemo((s) => s.clients);
  const messages = useDemo((s) => s.messages);
  const referrals = useDemo((s) => s.referrals);
  const organizations = useDemo((s) => s.organizations);
  const handled = useDemo((s) => s.handledFlagIds);
  const markFlagHandled = useDemo((s) => s.markFlagHandled);

  const { data, status, message, generatedAt, run } = useAi<Digest>(
    `caseload:${seededAt}`,
    "/api/caseload",
  );

  // A fresh digest on every visit.
  useEffect(() => {
    run({ clients: caseloadFacts(useDemo.getState()) });
  }, [run]);

  // The facts shown under "Why was this flagged?" always come from the
  // live data.
  const facts = useMemo(
    () => caseloadFacts({ clients, messages, referrals, organizations }),
    [clients, messages, referrals, organizations],
  );

  const flags = (data?.flags ?? []).filter(
    (f) => !handled.includes(flagId(f.clientId)) && facts.some((x) => x.id === f.clientId),
  );
  const loading = status === "loading" || status === "idle";

  return (
    <section
      aria-labelledby="digest-title"
      className="rounded-xl border-2 border-dashed border-ember-400/70 bg-white p-5"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id="digest-title" className="font-display text-xl">
          Caseload Intelligence
        </h2>
        <AiChip />
        {loading && data && <Badge tone="steel">Updating</Badge>}
        <button
          type="button"
          onClick={() => run({ clients: caseloadFacts(useDemo.getState()) })}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-ember-700 hover:bg-ember-100 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </button>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Who may need you today, drafted from your caseload data.
        {generatedAt && !loading && ` Updated ${timeAgo(generatedAt).toLowerCase()}.`}
      </p>

      <div aria-live="polite" className="mt-4">
        {loading && !data && (
          <div className="space-y-3" aria-label="Reading your caseload">
            <p className="text-ink-soft">Reading your caseload…</p>
            {[0, 1].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-sand-100" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="mb-3 rounded-lg bg-amber-100 px-4 py-3 text-amber-700">
            {data
              ? "The digest could not update just now. This is the last one."
              : `${message} The facts below come straight from your caseload data.`}
          </div>
        )}

        {status === "error" && !data && <PlainFacts />}

        {data && flags.length === 0 && (
          <p className="rounded-lg bg-moss-100 px-4 py-3 text-moss-700">
            Nothing is waiting on you right now.
          </p>
        )}

        <ul className="space-y-3">
          {data &&
            flags.map((f) => {
              const fact = facts.find((x) => x.id === f.clientId)!;
              return (
                <li key={f.clientId} className="rounded-lg border border-sand-200 bg-paper p-4">
                  <p className="font-semibold">{f.headline}</p>
                  <p className="mt-1 text-ink-soft">{f.detail}</p>
                  <p className="mt-1 text-ink-soft">
                    <span className="font-semibold text-ink">Suggested:</span> {f.suggestedAction}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/clients/${f.clientId}`}
                      className={buttonClass("secondary", "sm")}
                    >
                      <UserRound className="h-4 w-4" aria-hidden />
                      Open client
                    </Link>
                    <Link
                      href={`/admin/clients/${f.clientId}#messages`}
                      className={buttonClass("secondary", "sm")}
                    >
                      <MessageSquare className="h-4 w-4" aria-hidden />
                      Message
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => {
                        markFlagHandled(flagId(f.clientId));
                        toast("Marked as handled");
                      }}
                    >
                      <Check className="h-4 w-4" aria-hidden />
                      Mark as handled
                    </Button>
                  </div>
                  <details className="mt-3 text-[15px]">
                    <summary className="cursor-pointer font-semibold text-ember-700">
                      Why was this flagged?
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
                      {factLines(fact).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-ink-soft">
                      These facts come straight from the caseload data. The AI chose this client
                      and wrote the wording above.
                    </p>
                  </details>
                </li>
              );
            })}
        </ul>
      </div>
    </section>
  );
}

// Shown only when the AI cannot be reached: the same facts, without the
// AI's choice or wording.
function PlainFacts() {
  const data = useDemo();
  const rows = caseloadFacts(data)
    .filter((f) => f.daysSinceCheckIn >= 10 || f.currentStepOverdueDays !== null || !f.hasPlan)
    .slice(0, 5);
  return (
    <ul className="space-y-2">
      {rows.map((f) => (
        <li key={f.id} className="rounded-lg border border-sand-200 bg-paper p-4">
          <Link href={`/admin/clients/${f.id}`} className="font-semibold underline">
            {f.name}
          </Link>
          <p className="mt-1 text-ink-soft">{factLines(f).slice(0, 4).join(" ")}</p>
        </li>
      ))}
    </ul>
  );
}
