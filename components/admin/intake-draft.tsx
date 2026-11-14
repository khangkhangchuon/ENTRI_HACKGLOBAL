"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { TierBadge } from "@/components/admin/resource-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableList, move } from "@/components/ui/editable-list";
import { SelectField, TextArea, TextField, inputClass } from "@/components/ui/field";
import type { IntakeDraft } from "@/lib/ai/schemas";
import { useDemo } from "@/lib/demo/store";
import { BOROUGHS, NEED_CHIPS, type Borough, type Need } from "@/lib/demo/types";

// The draft as the caseworker edits it. Each step carries a key so React
// can follow it when steps are reordered.
export type DraftStep = IntakeDraft["steps"][number] & { key: string };
export type Draft = Omit<IntakeDraft, "steps"> & { steps: DraftStep[] };

let stepKey = 0;
export const toDraft = (d: IntakeDraft): Draft => ({
  ...d,
  steps: d.steps.map((s) => ({ ...s, key: `step-${stepKey++}` })),
});
export const blankStep = (): DraftStep => ({
  key: `step-${stepKey++}`,
  title: "",
  what: "",
  where: "",
  bring: [],
  resourceIds: [],
});

const iconButton =
  "rounded-md p-1.5 text-ink-soft hover:bg-sand-100 disabled:opacity-30 disabled:hover:bg-transparent";

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg">{children}</h3>;
}

function StepCard({
  step,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  step: DraftStep;
  index: number;
  count: number;
  onChange: (step: DraftStep) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const resources = useDemo((s) => s.resources);
  // A step added by hand opens ready to fill in.
  const [editing, setEditing] = useState(step.title === "");
  const linked = step.resourceIds.flatMap((id) => resources.find((r) => r.id === id) ?? []);

  return (
    <li className="rounded-lg border border-sand-200 bg-paper p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-3">
              <TextField
                label="Step"
                value={step.title}
                onChange={(e) => onChange({ ...step, title: e.target.value })}
                placeholder="For example: Get a state ID"
              />
              <TextArea
                label="What to do"
                rows={2}
                value={step.what}
                onChange={(e) => onChange({ ...step, what: e.target.value })}
              />
              <TextField
                label="Where to go"
                value={step.where}
                onChange={(e) => onChange({ ...step, where: e.target.value })}
              />
              <EditableList
                label="What to bring"
                items={step.bring}
                onChange={(bring) => onChange({ ...step, bring })}
                addLabel="Add an item"
              />
              <div>
                <p className="mb-1 text-sm font-semibold">Linked resources</p>
                <div className="flex flex-wrap gap-1.5">
                  {linked.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1 rounded-full bg-sand-100 py-0.5 pl-2.5 pr-1 text-sm"
                    >
                      {r.name}
                      <button
                        type="button"
                        aria-label={`Unlink ${r.name}`}
                        className="rounded-full p-0.5 hover:bg-sand-200"
                        onClick={() =>
                          onChange({
                            ...step,
                            resourceIds: step.resourceIds.filter((x) => x !== r.id),
                          })
                        }
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  aria-label="Link a resource to this step"
                  className={`${inputClass} mt-1.5`}
                  value=""
                  onChange={(e) =>
                    e.target.value &&
                    onChange({ ...step, resourceIds: [...step.resourceIds, e.target.value] })
                  }
                >
                  <option value="">Link a resource</option>
                  {resources
                    .filter((r) => !step.resourceIds.includes(r.id))
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.borough})
                      </option>
                    ))}
                </select>
              </div>
              <Button size="sm" onClick={() => setEditing(false)}>
                <Check className="h-4 w-4" aria-hidden />
                Done editing
              </Button>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold leading-snug">
                {step.title || "Untitled step"}
              </p>
              <p className="mt-1 text-ink-soft">{step.what}</p>
              {step.where && (
                <p className="mt-1.5 text-[15px]">
                  <span className="font-semibold">Where:</span> {step.where}
                </p>
              )}
              {step.bring.length > 0 && (
                <p className="mt-1 text-[15px]">
                  <span className="font-semibold">Bring:</span> {step.bring.join(", ")}
                </p>
              )}
              {linked.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {linked.map((r) => (
                    <Badge key={r.id}>{r.name}</Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
          <button
            type="button"
            className={iconButton}
            aria-label={`Move step ${index + 1} up`}
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={iconButton}
            aria-label={`Move step ${index + 1} down`}
            disabled={index === count - 1}
            onClick={() => onMove(index + 1)}
          >
            <ArrowDown className="h-4 w-4" aria-hidden />
          </button>
          {!editing && (
            <button
              type="button"
              className={iconButton}
              aria-label={`Edit step ${index + 1}`}
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            className={iconButton}
            aria-label={`Remove step ${index + 1}`}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
}

// Every part of the draft can be edited, reordered or removed before the
// caseworker approves it.
export function IntakeDraftEditor({
  draft,
  onChange,
  nameEditable,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  nameEditable: boolean;
}) {
  const resources = useDemo((s) => s.resources);
  const organizations = useDemo((s) => s.organizations);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    onChange({ ...draft, [key]: value });
  const unusedNeeds = (Object.keys(NEED_CHIPS) as Need[]).filter(
    (n) => !draft.needs.includes(n),
  );

  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <Heading>Profile</Heading>
        <div className="grid gap-3 sm:grid-cols-3">
          {nameEditable && (
            <>
              <TextField
                label="First name"
                value={draft.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
              <TextField
                label="Last name"
                value={draft.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </>
          )}
          <SelectField
            label="Borough"
            value={draft.borough}
            onChange={(e) => set("borough", e.target.value as Borough)}
          >
            {BOROUGHS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </SelectField>
        </div>
        <TextArea
          label="Summary of the situation"
          rows={3}
          value={draft.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
        <TextField
          label="Their goal"
          value={draft.goal}
          onChange={(e) => set("goal", e.target.value)}
        />
      </section>

      <section>
        <Heading>Immediate needs, most urgent first</Heading>
        <ol className="mt-2 space-y-1.5">
          {draft.needs.map((n, i) => (
            <li
              key={n}
              className="flex items-center gap-2 rounded-lg border border-sand-200 bg-paper py-1 pl-3 pr-1"
            >
              <span className="w-5 text-sm text-ink-soft">{i + 1}</span>
              <span className="flex-1 font-semibold">{NEED_CHIPS[n]}</span>
              <button
                type="button"
                className={iconButton}
                aria-label={`Move ${NEED_CHIPS[n]} up`}
                disabled={i === 0}
                onClick={() => set("needs", move(draft.needs, i, i - 1))}
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label={`Move ${NEED_CHIPS[n]} down`}
                disabled={i === draft.needs.length - 1}
                onClick={() => set("needs", move(draft.needs, i, i + 1))}
              >
                <ArrowDown className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label={`Remove ${NEED_CHIPS[n]}`}
                onClick={() =>
                  set(
                    "needs",
                    draft.needs.filter((x) => x !== n),
                  )
                }
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
        {unusedNeeds.length > 0 && (
          <select
            aria-label="Add a need"
            className={`${inputClass} mt-2 max-w-xs`}
            value=""
            onChange={(e) =>
              e.target.value && set("needs", [...draft.needs, e.target.value as Need])
            }
          >
            <option value="">Add a need</option>
            {unusedNeeds.map((n) => (
              <option key={n} value={n}>
                {NEED_CHIPS[n]}
              </option>
            ))}
          </select>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <EditableList
          label="Skills and work history"
          items={draft.skills}
          onChange={(v) => set("skills", v)}
          addLabel="Add a skill"
        />
        <EditableList
          label="Documents on hand"
          items={draft.documents}
          onChange={(v) => set("documents", v)}
          addLabel="Add a document"
        />
      </section>

      <section>
        <Heading>Resources in the network that may fit</Heading>
        {draft.matches.length === 0 && (
          <p className="mt-2 text-ink-soft">No suggested resources.</p>
        )}
        <ul className="mt-2 grid gap-3 md:grid-cols-2">
          {draft.matches.map((m) => {
            const r = resources.find((x) => x.id === m.resourceId);
            if (!r) return null;
            const org = organizations.find((o) => o.id === r.orgId);
            return (
              <li key={m.resourceId} className="rounded-lg border border-sand-200 bg-paper p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold leading-snug">{r.name}</p>
                    <p className="text-sm text-ink-soft">
                      {org?.name}, {r.borough}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={iconButton}
                    aria-label={`Remove ${r.name}`}
                    onClick={() =>
                      set(
                        "matches",
                        draft.matches.filter((x) => x.resourceId !== m.resourceId),
                      )
                    }
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <TierBadge org={org} />
                  {r.fairChance && <Badge tone="moss">Fair-chance employer</Badge>}
                </div>
                <p className="mt-1.5 text-[15px]">{m.reason}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <Heading>The plan, in order</Heading>
        <p className="mt-0.5 text-sm text-ink-soft">
          This is what the client will see, one step at a time.
        </p>
        <ol className="mt-3 space-y-3">
          {draft.steps.map((s, i) => (
            <StepCard
              key={s.key}
              step={s}
              index={i}
              count={draft.steps.length}
              onChange={(next) =>
                set(
                  "steps",
                  draft.steps.map((x) => (x.key === s.key ? next : x)),
                )
              }
              onMove={(to) => set("steps", move(draft.steps, i, to))}
              onRemove={() =>
                set(
                  "steps",
                  draft.steps.filter((x) => x.key !== s.key),
                )
              }
            />
          ))}
        </ol>
        <button
          type="button"
          onClick={() => set("steps", [...draft.steps, blankStep()])}
          className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-ember-700 hover:bg-ember-100"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add a step
        </button>
      </section>

      <section>
        <EditableList
          label="Keep in mind (only you see this)"
          items={draft.keepInMind}
          onChange={(v) => set("keepInMind", v)}
          addLabel="Add a point"
        />
      </section>
    </div>
  );
}
