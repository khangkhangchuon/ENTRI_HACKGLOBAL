"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, Check, Globe } from "lucide-react";
import { EntriLogo } from "@/components/brand/logo";
import { inputClass } from "@/components/ui/field";
import { bigPrimary, bigSecondary } from "@/components/user/app-shell";
import { useDemo } from "@/lib/demo/store";
import { BOROUGHS, type Borough, type Need } from "@/lib/demo/types";

type View = "welcome" | "sign-in" | "name" | "borough" | "have";

const HAVE: { need: Need; label: string }[] = [
  { need: "id", label: "A photo ID" },
  { need: "phone", label: "A phone of my own" },
  { need: "banking", label: "A bank account" },
  { need: "benefits", label: "Food or health benefits" },
  { need: "housing", label: "A stable place to stay" },
  { need: "jobs", label: "Steady work" },
];

function DemoNote() {
  return (
    <p className="mt-6 text-center text-[15px] text-ink-soft">
      This is a demo. Nothing you enter is checked or sent anywhere.
    </p>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 inline-flex items-center gap-1.5 font-semibold text-ember-700"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
      Back
    </button>
  );
}

// The front door. Anyone can open Entri in a web browser and sign in or
// create an account, with or without a caseworker.
export default function LoginPage() {
  const router = useRouter();
  const signIn = useDemo((s) => s.signIn);
  const startOwnPlan = useDemo((s) => s.startOwnPlan);
  const seenGuide = useDemo((s) => s.seenGuide);

  const [view, setView] = useState<View>("welcome");
  const [firstName, setFirstName] = useState("Marcus");
  const [borough, setBorough] = useState<Borough>("Brooklyn");
  const [have, setHave] = useState<Need[]>([]);

  // Someone who is already signed in goes straight to their home screen.
  useEffect(() => {
    if (useDemo.getState().signedIn) router.replace("/app");
  }, [router]);

  const enter = () => {
    signIn();
    router.replace(seenGuide ? "/app" : "/app/guide");
  };
  const create = () => {
    startOwnPlan({ firstName, borough, have });
    router.replace("/app/guide");
  };

  return (
    <div className="flex min-h-full flex-col px-6 pb-8 pt-10 text-lg">
      {view === "welcome" && (
        <>
          <EntriLogo size="lg" />
          <h1 className="mt-8 font-display text-4xl leading-tight">
            A place to begin.
          </h1>
          <p className="mt-3 text-ink-soft">
            Entri shows you what to do next after coming home, one step at a
            time.
          </p>
          <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-sand-100 p-4 text-[17px]">
            <Globe
              className="mt-0.5 h-5 w-5 shrink-0 text-ember-600"
              aria-hidden
            />
            Entri is free and opens in any web browser, on a phone or a library
            computer. You can start on your own. You do not need a caseworker to
            begin.
          </p>
          <div className="mt-auto space-y-3 pt-8">
            <button
              type="button"
              className={bigPrimary}
              onClick={() => setView("sign-in")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={bigSecondary}
              onClick={() => setView("name")}
            >
              Create an account
            </button>
          </div>
          <DemoNote />
        </>
      )}

      {view === "sign-in" && (
        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            enter();
          }}
        >
          <Back onClick={() => setView("welcome")} />
          <h1 className="font-display text-3xl">Welcome back</h1>
          <p className="mt-1.5 text-ink-soft">
            For this demo, Marcus&apos;s details are already filled in.
          </p>
          <label className="mt-6 block font-semibold" htmlFor="login-phone">
            Phone number or email
          </label>
          <input
            id="login-phone"
            readOnly
            value="(929) 555-0142"
            className={clsx(inputClass, "mt-1 py-3 text-lg")}
          />
          <label className="mt-4 block font-semibold" htmlFor="login-code">
            Passcode
          </label>
          <input
            id="login-code"
            readOnly
            value="••••••"
            className={clsx(inputClass, "mt-1 py-3 text-lg tracking-widest")}
          />
          <div className="mt-auto pt-8">
            <button type="submit" className={bigPrimary}>
              Sign in as Marcus
            </button>
          </div>
          <DemoNote />
        </form>
      )}

      {view === "name" && (
        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (firstName.trim()) setView("borough");
          }}
        >
          <Back onClick={() => setView("welcome")} />
          <p className="text-[15px] font-semibold text-ember-700">
            Step 1 of 3
          </p>
          <h1 className="mt-1 font-display text-3xl">
            What should we call you?
          </h1>
          <p className="mt-1.5 text-ink-soft">A first name is enough.</p>
          <label className="mt-6 block font-semibold" htmlFor="new-name">
            First name
          </label>
          <input
            id="new-name"
            value={firstName}
            maxLength={30}
            onChange={(e) => setFirstName(e.target.value)}
            className={clsx(inputClass, "mt-1 py-3 text-lg")}
          />
          <div className="mt-auto pt-8">
            <button
              type="submit"
              className={bigPrimary}
              disabled={!firstName.trim()}
            >
              Next
            </button>
          </div>
        </form>
      )}

      {view === "borough" && (
        <div className="flex flex-1 flex-col">
          <Back onClick={() => setView("name")} />
          <p className="text-[15px] font-semibold text-ember-700">
            Step 2 of 3
          </p>
          <h1 className="mt-1 font-display text-3xl">
            Where are you staying now?
          </h1>
          <p className="mt-1.5 text-ink-soft">
            This helps Entri show help near you.
          </p>
          <div
            role="radiogroup"
            aria-label="Borough"
            className="mt-5 space-y-2.5"
          >
            {BOROUGHS.map((b) => (
              <button
                key={b}
                type="button"
                role="radio"
                aria-checked={borough === b}
                onClick={() => setBorough(b)}
                className={clsx(
                  "flex w-full items-center justify-between rounded-2xl border-2 bg-white px-5 py-3.5 text-left font-semibold",
                  borough === b ? "border-ember-500" : "border-sand-200",
                )}
              >
                {b}
                {borough === b && (
                  <Check className="h-5 w-5 text-ember-600" aria-hidden />
                )}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-8">
            <button
              type="button"
              className={bigPrimary}
              onClick={() => setView("have")}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {view === "have" && (
        <div className="flex flex-1 flex-col">
          <Back onClick={() => setView("borough")} />
          <p className="text-[15px] font-semibold text-ember-700">
            Step 3 of 3
          </p>
          <h1 className="mt-1 font-display text-3xl">
            What do you already have?
          </h1>
          <p className="mt-1.5 text-ink-soft">
            Tap what you have. Entri builds your plan from the rest. Having none
            of these is a fine place to start.
          </p>
          <div className="mt-5 space-y-2.5">
            {HAVE.map((h) => {
              const on = have.includes(h.need);
              return (
                <button
                  key={h.need}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() =>
                    setHave(
                      on ? have.filter((n) => n !== h.need) : [...have, h.need],
                    )
                  }
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-5 py-3.5 text-left font-semibold",
                    on ? "border-moss-600" : "border-sand-200",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-6 w-6 items-center justify-center rounded-md border-2",
                      on
                        ? "border-moss-600 bg-moss-600 text-white"
                        : "border-sand-300",
                    )}
                  >
                    {on && <Check className="h-4 w-4" aria-hidden />}
                  </span>
                  {h.label}
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-8">
            <button type="button" className={bigPrimary} onClick={create}>
              Build my plan
            </button>
          </div>
          <DemoNote />
        </div>
      )}
    </div>
  );
}
