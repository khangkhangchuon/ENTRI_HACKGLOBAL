"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import {
  ExternalLink,
  MessageSquareHeart,
  Phone,
  Scale,
  Send,
  ShieldCheck,
} from "lucide-react";
import { inputClass } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import {
  QUESTION_MAX,
  type AskAnswer,
  type AskRequest,
  type AskSource,
} from "@/lib/ai/schemas";
import { postAi } from "@/lib/ai/use-ai";
import { CRISIS_TEXT, isCrisis } from "@/lib/ask/safety";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { onCaseload } from "@/lib/demo/types";

interface Turn {
  id: number;
  question: string;
  // null while Entri is working on it. "down" when the AI cannot be reached.
  answer: AskAnswer | "down" | null;
}

// The conversation lives in memory, so it is still there after a visit to
// another tab. It is cleared when the demo is reset.
const useChat = create<{
  seededAt: string;
  turns: Turn[];
  set: (fn: (turns: Turn[]) => Turn[]) => void;
  startFresh: (seededAt: string) => void;
}>((set) => ({
  seededAt: "",
  turns: [],
  set: (fn) => set((s) => ({ turns: fn(s.turns) })),
  startFresh: (seededAt) => set({ seededAt, turns: [] }),
}));

let nextId = 1;

const STARTERS = [
  "What do I need to get a state ID?",
  "Can I get food stamps right away?",
  "Can I talk to a real person?",
  "Do I have to tell an employer about my conviction?",
];

const smallButton =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-sand-300 bg-white px-3.5 py-2.5 text-[17px] font-semibold";

// The one main action in a card, in the ember accent.
const smallPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-ember-500 bg-ember-600 px-3.5 py-2.5 text-[17px] font-semibold text-white";

function SourceTags({ sources }: { sources: AskSource[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const shown = sources.find((s) => s.id === open);
  return (
    <div className="mt-3">
      <p className="text-[15px] font-semibold text-ink-soft">
        Where this comes from
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {sources.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-expanded={open === s.id}
            onClick={() => setOpen(open === s.id ? null : s.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-left text-[15px] ${open === s.id ? "border-moss-600 bg-moss-100 text-moss-700" : "border-sand-300 bg-white text-ink-soft"}`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
            {s.source}, checked {s.checked}
          </button>
        ))}
      </div>
      {shown && (
        <div className="mt-2 rounded-xl border border-sand-200 bg-white p-3.5 text-[17px]">
          <p className="font-semibold">{shown.title}</p>
          <p className="mt-1 text-ink-soft">{shown.passage}</p>
          {shown.url.startsWith("http") ? (
            <a
              href={shown.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 font-semibold text-ember-700 underline"
            >
              Open the official page
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          ) : (
            <Link
              href={shown.url}
              className="mt-2 inline-block font-semibold text-ember-700 underline"
            >
              Open in Entri
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// Ways to reach a real person. Nothing is sent until the person taps.
function PeopleOptions({
  question,
  legal,
}: {
  question: string;
  legal: boolean;
}) {
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);
  const sendMessage = useDemo((s) => s.sendMessage);
  const [sent, setSent] = useState(false);
  const connected = onCaseload(me);

  return (
    <div className="mt-3 grid gap-2">
      {legal && (
        <Link href="/app/find?c=legal" className={smallButton}>
          <Scale className="h-5 w-5" aria-hidden />
          Find a legal advocate
        </Link>
      )}
      {connected ? (
        <button
          type="button"
          disabled={sent}
          className={`${smallButton} disabled:opacity-60`}
          onClick={() => {
            sendMessage(
              me.id,
              "client",
              `A question I asked Entri: ${question}`,
            );
            setSent(true);
            toast(`Sent to ${caseworker.firstName}`);
          }}
        >
          <Send className="h-5 w-5" aria-hidden />
          {sent
            ? `Sent to ${caseworker.firstName}`
            : `Send my question to ${caseworker.firstName}`}
        </button>
      ) : (
        <Link href="/app/caseworker" className={smallButton}>
          Get a caseworker
        </Link>
      )}
      {!legal && (
        <Link href="/app/find" className={smallButton}>
          Look in Find help
        </Link>
      )}
    </div>
  );
}

// For someone who asks for a real person. Nothing is sent until they tap.
function PersonCard() {
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);
  const connected = onCaseload(me);
  return (
    <div className="mt-3 grid gap-2">
      {connected ? (
        <Link href="/app/messages" className={smallPrimary}>
          <Send className="h-5 w-5" aria-hidden />
          Message {caseworker.firstName}
        </Link>
      ) : (
        <Link href="/app/caseworker" className={smallPrimary}>
          Get a caseworker
        </Link>
      )}
      <Link href="/app/find" className={smallButton}>
        Look in Find help
      </Link>
    </div>
  );
}

function CrisisCard() {
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);
  return (
    <div className="rounded-2xl border-2 border-ember-400 bg-white p-4">
      <p className="flex items-start gap-2.5 text-lg">
        <MessageSquareHeart
          className="mt-0.5 h-6 w-6 shrink-0 text-ember-600"
          aria-hidden
        />
        {CRISIS_TEXT}
      </p>
      <div className="mt-3 grid gap-2">
        <a href="tel:988" className={smallPrimary}>
          <Phone className="h-5 w-5" aria-hidden />
          Call 988
        </a>
        <a href="sms:988" className={smallButton}>
          Text 988
        </a>
        <p className="text-[17px] text-ink-soft">
          988 is the Suicide and Crisis Lifeline. It is free and open all day,
          every day.
        </p>
        <a href="tel:911" className={smallButton}>
          <Phone className="h-5 w-5" aria-hidden />
          Call 911 in an emergency
        </a>
        {onCaseload(me) && (
          <Link href="/app/messages" className={smallButton}>
            Message {caseworker.firstName}
          </Link>
        )}
      </div>
    </div>
  );
}

function Answer({ turn }: { turn: Turn }) {
  const a = turn.answer;
  if (a === null) {
    return (
      <p className="text-ink-soft" role="status">
        <span className="inline-block animate-pulse">
          Looking in the verified sources…
        </span>
      </p>
    );
  }
  if (a === "down") {
    return (
      <div>
        <p>
          Ask Entri can&apos;t answer right now. Nothing is wrong on your side.
          You can try again in a little while.
        </p>
        <PeopleOptions question={turn.question} legal={false} />
      </div>
    );
  }
  if (a.kind === "crisis") return <CrisisCard />;

  return (
    <div>
      <p className="whitespace-pre-line">{a.text}</p>
      {a.kind === "answer" && <SourceTags sources={a.sources} />}
      {a.kind === "legal" && (
        <div className="mt-3 rounded-2xl border-2 border-sand-300 bg-white p-4">
          <p className="font-semibold">Talk to a real person about this</p>
          <p className="text-[17px] text-ink-soft">
            A legal advocate knows the rules for your own case. You choose
            whether to reach out.
          </p>
          <PeopleOptions question={turn.question} legal />
        </div>
      )}
      {a.kind === "answer" && a.offerAdvocate && (
        <div className="mt-3 rounded-2xl bg-sand-100 p-4">
          <p className="text-[17px]">
            This is general information. For your own case, a legal advocate can
            help.
          </p>
          <PeopleOptions question={turn.question} legal />
        </div>
      )}
      {a.kind === "person" && <PersonCard />}
      {a.kind === "unknown" && (
        <div className="mt-1">
          <p className="text-[17px] text-ink-soft">
            A person may be able to help with this one.
          </p>
          <PeopleOptions question={turn.question} legal={false} />
        </div>
      )}
    </div>
  );
}

export function AskChat() {
  const params = useSearchParams();
  const me = useDemo(selectMainClient);
  const seededAt = useDemo((s) => s.seededAt);
  const turns = useChat((s) => s.turns);
  const chatSeed = useChat((s) => s.seededAt);
  const setTurns = useChat((s) => s.set);
  const startFresh = useChat((s) => s.startFresh);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // A reset demo starts a new conversation.
  useEffect(() => {
    if (chatSeed !== seededAt) startFresh(seededAt);
  }, [chatSeed, seededAt, startFresh]);

  useEffect(() => {
    if (turns.length > 0) endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  const step = me.plan.find((s) => s.id === params.get("step"));
  const current = me.plan.find((s) => s.status === "current");
  const starters = step
    ? [
        `I need help with this step: ${step.title}. What do I do?`,
        ...STARTERS.slice(0, 3),
      ]
    : STARTERS;
  const busy = turns.some((t) => t.answer === null);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    const id = nextId++;
    setText("");
    const history = turns
      .slice(-3)
      .flatMap((t) => [
        { role: "user" as const, text: t.question },
        ...(t.answer && t.answer !== "down"
          ? [{ role: "entri" as const, text: t.answer.text.slice(0, 1200) }]
          : []),
      ])
      .slice(-6);
    setTurns((all) => [...all, { id, question: q, answer: null }]);

    // Crisis words are caught here as well, so help shows at once even if
    // the network is slow or down.
    if (isCrisis(q)) {
      setTurns((all) =>
        all.map((t) =>
          t.id === id
            ? {
                ...t,
                answer: {
                  kind: "crisis",
                  text: CRISIS_TEXT,
                  sources: [],
                  offerAdvocate: false,
                },
              }
            : t,
        ),
      );
      return;
    }

    const state = useDemo.getState();
    const body: AskRequest = {
      question: q,
      history,
      context: {
        firstName: me.firstName.slice(0, 40),
        borough: me.borough,
        currentStep: (step ?? current)?.title.slice(0, 160) ?? null,
        hasCaseworker: onCaseload(me),
      },
      listings: state.resources.slice(0, 80).map((r) => ({
        id: r.id,
        name: r.name.slice(0, 160),
        org: (
          state.organizations.find((o) => o.id === r.orgId)?.name ?? ""
        ).slice(0, 160),
        category: r.category,
        borough: r.borough,
        offers: r.offers.slice(0, 400),
        address: r.address.slice(0, 200),
        contact: r.contact.slice(0, 200),
        howToApply: r.howToApply.slice(0, 400),
        fairChance: r.fairChance,
      })),
    };
    const reply = await postAi<AskAnswer>("/api/ask", body);
    setTurns((all) =>
      all.map((t) =>
        t.id === id ? { ...t, answer: reply.ok ? reply.data : "down" } : t,
      ),
    );
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-4 pt-5 text-lg">
      <h1 className="font-display text-3xl leading-tight">Ask Entri</h1>
      <p className="mt-1.5 flex items-start gap-2 rounded-2xl bg-sand-100 p-3.5 text-[17px]">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-moss-600"
          aria-hidden
        />
        Answers come from verified sources. Legal questions go to a real person.
      </p>

      {turns.length === 0 && (
        <div className="mt-5">
          <p className="font-semibold">
            Not sure what to ask? Try one of these.
          </p>
          <div className="mt-2 grid gap-2">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-2xl border border-sand-200 bg-white px-4 py-3 text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <ol className="mt-5 space-y-4" aria-live="polite">
        {turns.map((t) => (
          <li key={t.id} className="space-y-2.5">
            <div className="flex justify-end">
              <p className="max-w-[88%] rounded-2xl bg-ember-100 px-4 py-2.5">
                {t.question}
              </p>
            </div>
            <div className="max-w-[94%] rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-sand-200">
              <Answer turn={t} />
            </div>
          </li>
        ))}
      </ol>
      <div ref={endRef} className="scroll-mb-28" />

      <form
        className="sticky bottom-0 mt-auto flex items-end gap-2 bg-paper pb-1 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
      >
        <textarea
          aria-label="Your question"
          rows={2}
          maxLength={QUESTION_MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(text);
            }
          }}
          placeholder="Ask in your own words"
          className={`${inputClass} text-lg`}
        />
        <button
          type="submit"
          disabled={!text.trim() || busy}
          aria-label="Send"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-ember-600 text-white disabled:opacity-50"
        >
          <Send className="h-6 w-6" aria-hidden />
        </button>
      </form>
    </div>
  );
}
