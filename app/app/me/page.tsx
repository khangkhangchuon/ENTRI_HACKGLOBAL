"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { bigSecondary, Screen } from "@/components/user/app-shell";
import { UserResourceCard } from "@/components/user/resource-card";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { onCaseload, type Sharing } from "@/lib/demo/types";

const SHARE: { key: keyof Sharing; label: string }[] = [
  { key: "profile", label: "My profile" },
  { key: "plan", label: "My plan" },
  { key: "progress", label: "My progress" },
];

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? "bg-moss-600" : "bg-sand-300"}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${checked ? "left-7" : "left-1"}`}
      />
    </button>
  );
}

export default function MePage() {
  const router = useRouter();
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);
  const organizations = useDemo((s) => s.organizations);
  const resources = useDemo((s) => s.resources);
  const savedIds = useDemo((s) => s.savedResourceIds);
  const setSharing = useDemo((s) => s.setSharing);
  const signOut = useDemo((s) => s.signOut);

  const connected = onCaseload(me);
  const saved = resources.filter((r) => savedIds.includes(r.id));
  const sharedWith = Object.keys(me.sharing).flatMap(
    (id) => organizations.find((o) => o.id === id) ?? [],
  );

  return (
    <Screen title="Me">
      <section className="rounded-2xl border border-sand-200 bg-white p-4">
        <p className="text-2xl font-semibold">
          {me.firstName} {me.lastName}
        </p>
        <p className="text-ink-soft">Staying in {me.borough}</p>
        {me.goal && (
          <p className="mt-2">
            <span className="font-semibold">My goal:</span> {me.goal}
          </p>
        )}
      </section>

      {connected ? (
        <>
          <h2 className="mt-7 font-display text-2xl">What I share</h2>
          <p className="mt-1 text-[17px] text-ink-soft">
            You decide what each organization can see. You can change this at
            any time.
          </p>
          <div className="mt-3 space-y-3">
            {sharedWith.map((org) => {
              const sharing = me.sharing[org.id];
              return (
                <fieldset
                  key={org.id}
                  className="rounded-2xl border border-sand-200 bg-white p-4"
                >
                  <legend className="sr-only">{org.name}</legend>
                  <p className="font-semibold" aria-hidden>
                    {org.name}
                  </p>
                  <ul className="mt-2 space-y-2.5">
                    {SHARE.map((o) => (
                      <li
                        key={o.key}
                        className="flex items-center justify-between gap-3"
                      >
                        <span>{o.label}</span>
                        <Switch
                          label={`Share ${o.label.toLowerCase()} with ${org.name}`}
                          checked={sharing[o.key]}
                          onChange={(value) =>
                            setSharing(me.id, org.id, {
                              ...sharing,
                              [o.key]: value,
                            })
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </fieldset>
              );
            })}
          </div>

          <h2 className="mt-7 font-display text-2xl">My caseworker</h2>
          <div className="mt-3 rounded-2xl border border-sand-200 bg-white p-4">
            <p className="font-semibold">{caseworker.name}</p>
            <p className="text-ink-soft">
              {caseworker.role}, Brooklyn Bridges Reentry Center
            </p>
            <Link href="/app/messages" className={`${bigSecondary} mt-3`}>
              Message {caseworker.firstName}
            </Link>
          </div>
        </>
      ) : (
        <>
          <h2 className="mt-7 font-display text-2xl">What I share</h2>
          <p className="mt-1 text-[17px] text-ink-soft">
            Nothing. You are using Entri on your own, and no organization can
            see your profile, your plan or your progress.
          </p>
          <h2 className="mt-7 font-display text-2xl">My caseworker</h2>
          <div className="mt-3 rounded-2xl border border-sand-200 bg-white p-4">
            <p>
              You do not have a caseworker, and you do not need one to use
              Entri. If you want a person to help, you can ask for one.
            </p>
            <Link href="/app/caseworker" className={`${bigSecondary} mt-3`}>
              Get a caseworker
            </Link>
          </div>
        </>
      )}

      <h2 className="mt-7 font-display text-2xl">Saved places</h2>
      {saved.length === 0 ? (
        <p className="mt-2 text-ink-soft">
          Nothing saved yet. Tap Save on any place in Find help.
        </p>
      ) : (
        <div className="mt-3 grid gap-3 @2xl:grid-cols-2">
          {saved.map((r) => (
            <UserResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}

      <div className="mt-8 space-y-2.5 @2xl:flex @2xl:gap-3 @2xl:space-y-0">
        <Link href="/app/guide" className={bigSecondary}>
          See the guide again
        </Link>
        <button
          type="button"
          className={bigSecondary}
          onClick={() => {
            signOut();
            router.replace("/app/login");
          }}
        >
          Sign out
        </button>
      </div>
    </Screen>
  );
}
