"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import clsx from "clsx";
import { EntriLogo } from "@/components/brand/logo";
import { useDemo } from "@/lib/demo/store";

type Persona = "diane" | "marcus";

const PERSONAS: { id: Persona; href: string; name: string; role: string }[] = [
  { id: "diane", href: "/admin", name: "Diane R.", role: "Caseworker" },
  { id: "marcus", href: "/app", name: "Marcus Bell", role: "Coming home" },
];

// The strip above both demos. It shows whose eyes the visitor is looking
// through, lets them switch sides, and resets the demo data.
export function DemoBar({ persona }: { persona: Persona }) {
  const resetDemo = useDemo((s) => s.resetDemo);

  return (
    <header className="bg-night-900 text-steel-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        <Link href="/" className="text-paper" aria-label="Entri home">
          <EntriLogo size="sm" />
        </Link>

        <nav aria-label="Choose a side of the demo" className="flex items-center gap-2">
          <span className="hidden text-sm text-steel-300 sm:inline">Viewing as</span>
          <div className="flex rounded-full bg-night-800 p-1">
            {PERSONAS.map((p) => (
              <Link
                key={p.id}
                href={p.href}
                aria-current={p.id === persona ? "page" : undefined}
                className={clsx(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  p.id === persona
                    ? "bg-paper font-semibold text-ink"
                    : "text-steel-100 hover:bg-night-700",
                )}
              >
                {p.name}
                <span
                  className={clsx(
                    "ml-1.5 hidden sm:inline",
                    p.id === persona ? "text-ink-soft" : "text-steel-300",
                  )}
                >
                  {p.role}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        <button
          type="button"
          onClick={resetDemo}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-night-700 px-3.5 py-1.5 text-sm text-steel-100 transition-colors hover:bg-night-800"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset demo
        </button>
      </div>
    </header>
  );
}

export function DemoFooter() {
  return (
    <footer className="mt-auto border-t border-sand-200 px-4 py-4 text-center text-sm text-ink-soft">
      Demo: all people and data are fictional.
    </footer>
  );
}
