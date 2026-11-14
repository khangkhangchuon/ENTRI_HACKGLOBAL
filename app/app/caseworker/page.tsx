"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { inputClass } from "@/components/ui/field";
import { bigPrimary, bigSecondary } from "@/components/user/app-shell";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { onCaseload, type Sharing } from "@/lib/demo/types";

const SHARE: { key: keyof Sharing; label: string; help: string }[] = [
  {
    key: "profile",
    label: "My profile",
    help: "Your first name and where you are staying",
  },
  { key: "plan", label: "My plan", help: "The steps in your plan" },
  {
    key: "progress",
    label: "My progress",
    help: "Which steps you have finished",
  },
];

// Asking for a caseworker is always the person's own choice. They decide
// what to share before anything is sent.
export default function CaseworkerPage() {
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);
  const org = useDemo((s) => s.organizations.find((o) => o.id === s.homeOrgId));
  const connectCaseworker = useDemo((s) => s.connectCaseworker);
  const [sharing, setSharing] = useState<Sharing>({
    profile: true,
    plan: true,
    progress: true,
  });
  const [note, setNote] = useState("");

  if (onCaseload(me)) {
    return (
      <div className="px-5 pb-8 pt-6 text-lg">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-moss-600 text-white">
          <Check className="h-9 w-9" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-3xl leading-tight">
          {caseworker.name} is your caseworker.
        </h1>
        <p className="mt-2 text-ink-soft">
          She works at {org?.name}. She can see what you chose to share. Your
          plan keeps working the same way.
        </p>
        <p className="mt-3 rounded-2xl bg-sand-100 p-4 text-[17px]">
          In real use, the organization answers your request first. In this demo
          you are connected right away.
        </p>
        <div className="mt-6 space-y-2.5">
          <Link href="/app/messages" className={bigPrimary}>
            Message {caseworker.firstName}
          </Link>
          <Link href="/app" className={bigSecondary}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="px-5 pb-8 pt-4 text-lg"
      onSubmit={(e) => {
        e.preventDefault();
        connectCaseworker({ sharing, note });
      }}
    >
      <Link
        href="/app/find"
        className="inline-flex items-center gap-1.5 font-semibold text-ember-700"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
        Find help
      </Link>
      <h1 className="mt-3 font-display text-3xl leading-tight">
        Get a caseworker
      </h1>
      <p className="mt-2 text-ink-soft">
        A caseworker is a real person at a reentry organization. They can make
        your plan more personal, refer you to other organizations and answer
        your messages. It is free, and it is your choice.
      </p>

      <h2 className="mt-6 text-[15px] font-semibold text-ink-soft">
        An organization that can help
      </h2>
      <div className="mt-1.5 rounded-2xl border-2 border-ember-400 bg-white p-4">
        <p className="font-semibold">{org?.name}</p>
        <p className="mt-1 text-[17px] text-ink-soft">{org?.about}</p>
      </div>

      <fieldset className="mt-6">
        <legend className="font-display text-2xl">
          What do you want to share?
        </legend>
        <p className="mt-1 text-[17px] text-ink-soft">
          Only this organization sees it.
        </p>
        <div className="mt-3 space-y-2.5">
          {SHARE.map((o) => {
            const on = sharing[o.key];
            return (
              <button
                key={o.key}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => setSharing({ ...sharing, [o.key]: !on })}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left ${on ? "border-moss-600" : "border-sand-200"}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${on ? "border-moss-600 bg-moss-600 text-white" : "border-sand-300"}`}
                >
                  {on && <Check className="h-4 w-4" aria-hidden />}
                </span>
                <span>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="block text-[17px] text-ink-soft">
                    {o.help}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="connect-note" className="mt-6 block font-semibold">
        Anything you want them to know?{" "}
        <span className="font-normal text-ink-soft">
          You can leave this empty.
        </span>
      </label>
      <textarea
        id="connect-note"
        rows={3}
        maxLength={500}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={`${inputClass} mt-1 text-lg`}
      />

      <button type="submit" className={`${bigPrimary} mt-6`}>
        Ask for a caseworker
      </button>
    </form>
  );
}
