import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EntriLogo } from "@/components/brand/logo";

// Holding page for Phase 0. The landing page replaces this in Phase 1.
const LINKS = [
  {
    href: "/brand",
    title: "Brand proposal",
    text: "The proposed logo, colours and type, ready for review.",
  },
  {
    href: "/admin",
    title: "Caseworker side, as Diane R.",
    text: "A placeholder that reads the shared demo data.",
  },
  {
    href: "/app",
    title: "The app for people coming home, as Marcus Bell",
    text: "A placeholder where Marcus can mark his first step done.",
  },
];

export default function HoldingPage() {
  return (
    <main className="flex flex-1 flex-col bg-night-950 text-steel-100">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
        <EntriLogo size="lg" className="text-paper" />
        <p className="mt-6 font-display text-3xl text-paper">Now, there is a place to begin.</p>
        <p className="mt-3 text-steel-300">
          Phase 0 foundation. The landing page will replace this screen in Phase 1.
        </p>
        <ul className="mt-10 space-y-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex items-center justify-between gap-4 rounded-xl bg-night-800 px-5 py-4 transition-colors hover:bg-night-700"
              >
                <span>
                  <span className="block font-semibold text-paper">{l.title}</span>
                  <span className="block text-steel-300">{l.text}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-ember-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="px-4 py-4 text-center text-sm text-steel-300">
        Demo: all people and data are fictional.
      </p>
    </main>
  );
}
