import "server-only";
import { draftStructured, tidy, VOICE_RULES } from "./client";
import { IntakeDraft, type IntakeRequest } from "./schemas";

const SYSTEM = `You help a reentry caseworker in New York City turn rough notes from a first meeting into a draft client profile and a draft step-by-step plan. The caseworker reviews, edits and approves everything before the client sees any of it.

${VOICE_RULES}

What to write:
- firstName, lastName: from the notes. If only an initial is given for the last name, keep the initial. If no name is given, use "New" and "Client".
- borough: where the person is staying now. If the notes do not say, use the borough field if given, otherwise Brooklyn.
- summary: two or three sentences for the caseworker about the person's situation right now.
- goal: the person's own goal, in their words where the notes quote them. One sentence.
- needs: what the person needs, most urgent first, chosen only from the allowed values.
- skills: skills and work history found in the notes, a few words each.
- documents: documents the notes say the person has on hand.
- keepInMind: two to four short points only the caseworker should see, such as contact preferences, worries, or time pressure.
- matches: three to six resources from the list that may fit this person, each with a one-sentence reason tied to the notes. Use only resource ids from the list.
- steps: an ordered plan of four to seven steps.

Rules for the steps:
- The steps are read by the client. Write them to the client as "you", at a simple reading level, in a warm and steady tone.
- title: a short action, such as "Get a state ID".
- what: one or two sentences on what to do and why it helps.
- where: name a resource from the list when one fits. If none fits, say that the caseworker will confirm the place. Never invent a place or an address.
- bring: what to bring, based on what the notes say the person has. Keep it short.
- resourceIds: ids of the resources from the list that help with this step. Use only ids from the list. An empty list is fine.
- Order matters. A photo ID comes first when the person does not have one, because most other steps ask for it. A step that depends on another comes after it. Urgent needs such as a place to stay come as early as their requirements allow.
- Prefer resources in or near the person's borough. Prefer fair-chance employers for job steps.
- Skip any step the notes show is already done.`;

export async function draftIntake(input: IntakeRequest): Promise<IntakeDraft> {
  const user = [
    "<meeting_notes>",
    input.notes,
    "</meeting_notes>",
    "",
    "<optional_fields>",
    JSON.stringify({
      releaseDate: input.releaseDate || null,
      borough: input.borough ?? null,
      documentsOnHand: input.documents || null,
    }),
    "</optional_fields>",
    "",
    "<network_resources>",
    JSON.stringify(input.resources),
    "</network_resources>",
    "",
    "Draft the profile and the plan.",
  ].join("\n");

  const draft = await draftStructured({
    system: SYSTEM,
    user,
    schema: IntakeDraft,
    effort: "medium",
  });

  // Keep only resources that really exist in the network.
  const known = new Set(input.resources.map((r) => r.id));
  const list = (items: string[], max: number) =>
    items.map(tidy).filter(Boolean).slice(0, max);

  return {
    firstName: tidy(draft.firstName).slice(0, 40) || "New",
    lastName: tidy(draft.lastName).slice(0, 40) || "Client",
    borough: draft.borough,
    summary: tidy(draft.summary),
    goal: tidy(draft.goal),
    needs: [...new Set(draft.needs)],
    skills: list(draft.skills, 8),
    documents: list(draft.documents, 8),
    keepInMind: list(draft.keepInMind, 6),
    matches: draft.matches
      .filter((m, i, all) => known.has(m.resourceId) && all.findIndex((x) => x.resourceId === m.resourceId) === i)
      .slice(0, 6)
      .map((m) => ({ resourceId: m.resourceId, reason: tidy(m.reason) })),
    steps: draft.steps.slice(0, 8).map((s) => ({
      title: tidy(s.title),
      what: tidy(s.what),
      where: tidy(s.where),
      bring: list(s.bring, 6),
      resourceIds: [...new Set(s.resourceIds.filter((r) => known.has(r)))],
    })),
  };
}
