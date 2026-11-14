// Live checks for the three AI features on the organization side. They call
// the local site with the same fictional data the demo starts with.
// Start the site first, then run:
//   npx tsx tests/live-checks.ts
// Each run makes about a dozen AI requests.

import { ANDRE_INTAKE_NOTES, MARCUS_INTAKE_NOTES, buildSeed } from "../lib/demo/seed";
import { caseloadFacts, gapFacts, resourceBriefs } from "../lib/insights/facts";
import type {
  AiReply,
  CaseloadDigest,
  GapFindings,
  IntakeDraft,
} from "../lib/ai/schemas";

const BASE = process.env.ENTRI_URL ?? "http://localhost:3210";
const REPEATS = 3;
const data = buildSeed(new Date());
const resourceIds = new Set(data.resources.map((r) => r.id));
const clientIds = new Set(data.clients.map((c) => c.id));

const AVOID = /—|ex-con|ex-offender|felon|inmate|criminal|offender/i;

let failed = 0;
const report = (ok: boolean, label: string, note = "") => {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${note ? `\n      ${note}` : ""}`);
};

async function post<T>(path: string, body: unknown): Promise<AiReply<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as AiReply<T>;
}

const FRESH_NOTES: { label: string; notes: string; needs: string[] }[] = [
  {
    label: "Fresh notes 1 (Bronx, recovery)",
    notes: `Tasha W, walked in this afternoon. Home 2 wks, staying w/ her mom in the Bronx (Mott Haven), that's stable for now.
has state ID + SS card, phone ok, has a bank acct from before.
In recovery, 14 months, wants to keep going to a group, the one upstate obviously not an option now. Said this is the main thing.
Medicaid not active. Wants part time work, did hair before, no license.
Nervous, talks fast, texts fine.`,
    needs: ["substance-use"],
  },
  {
    label: "Fresh notes 2 (Staten Island, few details)",
    notes: `R. Ortiz - phone intake, short call. out since tuesday. staten island w/ brother.
no ID nothing, lost everything. no phone (called from brother's). wants any job.
call back thurs.`,
    needs: ["id", "phone", "jobs"],
  },
  {
    label: "Fresh notes 3 (Manhattan, older, health)",
    notes: `Mr. Leonard Price, 61. Released 5 days ago after a long sentence. In a shelter in Manhattan (Harlem), does not want to stay there.
Has release papers only. Diabetic, has about a week of medication left, no doctor here. Needs Medicaid turned on.
No phone. Not looking for work right now, wants to get his health sorted and find a room.
Hard of hearing, prefers in-person. Reads fine with glasses but lost them.`,
    needs: ["id", "primary-care", "benefits", "housing"],
  },
];

async function intake(label: string, notes: string, needs: string[]) {
  const reply = await post<IntakeDraft>("/api/intake", {
    notes,
    resources: resourceBriefs(data),
  });
  if (!reply.ok) return report(false, `Intake: ${label}`, `${reply.code}: ${reply.message}`);
  const d = reply.data;
  const used = [...d.matches.map((m) => m.resourceId), ...d.steps.flatMap((s) => s.resourceIds)];
  const unknown = used.filter((r) => !resourceIds.has(r));
  const missing = needs.filter((n) => !d.needs.includes(n as never));
  const text = JSON.stringify(d);
  const problems = [
    unknown.length ? `unknown resources: ${unknown.join(", ")}` : "",
    missing.length ? `missing needs: ${missing.join(", ")}` : "",
    d.steps.length < 3 ? `only ${d.steps.length} steps` : "",
    AVOID.test(text) ? "uses an avoided word or an em-dash" : "",
  ].filter(Boolean);
  report(problems.length === 0, `Intake: ${label}`, problems.join("; "));
  console.log(`      ${d.firstName} ${d.lastName}, ${d.borough}. Needs: ${d.needs.join(", ")}`);
  console.log(`      Steps: ${d.steps.map((s) => s.title).join(" > ")}`);
  console.log(`      Matches: ${d.matches.map((m) => m.resourceId).join(", ")}`);
  console.log(`      Summary: ${d.summary.slice(0, 220)}`);
}

async function caseload(run: number) {
  const clients = caseloadFacts(data);
  const reply = await post<CaseloadDigest>("/api/caseload", { clients });
  if (!reply.ok) return report(false, `Caseload run ${run}`, `${reply.code}: ${reply.message}`);
  const flags = reply.data.flags;
  const jamal = data.clients.find((c) => c.firstName === "Jamal");
  const unknown = flags.filter((f) => !clientIds.has(f.clientId)).map((f) => f.clientId);
  const problems = [
    jamal && !flags.some((f) => f.clientId === jamal.id) ? "Jamal is not flagged" : "",
    unknown.length ? `unknown clients: ${unknown.join(", ")}` : "",
    flags.length < 2 || flags.length > 4 ? `${flags.length} flags` : "",
    AVOID.test(JSON.stringify(flags)) ? "uses an avoided word or an em-dash" : "",
  ].filter(Boolean);
  report(problems.length === 0, `Caseload run ${run}`, problems.join("; "));
  for (const f of flags) console.log(`      [${f.kind}] ${f.headline} | ${f.detail}`);
}

async function gaps(run: number) {
  const facts = gapFacts(data);
  const reply = await post<GapFindings>("/api/gaps", {
    caseloadSize: data.clients.length,
    gaps: facts.map((g) => ({
      need: g.need,
      borough: g.borough,
      clientCount: g.clientCount,
      clientNames: g.clientNames,
      candidates: g.candidates,
    })),
  });
  if (!reply.ok) return report(false, `Gaps run ${run}`, `${reply.code}: ${reply.message}`);
  const found = reply.data.findings;
  const bad = found.filter((f) => {
    const fact = facts.find((g) => g.need === f.need && g.borough === f.borough);
    return !fact || !fact.candidates.some((c) => c.resourceId === f.suggestedResourceId);
  });
  const problems = [
    !found.some((f) => f.borough === "Bronx" && f.need === "substance-use")
      ? "Bronx substance-use gap is missing"
      : "",
    bad.length ? `findings not backed by the facts: ${bad.map((f) => `${f.need}/${f.borough}`).join(", ")}` : "",
    AVOID.test(JSON.stringify(found)) ? "uses an avoided word or an em-dash" : "",
  ].filter(Boolean);
  report(problems.length === 0, `Gaps run ${run}`, problems.join("; "));
  for (const f of found) console.log(`      ${f.headline} -> ${f.suggestedResourceId}`);
}

async function main() {
  await intake("Marcus", MARCUS_INTAKE_NOTES, ["id", "phone", "banking", "housing", "jobs"]);
  await intake("Andre", ANDRE_INTAKE_NOTES, ["housing", "legal", "benefits"]);
  for (const f of FRESH_NOTES) await intake(f.label, f.notes, f.needs);
  for (let i = 1; i <= REPEATS; i += 1) await caseload(i);
  for (let i = 1; i <= REPEATS; i += 1) await gaps(i);
  console.log(`\n${failed === 0 ? "All checks passed" : `${failed} failed`}`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();
