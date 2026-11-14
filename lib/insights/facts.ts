import type { ClientFacts, GapFact, ResourceBrief } from "@/lib/ai/schemas";
import type { DemoData, Need } from "@/lib/demo/types";
import { NEED_LABELS, onCaseload } from "@/lib/demo/types";

// Plain-code facts. The numbers the AI talks about are worked out here, so
// they are always true to the data. The AI only chooses and words them.

const DAY = 86_400_000;
const days = (from: string, now: number) =>
  Math.max(0, Math.floor((now - new Date(from).getTime()) / DAY));

type CaseloadData = Pick<
  DemoData,
  "clients" | "messages" | "referrals" | "organizations" | "homeOrgId"
>;

export function caseloadFacts(data: CaseloadData, now = Date.now()): ClientFacts[] {
  const orgName = (id: string) =>
    data.organizations.find((o) => o.id === id)?.name ?? "another organization";

  // Only people on the caseload who share their progress. Facts about
  // someone's steps are never worked out without their agreement.
  const shared = data.clients.filter(
    (c) => onCaseload(c) && (c.sharing[data.homeOrgId]?.progress ?? false),
  );
  return shared.map((c) => {
    const current = c.plan.find((s) => s.status === "current");
    const due = current?.dueAt ? new Date(current.dueAt).getTime() : null;
    const thread = data.messages.filter((m) => m.clientId === c.id);
    const last = thread[thread.length - 1];
    return {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      borough: c.borough,
      hasPlan: c.planStatus !== "none",
      starterPlanOnly: c.planStatus === "starter",
      daysSinceIntake: days(c.createdAt, now),
      daysSinceCheckIn: days(c.lastCheckIn, now),
      stepsDone: c.plan.filter((s) => s.status === "done").length,
      stepsTotal: c.plan.length,
      stepsDoneLast7Days: c.plan.filter(
        (s) => s.completedAt && now - new Date(s.completedAt).getTime() < 7 * DAY,
      ).length,
      currentStep: current?.title ?? null,
      currentStepOverdueDays:
        due !== null && due < now ? Math.floor((now - due) / DAY) : null,
      currentStepDueInDays:
        due !== null && due >= now ? Math.ceil((due - now) / DAY) : null,
      unansweredMessageDays:
        last && last.from === "caseworker" ? days(last.at, now) : null,
      waitingReferrals: data.referrals
        .filter((r) => r.clientId === c.id && r.status === "sent")
        .map((r) => ({ to: orgName(r.toOrgId), daysWaiting: days(r.at, now) })),
    };
  });
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// The facts behind a flag, in plain sentences, for "Why was this flagged?".
export function factLines(f: ClientFacts): string[] {
  const lines: string[] = [];
  lines.push(
    f.daysSinceCheckIn === 0
      ? "Last check-in was today."
      : `Last check-in was ${plural(f.daysSinceCheckIn, "day")} ago.`,
  );
  if (!f.hasPlan) {
    lines.push("No plan has been approved yet.");
  } else {
    if (f.starterPlanOnly) {
      lines.push("On a starter plan begun online. No personal plan has been approved yet.");
    }
    lines.push(`${f.stepsDone} of ${f.stepsTotal} steps are done.`);
    if (f.currentStep) lines.push(`The current step is "${f.currentStep}".`);
  }
  if (f.currentStepOverdueDays !== null) {
    lines.push(
      f.currentStepOverdueDays === 0
        ? "That step was due today."
        : `That step is ${plural(f.currentStepOverdueDays, "day")} past its due date.`,
    );
  }
  if (f.currentStepDueInDays !== null) {
    lines.push(`That step is due in ${plural(f.currentStepDueInDays, "day")}.`);
  }
  if (f.stepsDoneLast7Days > 0) {
    lines.push(`${plural(f.stepsDoneLast7Days, "step")} completed in the last 7 days.`);
  }
  if (f.unansweredMessageDays !== null) {
    lines.push(
      `Your last message has had no reply for ${plural(f.unansweredMessageDays, "day")}.`,
    );
  }
  for (const r of f.waitingReferrals) {
    lines.push(
      `A referral to ${r.to} has been waiting for ${plural(r.daysWaiting, "day")}.`,
    );
  }
  if (f.daysSinceIntake <= 7) {
    lines.push(
      f.daysSinceIntake === 0
        ? "Joined your caseload today."
        : `Joined your caseload ${plural(f.daysSinceIntake, "day")} ago.`,
    );
  }
  return lines;
}

// Help that people need close to home, often more than once. One-time
// errands such as an ID, a phone or a bank account are left out, because a
// single trip to another borough is not a gap.
const LOCAL_NEEDS: Need[] = [
  "housing",
  "jobs",
  "training",
  "primary-care",
  "mental-health",
  "substance-use",
  "legal",
];

export interface Gap extends GapFact {
  clientIds: string[];
}

export function gapFacts(
  data: Pick<DemoData, "clients" | "resources" | "organizations">,
): Gap[] {
  const gaps: Gap[] = [];
  const boroughs = [...new Set(data.clients.map((c) => c.borough))];
  for (const borough of boroughs) {
    for (const need of LOCAL_NEEDS) {
      const clients = data.clients.filter(
        (c) => onCaseload(c) && c.borough === borough && c.needs.includes(need),
      );
      if (clients.length === 0) continue;
      const offering = data.resources.filter((r) => r.services.includes(need));
      if (offering.some((r) => r.borough === borough)) continue;
      gaps.push({
        need,
        borough,
        clientCount: clients.length,
        clientIds: clients.map((c) => c.id),
        clientNames: clients.slice(0, 40).map((c) => c.firstName),
        candidates: offering.slice(0, 12).map((r) => {
          const org = data.organizations.find((o) => o.id === r.orgId);
          return {
            resourceId: r.id,
            name: r.name.slice(0, 160),
            org: (org?.name ?? "").slice(0, 160),
            tier: org?.tier ?? "listed",
            borough: r.borough,
            offers: r.offers.slice(0, 400),
          };
        }),
      });
    }
  }
  return gaps.sort((a, b) => b.clientCount - a.clientCount).slice(0, 30);
}

export const gapLine = (g: GapFact) =>
  `${plural(g.clientCount, "client")} in ${g.borough === "Bronx" ? "the Bronx" : g.borough} ${g.clientCount === 1 ? "needs" : "need"} ${NEED_LABELS[g.need]}. No resource in that borough offers it.`;

export function resourceBriefs(data: DemoData): ResourceBrief[] {
  return data.resources.slice(0, 80).map((r) => ({
    id: r.id,
    name: r.name.slice(0, 160),
    org: (data.organizations.find((o) => o.id === r.orgId)?.name ?? "").slice(0, 160),
    category: r.category,
    services: r.services.slice(0, 8),
    borough: r.borough,
    fairChance: r.fairChance,
    offers: r.offers.slice(0, 400),
  }));
}
