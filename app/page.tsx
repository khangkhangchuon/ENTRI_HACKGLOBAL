import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ClipboardList,
  Compass,
  Footprints,
  MessageCircle,
  Network,
  Radar,
  Sparkles,
} from "lucide-react";
import { EntriLogo } from "@/components/brand/logo";
import { CountUp } from "@/components/landing/count-up";
import { Dots } from "@/components/landing/dots";
import { LoopDiagram } from "@/components/landing/loop-diagram";
import { PhotoRotator } from "@/components/landing/photo-rotator";

// Placeholder until Chuon supplies the real contact address.
const CONTACT_EMAIL = "hello@example.com";

const STATS = [
  {
    value: 453200,
    suffix: "",
    text: "people left state and federal prisons in the United States in 2023.",
    source: "Bureau of Justice Statistics, Prisoners in 2023",
    href: "https://bjs.ojp.gov/library/publications/prisoners-2023-statistical-tables",
  },
  {
    value: 71,
    suffix: "%",
    text: "of people released from state prison are arrested again within five years. That is about 7 in 10.",
    source: "Bureau of Justice Statistics, 2021",
    href: "https://bjs.ojp.gov/library/publications/recidivism-prisoners-released-34-states-2012-5-year-follow-period-2012-2017",
  },
  {
    value: 10,
    suffix: "×",
    text: "People who have been to prison are almost 10 times more likely to be homeless than the general public.",
    source: "Prison Policy Initiative, Nowhere to Go, 2018",
    href: "https://www.prisonpolicy.org/reports/housing.html",
  },
];

const FOR_PEOPLE = [
  {
    icon: Footprints,
    title: "One next step",
    text: "A short plan in order, starting with your ID. Each step says what to do, where to go and what to bring.",
  },
  {
    icon: Compass,
    title: "Find help",
    text: "Search every organization in the network for jobs, housing, health care, legal help, benefits and training.",
  },
  {
    icon: MessageCircle,
    title: "Ask Entri",
    text: "Ask a question in your own words at any hour. Answers come from verified sources, and legal questions go to a real person.",
  },
];

const FOR_ORGS = [
  {
    icon: ClipboardList,
    title: "Smart Intake",
    text: "Type your notes from the first meeting. Entri drafts a profile and a step plan for you to correct and approve.",
  },
  {
    icon: Radar,
    title: "Caseload Intelligence",
    text: "See which clients have gone quiet or fallen behind, so no one slips through the cracks.",
  },
  {
    icon: Network,
    title: "Gap Analysis and referrals",
    text: "See what your clients need that the network lacks, and refer a client to another organization.",
  },
];

function FeatureList({ items }: { items: typeof FOR_PEOPLE }) {
  return (
    <ul className="mt-6 space-y-5">
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ember-100 text-ember-700">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h4 className="text-lg font-semibold">{title}</h4>
            <p className="text-ink-soft">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function LandingPage() {
  return (
    // One long background that starts cool and grey and warms as you scroll.
    <main className="bg-[linear-gradient(to_bottom,#d9dee3_0%,#e2e5e8_18%,#eae9e7_40%,#f3eee6_58%,#fbf7f0_74%,#fbeedd_100%)] text-slate-ink">
      {/* 1. Hook */}
      <section className="mx-auto flex min-h-svh max-w-6xl flex-col px-5 pb-10 pt-6">
        <EntriLogo className="text-slate-ink grayscale" />
        <div className="flex max-w-4xl flex-1 flex-col justify-center py-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-soft">
            Prison reentry in New York City
          </p>
          <h1 className="mt-5 font-display text-3xl leading-snug sm:text-4xl md:text-[2.75rem] md:leading-[1.25]">
            Every year, hundreds of thousands of people walk out of prison and have to rebuild a
            life from almost nothing: a job, a place to live, an ID, a way to eat.
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-soft sm:text-2xl">
            The programs that help with all of that already exist. They&apos;re just scattered,
            and almost impossible to find.{" "}
            <strong className="font-semibold text-slate-ink">
              Entri is what we built to fix that.
            </strong>
          </p>
        </div>
        <a
          href="#numbers"
          className="inline-flex items-center gap-2 self-start text-slate-soft hover:text-slate-ink"
        >
          <ArrowDown className="h-5 w-5" aria-hidden />
          See the problem
        </a>
      </section>

      {/* 2. Statistics */}
      <section id="numbers" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-soft">
          The numbers
        </h2>
        <dl className="mt-8 grid gap-12 md:grid-cols-3 md:gap-8">
          {STATS.map((s) => (
            <div key={s.source} className="flex flex-col border-t-2 border-slate-ink/20 pt-6">
              <dt className="order-2 mt-3 text-lg text-slate-soft">{s.text}</dt>
              <dd className="order-1 font-display text-6xl leading-none sm:text-7xl">
                <CountUp value={s.value} suffix={s.suffix} />
              </dd>
              <p className="order-3 mt-4 text-sm text-slate-soft">
                Source:{" "}
                <a href={s.href} className="underline underline-offset-2 hover:text-slate-ink">
                  {s.source}
                </a>
              </p>
            </div>
          ))}
        </dl>
      </section>

      {/* 3. The problem, dissected */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-2xl font-display text-4xl sm:text-5xl">
          Why starting over is so hard
        </h2>
        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1fr_420px]">
          <div className="space-y-14">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl">
                Every need depends on another one
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-slate-soft">
                To rent a home, you need income. To get a job, you need an ID. To get an ID, you
                often need an address. Each step asks for something you don&apos;t have yet, so
                there is no clear place to begin.
              </p>
              <LoopDiagram className="mt-6 w-full max-w-md" />
            </div>
            <div>
              <h3 className="font-display text-2xl sm:text-3xl">
                Help exists, but it is scattered
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-slate-soft">
                New York City has housing programs, job training, legal aid and benefits offices.
                When that support is coordinated, it works.
              </p>
              <p className="mt-5 flex items-center gap-5 rounded-2xl bg-white/60 p-5">
                <CountUp
                  value={20}
                  suffix="%"
                  className="font-display text-5xl text-slate-ink sm:text-6xl"
                />
                <span className="text-slate-soft">
                  lower risk of rearrest with coordinated reentry support, in a randomized
                  Minnesota study.{" "}
                  <a
                    href="https://www.lrl.mn.gov/docs/2014/other/140531.pdf"
                    className="text-sm underline underline-offset-2 hover:text-slate-ink"
                  >
                    Source: Minnesota Department of Corrections, 2013
                  </a>
                </span>
              </p>
              <p className="mt-5 text-lg leading-relaxed text-slate-soft">
                Today these services sit in separate organizations that can&apos;t see each other.
                A returning citizen often never finds them. A housing nonprofit can&apos;t see
                which job or legal services exist for the same person. A caseworker with a large
                caseload can&apos;t easily tell who is falling behind.
              </p>
              <Dots className="mt-8 w-full max-w-lg" />
            </div>
          </div>
          <PhotoRotator className="lg:sticky lg:top-8" />
        </div>
      </section>

      {/* 4. The main problem */}
      <section className="mx-auto max-w-4xl px-5 py-28 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-soft">
          The real problem
        </p>
        <p className="mt-5 font-display text-4xl leading-tight sm:text-6xl">
          The help exists, but nothing connects it.
        </p>
      </section>

      {/* 5. Introducing Entri */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-ink">
        <div className="text-center">
          <Dots connected className="mx-auto w-full max-w-xl" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-ember-700">
            Meet Entri
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            One place that connects returning citizens, organizations and caseworkers
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-xl text-ink-soft">
            Entri makes the help that already exists visible, ordered and connected. It starts in
            New York City.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white/80 p-7 shadow-sm ring-1 ring-sand-200 sm:p-9">
            <h3 className="font-display text-3xl">For returning citizens</h3>
            <p className="mt-2 text-lg text-ink-soft">
              The loop becomes a straight path, with one place to begin.
            </p>
            <FeatureList items={FOR_PEOPLE} />
          </div>
          <div className="rounded-3xl bg-white/80 p-7 shadow-sm ring-1 ring-sand-200 sm:p-9">
            <h3 className="font-display text-3xl">For organizations and caseworkers</h3>
            <p className="mt-2 text-lg text-ink-soft">
              Less paperwork, a clear view of every client, and one shared network.
            </p>
            <FeatureList items={FOR_ORGS} />
          </div>
        </div>

        <p className="mx-auto mt-10 flex max-w-3xl items-start justify-center gap-3 text-center text-xl">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-ember-600" aria-hidden />
          <span>
            The software does the heavy work.{" "}
            <strong className="font-semibold">A person always makes the final decision.</strong>
          </span>
        </p>
      </section>

      {/* 6. Choose a demo */}
      <section id="demo" className="mx-auto max-w-6xl scroll-mt-8 px-5 pb-24 pt-16 text-ink">
        <h2 className="text-center font-display text-4xl sm:text-5xl">Try Entri yourself</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-xl text-ink-soft">
          Choose a side. You can switch to the other one at any time.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <DemoCard
            href="/app"
            eyebrow="For returning citizens"
            title="Try it as Marcus"
            text="Marcus came home last week. See his next step, search for help near him and ask Entri a question."
            points={["Your next step", "Find help", "Ask Entri"]}
            button="Open the returning citizen demo"
          />
          <DemoCard
            href="/admin"
            eyebrow="For organizations"
            title="Try it as Diane"
            text="Diane is a caseworker with 25 clients. Draft a plan from her intake notes and see who needs attention."
            points={["Smart Intake", "Caseload Intelligence", "Gap Analysis"]}
            button="Open the organization demo"
          />
        </div>
        <p className="mt-6 text-center text-ink-soft">
          Both demos use fictional people and data.
        </p>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-sand-300/70 text-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <EntriLogo />
            <p className="mt-4 max-w-sm font-display text-xl">
              Each of us is more than the worst thing we have ever done.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-5 inline-flex items-center gap-2 font-semibold text-ember-700 hover:underline"
            >
              Partner with us <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <div className="text-sm text-ink-soft">
            <h2 className="font-semibold text-ink">Sources</h2>
            <ul className="mt-3 space-y-2">
              {STATS.map((s) => (
                <li key={s.source}>
                  <a href={s.href} className="underline underline-offset-2">
                    {s.source}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="https://www.lrl.mn.gov/docs/2014/other/140531.pdf"
                  className="underline underline-offset-2"
                >
                  Minnesota Department of Corrections, MCORP evaluation, 2013
                </a>
              </li>
            </ul>
          </div>
          <div className="text-sm text-ink-soft">
            <h2 className="font-semibold text-ink">About this site</h2>
            <p className="mt-3">
              This is a demonstration. All people and data in the demos are fictional.
            </p>
            <p className="mt-2">Photos: Matt Collamer on Unsplash, iStock.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function DemoCard({
  href,
  eyebrow,
  title,
  text,
  points,
  button,
}: {
  href: string;
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  button: string;
}) {
  return (
    <div className="flex flex-col rounded-3xl bg-white p-7 shadow-md ring-1 ring-sand-200 sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-widest text-ember-700">{eyebrow}</p>
      <h3 className="mt-2 font-display text-4xl">{title}</h3>
      <p className="mt-3 text-lg text-ink-soft">{text}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {points.map((p) => (
          <li
            key={p}
            className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1.5 text-sm font-semibold"
          >
            <Check className="h-4 w-4 text-moss-600" aria-hidden />
            {p}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-ember-600 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-ember-700"
      >
        {button} <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>
    </div>
  );
}
