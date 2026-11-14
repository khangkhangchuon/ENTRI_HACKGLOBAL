"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Circle, Lock, Pencil, Send, Sparkles } from "lucide-react";
import { MessageThread } from "@/components/admin/message-thread";
import { ReferralDialog } from "@/components/admin/referral-dialog";
import {
  ProgressBar,
  ReferralBadge,
  StatusBadge,
  WhenReady,
  fullName,
} from "@/components/admin/shared";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EditableList } from "@/components/ui/editable-list";
import { TextArea, TextField } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo/store";
import { NEED_CHIPS, type PlanStep } from "@/lib/demo/types";
import { daysSince, shortDate, timeAgo } from "@/lib/format";

function StepIcon({ status }: { status: PlanStep["status"] }) {
  if (status === "done") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-moss-600 text-white">
        <Check className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ember-500 text-white">
        <Circle className="h-3 w-3 fill-current" aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-200 text-ink-soft">
      <Lock className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

const STEP_LABEL = { done: "Done", current: "Current step", locked: "Not yet open" };

function StepEditor({
  clientId,
  step,
  onClose,
}: {
  clientId: string;
  step: PlanStep;
  onClose: () => void;
}) {
  const editStep = useDemo((s) => s.editStep);
  const removeStep = useDemo((s) => s.removeStep);
  const [title, setTitle] = useState(step.title);
  const [what, setWhat] = useState(step.what);
  const [where, setWhere] = useState(step.where);
  const [bring, setBring] = useState(step.bring);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        editStep(clientId, step.id, {
          title: title.trim() || step.title,
          what: what.trim(),
          where: where.trim(),
          bring: bring.map((b) => b.trim()).filter(Boolean),
        });
        toast("Step updated. The client sees the change.");
        onClose();
      }}
    >
      <TextField label="Step" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <TextArea
        label="What to do"
        rows={3}
        value={what}
        onChange={(e) => setWhat(e.target.value)}
      />
      <TextField label="Where to go" value={where} onChange={(e) => setWhere(e.target.value)} />
      <EditableList label="What to bring" items={bring} onChange={setBring} addLabel="Add an item" />
      <div className="flex flex-wrap justify-between gap-2">
        {step.status !== "done" ? (
          <Button
            variant="quiet"
            onClick={() => {
              removeStep(clientId, step.id);
              toast("Step removed");
              onClose();
            }}
          >
            Remove this step
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}

function Detail({ id }: { id: string }) {
  const client = useDemo((s) => s.clients.find((c) => c.id === id));
  const resources = useDemo((s) => s.resources);
  const organizations = useDemo((s) => s.organizations);
  const referrals = useDemo((s) => s.referrals);
  const activity = useDemo((s) => s.activity);
  const addCaseNote = useDemo((s) => s.addCaseNote);

  const [editing, setEditing] = useState<PlanStep | null>(null);
  const [referring, setReferring] = useState(false);
  const [note, setNote] = useState("");

  if (!client) {
    return (
      <div className="py-10">
        <p className="text-lg">This client is not on your caseload.</p>
        <Link href="/admin/clients" className={`${buttonClass()} mt-4`}>
          Back to clients
        </Link>
      </div>
    );
  }

  const done = client.plan.filter((s) => s.status === "done").length;
  const mine = referrals.filter((r) => r.clientId === client.id);
  const history = activity.filter((a) => a.clientId === client.id).slice(0, 8);

  return (
    <>
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ember-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All clients
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl">{fullName(client)}</h1>
            <StatusBadge status={client.status} />
          </div>
          <p className="mt-1.5 text-ink-soft">
            {client.borough}. Joined your caseload{" "}
            {daysSince(client.createdAt) === 0 ? "today" : timeAgo(client.createdAt).toLowerCase()}
            . Last check-in {timeAgo(client.lastCheckIn).toLowerCase()}.
          </p>
        </div>
        <Button onClick={() => setReferring(true)}>
          <Send className="h-4 w-4" aria-hidden />
          Refer {client.firstName}
        </Button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle>Plan</SectionTitle>
              {client.plan.length > 0 && <ProgressBar done={done} total={client.plan.length} />}
            </div>

            {client.planStatus === "none" ? (
              <div className="mt-3 rounded-lg bg-sand-100 p-4">
                <p>
                  {client.firstName} has no plan yet. On {client.firstName}&apos;s side, Entri
                  says that you are preparing it.
                </p>
                <Link
                  href={`/admin/intake?client=${client.id}`}
                  className={`${buttonClass("primary")} mt-3`}
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Start Smart Intake
                </Link>
              </div>
            ) : (
              <>
              {client.planStatus === "starter" && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-sand-100 p-3.5">
                  <p className="max-w-md text-[15px]">
                    This is the starter plan {client.firstName} began online, built from the
                    standard steps. Smart Intake can make it personal.
                  </p>
                  <Link
                    href={`/admin/intake?client=${client.id}`}
                    className={buttonClass("primary", "sm")}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Start Smart Intake
                  </Link>
                </div>
              )}
              <ol className="mt-4 space-y-3">
                {client.plan.map((s) => (
                  <li key={s.id} className="flex gap-3 rounded-lg border border-sand-200 p-3.5">
                    <StepIcon status={s.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-semibold">{s.title}</p>
                        <span className="text-sm text-ink-soft">
                          {s.status === "done" && s.completedAt
                            ? `Done ${shortDate(s.completedAt)}`
                            : STEP_LABEL[s.status]}
                        </span>
                        {s.status === "current" && s.dueAt && daysSince(s.dueAt) > 0 && (
                          <Badge tone="amber">{daysSince(s.dueAt)} days past due</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-[15px] text-ink-soft">{s.what}</p>
                      <p className="mt-1 text-[15px]">
                        <span className="font-semibold">Where:</span> {s.where}
                      </p>
                      {s.bring.length > 0 && (
                        <p className="mt-1 text-[15px]">
                          <span className="font-semibold">Bring:</span> {s.bring.join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing(s)}
                      aria-label={`Edit step: ${s.title}`}
                      className="h-fit rounded-md p-1.5 text-ink-soft hover:bg-sand-100"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ol>
              </>
            )}
          </Card>

          <Card id="messages" className="scroll-mt-6">
            <SectionTitle>Messages with {client.firstName}</SectionTitle>
            <p className="mb-3 mt-1 text-sm text-ink-soft">
              Person to person. No AI reads or writes these.
            </p>
            <MessageThread clientId={client.id} side="caseworker" otherName={client.firstName} />
          </Card>

          <Card>
            <SectionTitle>Referrals</SectionTitle>
            {mine.length === 0 ? (
              <p className="mt-2 text-ink-soft">No referrals yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-sand-200">
                {mine.map((r) => {
                  const resource = resources.find((x) => x.id === r.resourceId);
                  const org = organizations.find((o) => o.id === r.toOrgId);
                  return (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                      <div>
                        <p className="font-semibold">{resource?.name ?? "A resource"}</p>
                        <p className="text-sm text-ink-soft">
                          {org?.name}. Sent {timeAgo(r.at).toLowerCase()}. Shared:{" "}
                          {r.shared.length ? r.shared.join(", ") : "nothing beyond the name"}.
                        </p>
                      </div>
                      <ReferralBadge status={r.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Profile</SectionTitle>
            {client.summary ? (
              <p className="mt-2">{client.summary}</p>
            ) : (
              <p className="mt-2 text-ink-soft">
                The profile is filled in when you approve a Smart Intake draft.
              </p>
            )}
            {client.goal && (
              <p className="mt-3">
                <span className="font-semibold">Goal:</span> {client.goal}
              </p>
            )}
            <dl className="mt-3 space-y-3 text-[15px]">
              {client.needs.length > 0 && (
                <div>
                  <dt className="font-semibold">Needs</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {client.needs.map((n) => (
                      <Badge key={n}>{NEED_CHIPS[n]}</Badge>
                    ))}
                  </dd>
                </div>
              )}
              {client.skills.length > 0 && (
                <div>
                  <dt className="font-semibold">Skills and work history</dt>
                  <dd className="text-ink-soft">{client.skills.join(". ")}</dd>
                </div>
              )}
              {client.documents.length > 0 && (
                <div>
                  <dt className="font-semibold">Documents on hand</dt>
                  <dd className="text-ink-soft">{client.documents.join(", ")}</dd>
                </div>
              )}
              {client.keepInMind.length > 0 && (
                <div>
                  <dt className="font-semibold">Keep in mind</dt>
                  <dd>
                    <ul className="list-disc pl-5 text-ink-soft">
                      {client.keepInMind.map((k) => (
                        <li key={k}>{k}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <SectionTitle>Case notes</SectionTitle>
            <p className="mt-1 text-sm text-ink-soft">
              Private to Brooklyn Bridges. Never shared with the client or another organization.
            </p>
            <form
              className="mt-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                addCaseNote(client.id, note);
                setNote("");
                toast("Note saved");
              }}
            >
              <TextArea
                label="New note"
                rows={2}
                maxLength={1000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button type="submit" size="sm" className="mt-2" disabled={!note.trim()}>
                Save note
              </Button>
            </form>
            <ul className="mt-3 space-y-2.5">
              {client.caseNotes.map((n) => (
                <li key={n.id} className="rounded-lg bg-sand-100 p-3 text-[15px]">
                  <p className="whitespace-pre-wrap">{n.text}</p>
                  <p className="mt-1 text-xs text-ink-soft">{timeAgo(n.at)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle>Activity</SectionTitle>
            {history.length === 0 ? (
              <p className="mt-2 text-ink-soft">Nothing yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-sand-200 text-[15px]">
                {history.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3 py-2">
                    <span>{a.text}</span>
                    <span className="shrink-0 text-sm text-ink-soft">{timeAgo(a.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Edit step">
        {editing && (
          <StepEditor
            key={editing.id}
            clientId={client.id}
            step={editing}
            onClose={() => setEditing(null)}
          />
        )}
      </Dialog>
      <ReferralDialog
        target={referring ? { clientId: client.id, clientIds: [client.id] } : null}
        onClose={() => setReferring(false)}
      />
    </>
  );
}

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <WhenReady>
      <Detail id={id} />
    </WhenReady>
  );
}
