import Link from "next/link";
import { ArrowRight, Check, Lock, Sparkles, Volume2 } from "lucide-react";
import { EntriLogo, EntriMark, EntriWordmark } from "@/components/brand/logo";

export const metadata = { title: "Entri: brand proposal" };

type Swatch = { name: string; hex: string; className: string; use: string; light?: boolean };

const COLD: Swatch[] = [
  { name: "Night 950", hex: "#0B1015", className: "bg-night-950", use: "Hero and problem backgrounds" },
  { name: "Night 800", hex: "#1A242D", className: "bg-night-800", use: "Panels on dark" },
  { name: "Steel 500", hex: "#5F6E7B", className: "bg-steel-500", use: "The locked loop, unlit dots" },
  { name: "Steel 300", hex: "#A7B2BC", className: "bg-steel-300", use: "Quiet text on dark", light: true },
  { name: "Steel 100", hex: "#DCE2E7", className: "bg-steel-100", use: "Main text on dark", light: true },
];

const WARM: Swatch[] = [
  { name: "Paper", hex: "#FBF7F0", className: "bg-paper", use: "Page background", light: true },
  { name: "Sand 100", hex: "#F4ECDF", className: "bg-sand-100", use: "Soft panels", light: true },
  { name: "Sand 200", hex: "#E9DCC8", className: "bg-sand-200", use: "Borders and dividers", light: true },
  { name: "Ink soft", hex: "#5A4C3F", className: "bg-ink-soft", use: "Secondary text" },
  { name: "Ink", hex: "#261D15", className: "bg-ink", use: "Main text" },
];

const SIGNALS: Swatch[] = [
  { name: "Ember 500", hex: "#D9722A", className: "bg-ember-500", use: "The dot. The single accent." },
  { name: "Ember 600", hex: "#B4571A", className: "bg-ember-600", use: "Buttons for the next step" },
  { name: "Moss 600", hex: "#2F6B4F", className: "bg-moss-600", use: "Done" },
  { name: "Amber 100", hex: "#FCEFCF", className: "bg-amber-100", use: "Needs attention, calmly", light: true },
  { name: "Amber 700", hex: "#8A5A06", className: "bg-amber-700", use: "Attention text" },
];

function Swatches({ title, note, items }: { title: string; note: string; items: Swatch[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-ink-soft">{note}</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {items.map((s) => (
          <li key={s.name} className="overflow-hidden rounded-xl border border-sand-200 bg-white">
            <div className={`${s.className} h-20 ${s.light ? "border-b border-sand-200" : ""}`} />
            <div className="p-3">
              <p className="font-semibold">{s.name}</p>
              <p className="font-mono text-xs text-ink-soft">{s.hex}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.use}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-sand-200 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-ember-700">{n}</p>
      <h2 className="mt-1 font-display text-3xl">{title}</h2>
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

export default function BrandPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20">
      <header className="py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-ember-700">
          Brand proposal for review
        </p>
        <h1 className="mt-2 font-display text-5xl">The look of Entri</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          A proposal for the logo, colours and type. Nothing here is final until Chuon approves it.
          The whole brand follows one idea from the video: the story moves from cold to warm, and a
          single warm dot marks the place to begin.
        </p>
      </header>

      <Section n="1" title="Logo">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex h-56 items-center justify-center rounded-2xl bg-night-950 text-paper">
            <EntriLogo size="lg" />
          </div>
          <div className="flex h-56 items-center justify-center rounded-2xl border border-sand-200 bg-paper text-ink">
            <EntriLogo size="lg" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="flex h-28 items-center justify-center rounded-xl bg-sand-100 text-ink">
              <EntriMark className="h-16 w-16" />
            </div>
            <h3 className="mt-3 font-semibold">The mark</h3>
            <p className="text-ink-soft">
              An open doorway with one warm dot inside. The doorway is the gate from the video. The
              dot is a person stepping through, and it is also the first dot in the network.
            </p>
          </div>
          <div>
            <div className="flex h-28 items-center justify-center rounded-xl bg-sand-100 text-ink">
              <EntriWordmark className="text-6xl" />
            </div>
            <h3 className="mt-3 font-semibold">The wordmark</h3>
            <p className="text-ink-soft">
              The name in lowercase, which reads as calm and approachable. The dot of the i is the
              same ember dot.
            </p>
          </div>
          <div>
            <div className="flex h-28 items-center justify-center gap-5 rounded-xl bg-sand-100 text-ink">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-night-950 text-paper">
                <EntriMark className="h-9 w-9" />
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-ink ring-1 ring-sand-200">
                <EntriMark className="h-9 w-9" />
              </span>
            </div>
            <h3 className="mt-3 font-semibold">App icon</h3>
            <p className="text-ink-soft">
              The mark alone works at small sizes, for the phone home screen and the browser tab.
            </p>
          </div>
        </div>
      </Section>

      <Section n="2" title="Colour">
        <Swatches
          title="Cold: the problem"
          note="Used for the gate, the loop and the scattered dots on the landing page, and for the demo bar."
          items={COLD}
        />
        <Swatches
          title="Warm: Entri"
          note="Used for everything inside the product. Paper and sand instead of white and grey, so the screens feel calm."
          items={WARM}
        />
        <Swatches
          title="Signals"
          note="Ember is the only accent, so the next step is always the brightest thing on the screen. Moss means done. Amber asks for attention without alarm. There is no red."
          items={SIGNALS}
        />
        <div className="overflow-hidden rounded-2xl">
          <div className="h-24 bg-gradient-to-r from-night-950 via-night-700 via-55% to-ember-400" />
          <p className="bg-sand-100 px-4 py-3 text-ink-soft">
            The turn. As the visitor scrolls the landing page, the background moves from night to
            warm light at the moment Entri appears.
          </p>
        </div>
      </Section>

      <Section n="3" title="Type">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm text-ink-soft">Headlines: Fraunces</p>
            <p className="mt-2 font-display text-5xl leading-tight">Where do I begin?</p>
            <p className="mt-3 text-ink-soft">
              A soft serif with some warmth and weight. It gives the story a human voice and keeps
              the product from feeling corporate.
            </p>
          </div>
          <div>
            <p className="text-sm text-ink-soft">Everything else: Atkinson Hyperlegible</p>
            <p className="mt-2 text-2xl">
              Your next step is to get a state ID. Bring your birth certificate and your release
              papers.
            </p>
            <p className="mt-3 text-ink-soft">
              Designed by the Braille Institute for people with low vision. Letters that often get
              confused, like I, l and 1, are easy to tell apart. That suits readers who find
              reading hard.
            </p>
          </div>
        </div>
      </Section>

      <Section n="4" title="In use">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-sand-100 p-5">
            <p className="mb-3 text-sm text-ink-soft">User side: one clear next step</p>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sand-200">
              <div className="flex items-center justify-between">
                <p className="text-ink-soft">Step 1 of 6</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1.5 text-sm font-semibold">
                  <Volume2 className="h-4 w-4" aria-hidden />
                  Read aloud
                </span>
              </div>
              <h3 className="mt-2 font-display text-3xl">Get a state ID</h3>
              <p className="mt-2 text-lg">Bring your birth certificate and your release papers.</p>
              <span className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-ember-600 px-5 py-3.5 text-lg font-semibold text-white">
                <Check className="h-5 w-5" aria-hidden />I did this
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-3 rounded-xl bg-moss-100 px-4 py-3 text-moss-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss-600 text-white">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-semibold">Done: a finished step</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-ink-soft ring-1 ring-sand-200">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-200">
                  <Lock className="h-4 w-4" aria-hidden />
                </span>
                Open a bank account. Unlocks after you get a phone.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-sand-100 p-5">
            <p className="mb-3 text-sm text-ink-soft">Caseworker side: AI drafts, a person decides</p>
            <div className="rounded-xl border-2 border-dashed border-sand-300 bg-white p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                AI-drafted. Needs your review.
              </span>
              <p className="mt-3 font-semibold">Draft plan for Marcus Bell</p>
              <p className="text-sm text-ink-soft">6 steps, starting with a state ID.</p>
              <div className="mt-4 flex gap-2 text-sm font-semibold">
                <span className="rounded-lg bg-ink px-3.5 py-2 text-paper">Approve</span>
                <span className="rounded-lg border border-sand-300 px-3.5 py-2">Edit</span>
                <span className="rounded-lg px-3.5 py-2 text-ink-soft">Dismiss</span>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-100 p-4">
              <p className="font-semibold text-amber-700">Needs attention</p>
              <p className="mt-1">
                Jamal hasn&apos;t checked in for 14 days and his housing step is overdue.
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-night-950 p-4 text-steel-100">
              <p className="text-sm text-steel-300">Landing page, problem section</p>
              <p className="mt-1 font-display text-2xl text-paper">Where do you sleep tonight?</p>
            </div>
          </div>
        </div>
      </Section>

      <Section n="5" title="Decisions for Chuon">
        <ol className="list-decimal space-y-2 pl-5 text-lg">
          <li>Does the doorway and dot work as the logo, or would you like other directions?</li>
          <li>Is ember (a warm orange) the right single accent, or should it lean more gold or more red-brown?</li>
          <li>Are a serif for headlines and Atkinson Hyperlegible for the product the right pairing?</li>
        </ol>
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-ember-700">
          Back to the start <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Section>
    </main>
  );
}
