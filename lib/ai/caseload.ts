import "server-only";
import { draftStructured, tidy, VOICE_RULES } from "./client";
import { CaseloadDigest, type CaseloadRequest } from "./schemas";

const SYSTEM = `You help a reentry caseworker start the day. You receive facts about every client on the caseload. The facts were worked out by plain code and are correct. Choose the two to four clients who most need the caseworker's attention today and write one short flag for each.

${VOICE_RULES}

How to choose:
- A client who has been quiet for a long time while a step is overdue matters most.
- Then long silences (10 days or more), overdue steps, and referrals that have waited a long time.
- A new client with no plan yet is worth one flag, since the plan is the caseworker's next job. If several are new, flag at most two of them.
- Do not flag a client who is simply on track.
- Never flag the same client twice. Never return more than four flags.

How to write each flag:
- clientId: the id from the facts, copied exactly.
- kind: quiet, overdue, new-intake, referral-waiting or milestone.
- headline: one sentence that names the client and the facts, with the real numbers. Example: "Jamal hasn't checked in for 14 days and his housing step is overdue."
- detail: one sentence of context from the facts.
- suggestedAction: one short, gentle next step the caseworker could take, starting with a verb.
- Use only numbers that appear in the facts.`;

export async function draftCaseload(input: CaseloadRequest): Promise<CaseloadDigest> {
  const digest = await draftStructured({
    system: SYSTEM,
    user: `<caseload_facts>\n${JSON.stringify(input.clients)}\n</caseload_facts>\n\nWrite today's flags.`,
    schema: CaseloadDigest,
    effort: "low",
  });

  // Every flag must point at a real client, once.
  const known = new Set(input.clients.map((c) => c.id));
  const seen = new Set<string>();
  const flags = digest.flags
    .filter((f) => {
      if (!known.has(f.clientId) || seen.has(f.clientId)) return false;
      seen.add(f.clientId);
      return true;
    })
    .slice(0, 4)
    .map((f) => ({
      ...f,
      headline: tidy(f.headline),
      detail: tidy(f.detail),
      suggestedAction: tidy(f.suggestedAction),
    }));
  return { flags };
}
