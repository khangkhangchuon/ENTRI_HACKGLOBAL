import "server-only";
import { draftStructured, tidy, VOICE_RULES } from "./client";
import { GapFindings, type GapsRequest } from "./schemas";

const SYSTEM = `You help a reentry caseworker see where the support network falls short for the people on the caseload. You receive a list of gaps worked out by plain code. Each gap is a kind of help that clients in one borough need, where no resource in that borough offers it. Each gap comes with candidate resources in other boroughs that do offer it.

${VOICE_RULES}

What to do:
- Write one finding for every gap that affects three or more clients. Add smaller gaps only if they matter, up to five findings in total. Put the gap that affects the most clients first.
- need and borough: copied exactly from the gap.
- headline: one sentence with the real count, the need and the borough. Example: "3 clients need substance-use support in the Bronx and no listed resource offers it."
- detail: one or two sentences on why distance matters for this kind of help, and who is affected. Use first names from the gap.
- suggestedResourceId: the candidate that fits best, copied exactly from the candidates of that same gap. Prefer a partner organization when it fits as well as a listed one, and prefer the closest borough.
- reason: one sentence on why this candidate could fill the gap, for example by taking referrals or by adding a site. Phrase it as a suggestion.
- If the list of gaps is empty, return no findings.`;

export async function draftGaps(input: GapsRequest): Promise<GapFindings> {
  if (input.gaps.length === 0) return { findings: [] };

  const result = await draftStructured({
    system: SYSTEM,
    user: `<caseload_size>${input.caseloadSize}</caseload_size>\n<gaps>\n${JSON.stringify(input.gaps)}\n</gaps>\n\nWrite the findings.`,
    schema: GapFindings,
    effort: "low",
  });

  // Every finding must match a real gap and name one of its own candidates.
  const seen = new Set<string>();
  const findings = result.findings
    .filter((f) => {
      const key = `${f.need}|${f.borough}`;
      const gap = input.gaps.find((g) => g.need === f.need && g.borough === f.borough);
      if (!gap || seen.has(key)) return false;
      if (!gap.candidates.some((c) => c.resourceId === f.suggestedResourceId)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((f) => ({
      ...f,
      headline: tidy(f.headline),
      detail: tidy(f.detail),
      reason: tidy(f.reason),
    }));
  return { findings };
}
