"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Sparkles, UserPlus } from "lucide-react";
import {
  IntakeDraftEditor,
  blankStep,
  toDraft,
  type Draft,
} from "@/components/admin/intake-draft";
import { WhenReady, fullName } from "@/components/admin/shared";
import { AiChip } from "@/components/ui/ai-draft";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { SelectField, TextArea, TextField } from "@/components/ui/field";
import { NOTES_MAX, type IntakeDraft, type IntakeRequest } from "@/lib/ai/schemas";
import { postAi } from "@/lib/ai/use-ai";
import { MARCUS_SAVED_DRAFT } from "@/lib/demo/seed";
import { useDemo } from "@/lib/demo/store";
import { BOROUGHS, type Borough } from "@/lib/demo/types";
import { resourceBriefs } from "@/lib/insights/facts";

type Phase =
  | { name: "notes" }
  | { name: "drafting" }
  | { name: "error"; message: string }
  | { name: "review"; source: "ai" | "saved" | "blank" }
  | { name: "approved"; clientId: string; firstName: string; steps: number };

const STAGES = [
  "Reading the notes",
  "Matching resources in the network",
  "Putting the steps in order",
];

// One intake, from notes to approval. Remounted when another client is
// picked, so each intake starts clean.
function IntakeFlow({ clientId }: { clientId: string | null }) {
  const client = useDemo((s) => s.clients.find((c) => c.id === clientId));
  const mainClientId = useDemo((s) => s.mainClientId);
  const createClient = useDemo((s) => s.createClient);
  const approvePlan = useDemo((s) => s.approvePlan);

  const [notes, setNotes] = useState(client?.intakeNotes ?? "");
  const [releaseDate, setReleaseDate] = useState("");
  const [borough, setBorough] = useState<Borough | "">(client?.borough ?? "");
  const [documents, setDocuments] = useState("");
  const [phase, setPhase] = useState<Phase>({ name: "notes" });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [lastSource, setLastSource] = useState<"ai" | "saved" | "blank">("ai");

  const tooShort = notes.trim().length < 20;

  const startDraft = async () => {
    setPhase({ name: "drafting" });
    const body: IntakeRequest = {
      notes: notes.trim(),
      releaseDate: releaseDate || undefined,
      borough: borough || undefined,
      documents: documents.trim() || undefined,
      resources: resourceBriefs(useDemo.getState()),
    };
    const reply = await postAi<IntakeDraft>("/api/intake", body);
    if (reply.ok) {
      setDraft(toDraft(reply.data));
      setLastSource("ai");
      setPhase({ name: "review", source: "ai" });
    } else if (clientId === mainClientId) {
      // The tour must be able to continue, so Marcus has a saved draft.
      setDraft(toDraft(MARCUS_SAVED_DRAFT));
      setLastSource("saved");
      setPhase({ name: "review", source: "saved" });
    } else {
      setPhase({ name: "error", message: reply.message });
    }
  };

  const startBlank = () => {
    setDraft({
      firstName: client?.firstName ?? "",
      lastName: client?.lastName ?? "",
      borough: borough || client?.borough || "Brooklyn",
      summary: "",
      goal: "",
      needs: [],
      skills: [],
      documents: [],
      keepInMind: [],
      matches: [],
      steps: [blankStep()],
    });
    setLastSource("blank");
    setPhase({ name: "review", source: "blank" });
  };

  const steps = draft?.steps.filter((s) => s.title.trim()) ?? [];
  const firstName = client?.firstName ?? draft?.firstName.trim() ?? "";
  const canApprove = steps.length > 0 && firstName.length > 0;

  const approve = () => {
    if (!draft || !canApprove) return;
    const clean = (items: string[]) => items.map((x) => x.trim()).filter(Boolean);
    const id =
      client?.id ??
      createClient({
        firstName,
        lastName: draft.lastName.trim(),
        borough: draft.borough,
        intakeNotes: notes.trim(),
      });
    approvePlan(id, {
      plan: steps.map((s, i) => ({
        id: `${id}-step-${i + 1}`,
        title: s.title.trim(),
        what: s.what.trim(),
        where: s.where.trim(),
        bring: clean(s.bring),
        resourceIds: s.resourceIds,
      })),
      profile: {
        borough: draft.borough,
        summary: draft.summary.trim(),
        goal: draft.goal.trim(),
        needs: draft.needs,
        skills: clean(draft.skills),
        documents: clean(draft.documents),
        keepInMind: clean(draft.keepInMind),
      },
    });
    setPhase({ name: "approved", clientId: id, firstName, steps: steps.length });
    window.scrollTo({ top: 0 });
  };

  if (phase.name === "approved") {
    return (
      <Card className="border-moss-600/40 bg-moss-100/60">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-moss-600" aria-hidden />
          <div>
            <h2 className="font-display text-2xl">
              Approved. {phase.firstName} can now see the first step.
            </h2>
            <p className="mt-1 text-ink-soft">
              The plan has {phase.steps} steps. {phase.firstName} sees one at a time. Your notes
              and the points to keep in mind stay on your side.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {phase.clientId === mainClientId && (
                <Link href="/app" className={buttonClass("primary")}>
                  See it as Marcus
                </Link>
              )}
              <Link href={`/admin/clients/${phase.clientId}`} className={buttonClass()}>
                Open {phase.firstName}&apos;s page
              </Link>
              <Link href="/admin" className={buttonClass()}>
                Back to the dashboard
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (phase.name === "review" && draft) {
    return (
      <div>
        <div className="rounded-xl border-2 border-dashed border-ember-400/70 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="font-display text-2xl">
              Draft for {client ? fullName(client) : "the new client"}
            </h2>
            <AiChip
              label={
                phase.source === "ai"
                  ? "AI-drafted. Needs your review."
                  : phase.source === "saved"
                    ? "Saved draft. Needs your review."
                    : "Written by you"
              }
            />
          </div>
          <p className="mt-1 text-ink-soft">
            {phase.source === "saved"
              ? "The AI assistant is not available right now, so this is a draft saved earlier for Marcus. Review it the same way."
              : phase.source === "blank"
                ? "Fill in the profile and the steps by hand."
                : "Check every part. You can edit, reorder or remove anything. Nothing reaches the client until you approve."}
          </p>
          <div className="mt-6">
            <IntakeDraftEditor draft={draft} onChange={setDraft} nameEditable={!client} />
          </div>
        </div>

        <div className="sticky bottom-0 -mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <p className="text-sm text-ink-soft">
            {canApprove
              ? `${steps.length} steps. ${firstName} will see step 1 first.`
              : "Add a name and at least one step before you approve."}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setPhase({ name: "notes" })}>Back to the notes</Button>
            <Button variant="primary" onClick={approve} disabled={!canApprove}>
              Approve and send to {firstName || "the client"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!tooShort) startDraft();
        }}
        className="space-y-4"
      >
        <TextArea
          label="Notes from the first meeting"
          hint="Rough notes are fine."
          rows={9}
          maxLength={NOTES_MAX}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={phase.name === "drafting"}
          placeholder="Who you met, where they are staying, what documents they have, what they want, what worries them."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Release date"
            hint="Optional"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
          <SelectField
            label="Borough"
            hint="Optional"
            value={borough}
            onChange={(e) => setBorough(e.target.value as Borough | "")}
          >
            <option value="">Not sure yet</option>
            {BOROUGHS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Documents on hand"
            hint="Optional"
            value={documents}
            onChange={(e) => setDocuments(e.target.value)}
            maxLength={300}
            placeholder="Birth certificate, release papers"
          />
        </div>

        <div aria-live="polite">
          {phase.name === "drafting" && (
            <div className="rounded-lg bg-sand-100 p-4">
              <p className="font-semibold">Drafting. This can take up to a minute.</p>
              <ul className="mt-2 space-y-1.5 text-ink-soft">
                {STAGES.map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 animate-pulse rounded-full bg-ember-500"
                      style={{ animationDelay: `${i * 300}ms` }}
                      aria-hidden
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {phase.name === "error" && (
            <div className="rounded-lg bg-amber-100 p-4 text-amber-700">
              <p>{phase.message}</p>
              <button type="button" onClick={startBlank} className="mt-1 font-semibold underline">
                Write the plan by hand instead
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" disabled={tooShort || phase.name === "drafting"}>
            <Sparkles className="h-4 w-4" aria-hidden />
            {draft ? "Draft again" : "Draft profile and plan"}
          </Button>
          {draft && phase.name === "notes" && (
            <Button onClick={() => setPhase({ name: "review", source: lastSource })}>
              Return to the draft
            </Button>
          )}
          <p className="text-sm text-ink-soft">
            Entri drafts. You review, edit and approve.
          </p>
        </div>
      </form>
    </Card>
  );
}

function Intake() {
  const params = useSearchParams();
  const clients = useDemo((s) => s.clients);
  const waiting = clients.filter((c) => c.planStatus === "none");

  const asked = params.get("client");
  const [picked, setPicked] = useState<string>(
    asked && (asked === "new" || waiting.some((c) => c.id === asked))
      ? asked
      : (waiting[0]?.id ?? "new"),
  );

  const options = [
    ...waiting.map((c) => ({
      id: c.id,
      title: fullName(c),
      sub: "Waiting for a plan. Notes are ready.",
    })),
    { id: "new", title: "New client", sub: "Start from your own notes." },
  ];

  return (
    <>
      <PageHeader
        title="Smart Intake"
        intro="Turn rough notes from a first meeting into a draft profile and a step-by-step plan. You stay in charge of what the client sees."
      />

      <div role="radiogroup" aria-label="Who is this intake for?" className="mt-6 flex flex-wrap gap-3">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={picked === o.id}
            onClick={() => setPicked(o.id)}
            className={clsx(
              "flex min-w-52 items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left transition-colors",
              picked === o.id ? "border-ember-500" : "border-sand-200 hover:border-sand-300",
            )}
          >
            {o.id === "new" && <UserPlus className="h-5 w-5 text-ink-soft" aria-hidden />}
            <span>
              <span className="block font-semibold">{o.title}</span>
              <span className="block text-sm text-ink-soft">{o.sub}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <IntakeFlow key={picked} clientId={picked === "new" ? null : picked} />
      </div>
    </>
  );
}

export function SmartIntake() {
  return (
    <WhenReady>
      <Intake />
    </WhenReady>
  );
}
