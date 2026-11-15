import {
  ANDRE_INTAKE_NOTES,
  ANDRE_SAVED_DRAFT,
  MARCUS_INTAKE_NOTES,
  MARCUS_SAVED_DRAFT,
  STEP_TEMPLATES,
} from "@/lib/demo/seed";
import { NEED_LABELS } from "@/lib/demo/types";
import type {
  CaseloadDigest,
  CaseloadFlag,
  CaseloadRequest,
  ClientFacts,
  GapFindings,
  GapsRequest,
  IntakeDraft,
  IntakeRequest,
  ResourceBrief,
} from "./schemas";

// Plan B. When the AI cannot be reached, each feature still gives a useful
// result, built by plain rules from the same facts. The screens label these
// as prepared, so nobody takes them for AI output.

type Need = IntakeDraft["needs"][number];
type Borough = IntakeDraft["borough"];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const inBorough = (b: string) => (b === "Bronx" ? "the Bronx" : b);

// ---- Smart Intake ------------------------------------------------------

const PLACES: [RegExp, Borough][] = [
  [/staten island/, "Staten Island"],
  [/brooklyn|bed-stuy|bushwick|flatbush|brownsville|crown heights/, "Brooklyn"],
  [/queens|jamaica|astoria|flushing|far rockaway/, "Queens"],
  [/bronx|mott haven|fordham|hunts point/, "Bronx"],
  [/manhattan|harlem|inwood|lower east side|washington heights/, "Manhattan"],
];

function findBorough(notes: string): Borough | null {
  let best: { at: number; borough: Borough } | null = null;
  for (const [pattern, borough] of PLACES) {
    const at = notes.search(pattern);
    if (at >= 0 && (!best || at < best.at)) best = { at, borough };
  }
  return best?.borough ?? null;
}

function findName(notes: string): { firstName: string; lastName: string } {
  const head = (notes.split("\n")[0] ?? "")
    .split(/,| - /)[0]
    .replace(/^(mr|ms|mrs|mx)\.?\s+/i, "")
    .trim();
  const parts = head.split(/\s+/).filter(Boolean);
  const looksLikeName =
    parts.length >= 1 &&
    parts.length <= 3 &&
    head.length <= 40 &&
    parts.every((p) => /^[A-Z]/.test(p));
  if (!looksLikeName) return { firstName: "New", lastName: "Client" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

// What the notes say the person needs, most urgent first.
function findNeeds(t: string): Need[] {
  const needs: Need[] = [];
  const hasId = /has (a |his |her )?(valid )?(state |nys )?id\b/.test(t);
  if (!hasId) needs.push("id");
  if (/doctor|medication|diabet/.test(t)) needs.push("primary-care");
  if (/recovery|sober|treatment|substance/.test(t)) needs.push("substance-use");
  if (!/phone (ok|works|is fine)|has (a |his |her )?(own )?phone/.test(t))
    needs.push("phone");
  if (!/has (a |his |her )?bank|bank acc\w* from/.test(t))
    needs.push("banking");
  needs.push("benefits");
  if (
    /temporary|shelter|short-stay|couch|somewhere to stay|place of (my|his|her) own|find a room|weeks left/.test(
      t,
    ) &&
    !/stable for now/.test(t)
  ) {
    needs.push("housing");
  }
  if (/court|legal|lawyer|custody/.test(t)) needs.push("legal");
  if (!/not looking for work/.test(t)) needs.push("jobs");
  if (/certif|license|training/.test(t)) needs.push("training");
  if (/counsel|therap|anxi|depress/.test(t)) needs.push("mental-health");
  return needs;
}

const EXTRA_STEPS: Partial<Record<Need, { title: string; what: string }>> = {
  "primary-care": {
    title: "See a doctor",
    what: "Set up a first visit with a primary care doctor, so your health and any medication are looked after.",
  },
  "substance-use": {
    title: "Join a recovery program",
    what: "Connect with a recovery program, so you have steady support near you.",
  },
  "mental-health": {
    title: "Talk with a counselor",
    what: "Meet a counselor you can talk with as you settle in.",
  },
  legal: {
    title: "Talk with a legal advocate",
    what: "Meet a legal advocate about your questions. They can look at your own situation.",
  },
  training: {
    title: "Look into training",
    what: "Find a class or certificate that fits the work you want.",
  },
};

function bestResource(
  need: Need,
  borough: Borough,
  resources: ResourceBrief[],
): ResourceBrief | null {
  const fit = resources.filter((r) => r.services.includes(need));
  const rank = (r: ResourceBrief) =>
    (r.borough === borough ? 2 : 0) + (need === "jobs" && r.fairChance ? 1 : 0);
  return fit.sort((a, b) => rank(b) - rank(a))[0] ?? null;
}

const sameNotes = (a: string, b: string) => a.trim() === b.trim();

export function preparedIntake(input: IntakeRequest): IntakeDraft {
  // The two people waiting in the demo have drafts written ahead of time.
  if (sameNotes(input.notes, MARCUS_INTAKE_NOTES)) return MARCUS_SAVED_DRAFT;
  if (sameNotes(input.notes, ANDRE_INTAKE_NOTES)) return ANDRE_SAVED_DRAFT;

  const t = input.notes.toLowerCase();
  const borough = input.borough ?? findBorough(t) ?? "Brooklyn";
  const needs = findNeeds(t);
  const known = new Set(input.resources.map((r) => r.id));

  const steps: IntakeDraft["steps"] = [];
  for (const need of needs) {
    const template = STEP_TEMPLATES.find((s) => s.need === need);
    if (template) {
      steps.push({
        title: template.title,
        what: template.what,
        where: template.where,
        bring: template.bring,
        resourceIds: template.resourceIds.filter((id) => known.has(id)),
      });
      continue;
    }
    const extra = EXTRA_STEPS[need];
    if (!extra) continue;
    const r = bestResource(need, borough, input.resources);
    steps.push({
      title: extra.title,
      what: extra.what,
      where: r
        ? `${r.name} at ${r.org}, in ${inBorough(r.borough)}.`
        : "Your caseworker will confirm the place.",
      bring: needs.includes("id")
        ? ["Your state ID, once you have it"]
        : ["Your state ID"],
      resourceIds: r ? [r.id] : [],
    });
  }

  const matches: IntakeDraft["matches"] = [];
  for (const need of needs) {
    const r = bestResource(need, borough, input.resources);
    if (!r || matches.some((m) => m.resourceId === r.id)) continue;
    matches.push({
      resourceId: r.id,
      reason:
        `Offers ${NEED_LABELS[need]} in ${inBorough(r.borough)}.` +
        (r.borough === borough ? "" : " This is in another borough."),
    });
    if (matches.length === 6) break;
  }

  const documents = [
    /birth cert/.test(t) ? "Birth certificate" : "",
    /release papers/.test(t) ? "Release papers" : "",
    needs.includes("id") ? "" : "State ID",
    /ss card|social security/.test(t) ? "Social Security card" : "",
  ].filter(Boolean);

  return {
    ...findName(input.notes),
    borough,
    summary:
      "This draft was prepared from your notes by simple rules, because the AI assistant is not available right now. It lists the needs the notes mention. Please write the summary in your own words.",
    goal:
      input.notes.match(/"([^"]{5,120})"/)?.[1] ??
      "To be confirmed with the client.",
    needs,
    skills: [],
    documents,
    keepInMind: [
      "Prepared by simple rules, not by the AI assistant. Check every part against your notes.",
    ],
    matches,
    steps: steps.slice(0, 7),
  };
}

// ---- Caseload Intelligence ---------------------------------------------

function flagFor(f: ClientFacts): { score: number; flag: CaseloadFlag } | null {
  const first = f.name.split(" ")[0];
  const overdue = f.currentStepOverdueDays ?? 0;
  const waiting = [...f.waitingReferrals].sort(
    (a, b) => b.daysWaiting - a.daysWaiting,
  )[0];
  const extras = [
    f.unansweredMessageDays !== null && f.unansweredMessageDays >= 3
      ? `A message to ${first} has gone unanswered for ${plural(f.unansweredMessageDays, "day")}.`
      : "",
    waiting && waiting.daysWaiting >= 7
      ? `A referral to ${waiting.to} has been waiting ${plural(waiting.daysWaiting, "day")}.`
      : "",
  ].filter(Boolean);
  const progress = `${f.stepsDone} of ${f.stepsTotal} steps are done.`;

  if (overdue > 0 && f.currentStep) {
    return {
      score: 50 + overdue + f.daysSinceCheckIn,
      flag: {
        clientId: f.id,
        kind: "overdue",
        headline: `${first}'s step "${f.currentStep}" is ${plural(overdue, "day")} overdue.`,
        detail: [
          `Last check-in was ${plural(f.daysSinceCheckIn, "day")} ago.`,
          ...extras,
        ].join(" "),
        suggestedAction:
          "Call or message to ask what is in the way of this step.",
      },
    };
  }
  if (f.daysSinceCheckIn >= 10) {
    return {
      score: 30 + f.daysSinceCheckIn,
      flag: {
        clientId: f.id,
        kind: "quiet",
        headline: `${first} has not checked in for ${plural(f.daysSinceCheckIn, "day")}.`,
        detail: [progress, ...extras].join(" "),
        suggestedAction: "Send a short check-in message.",
      },
    };
  }
  if (!f.hasPlan) {
    return {
      score: 25,
      flag: {
        clientId: f.id,
        kind: "new-intake",
        headline: `${first} is new and does not have a plan yet.`,
        detail:
          f.daysSinceIntake === 0
            ? "The first meeting was today."
            : `The first meeting was ${plural(f.daysSinceIntake, "day")} ago.`,
        suggestedAction: "Run Smart Intake to draft a plan.",
      },
    };
  }
  if (waiting && waiting.daysWaiting >= 7) {
    return {
      score: 20 + waiting.daysWaiting,
      flag: {
        clientId: f.id,
        kind: "referral-waiting",
        headline: `${first}'s referral to ${waiting.to} has waited ${plural(waiting.daysWaiting, "day")}.`,
        detail: progress,
        suggestedAction: "Follow up with the organization.",
      },
    };
  }
  if (f.stepsDoneLast7Days >= 2) {
    return {
      score: 10 + f.stepsDoneLast7Days,
      flag: {
        clientId: f.id,
        kind: "milestone",
        headline: `${first} finished ${f.stepsDoneLast7Days} steps this week.`,
        detail: progress,
        suggestedAction: "Send a note of encouragement.",
      },
    };
  }
  return null;
}

export function preparedCaseload(input: CaseloadRequest): CaseloadDigest {
  const flags = input.clients
    .flatMap((f) => flagFor(f) ?? [])
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.flag);
  return { flags };
}

// ---- Gap Analysis ------------------------------------------------------

export function preparedGaps(input: GapsRequest): GapFindings {
  const findings: GapFindings["findings"] = [];
  for (const g of input.gaps.slice(0, 4)) {
    const pick =
      g.candidates.find((c) => c.tier === "partner") ?? g.candidates[0];
    if (!pick) continue;
    const one = g.clientCount === 1;
    findings.push({
      need: g.need,
      borough: g.borough,
      headline: `${plural(g.clientCount, "client")} in ${inBorough(g.borough)} ${one ? "needs" : "need"} ${NEED_LABELS[g.need]}, and no resource in that borough offers it.`,
      detail: `${one ? "This client" : "These clients"} would have to travel to another borough for this help.`,
      suggestedResourceId: pick.resourceId,
      reason:
        `${pick.name} at ${pick.org} offers this in ${inBorough(pick.borough)}.` +
        (pick.tier === "partner"
          ? " It is a partner organization, so a referral can be tracked."
          : ""),
    });
  }
  return { findings };
}
