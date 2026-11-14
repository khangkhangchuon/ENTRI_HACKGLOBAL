"use client";

import { useDemoReady } from "@/components/demo/demo-provider";
import { Badge } from "@/components/ui/badge";
import type { Client, ClientStatus, ReferralStatus } from "@/lib/demo/types";

// Screens wait for the saved demo data before they show anything.
export function WhenReady({ children }: { children: React.ReactNode }) {
  const ready = useDemoReady();
  if (!ready) {
    return <p className="py-10 text-ink-soft">Loading the demo…</p>;
  }
  return <>{children}</>;
}

export const fullName = (c: Pick<Client, "firstName" | "lastName">) =>
  `${c.firstName} ${c.lastName}`;

const STATUS: Record<ClientStatus, { label: string; tone: "moss" | "amber" | "steel" }> = {
  "on-track": { label: "On track", tone: "moss" },
  "needs-attention": { label: "Needs attention", tone: "amber" },
  new: { label: "New", tone: "steel" },
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  const s = STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

const REFERRAL: Record<ReferralStatus, { label: string; tone: "moss" | "ember" | "steel" }> = {
  sent: { label: "Sent", tone: "steel" },
  accepted: { label: "Accepted", tone: "ember" },
  completed: { label: "Completed", tone: "moss" },
};

export function ReferralBadge({ status }: { status: ReferralStatus }) {
  const s = REFERRAL[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-2 w-24 overflow-hidden rounded-full bg-sand-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={`${done} of ${total} steps done`}
      >
        <div className="h-full rounded-full bg-moss-600" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-ink-soft">
        {done} of {total}
      </span>
    </div>
  );
}
