"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Home,
  IdCard,
  Scale,
  Search,
} from "lucide-react";
import { inputClass } from "@/components/ui/field";
import { Screen } from "@/components/user/app-shell";
import { UserResourceCard } from "@/components/user/resource-card";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { CATEGORY_LABELS, type Category } from "@/lib/demo/types";

const TILES: { id: Category; icon: typeof Home }[] = [
  { id: "jobs", icon: Briefcase },
  { id: "housing", icon: Home },
  { id: "health", icon: HeartPulse },
  { id: "legal", icon: Scale },
  { id: "id-benefits", icon: IdCard },
  { id: "training", icon: GraduationCap },
];

export default function FindPage() {
  const me = useDemo(selectMainClient);
  const resources = useDemo((s) => s.resources);
  const organizations = useDemo((s) => s.organizations);
  const [category, setCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const searching = category !== null || q.length > 0;
  const results = resources
    .filter((r) => {
      if (category && r.category !== category) return false;
      if (!q) return true;
      const org = organizations.find((o) => o.id === r.orgId)?.name ?? "";
      return `${r.name} ${org} ${r.offers} ${r.borough} ${CATEGORY_LABELS[r.category]}`
        .toLowerCase()
        .includes(q);
    })
    // Places in the person's own borough come first.
    .sort((a, b) => Number(b.borough === me.borough) - Number(a.borough === me.borough));

  return (
    <Screen title="Find help" intro="Places across the whole network, in one list.">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft"
          aria-hidden
        />
        <input
          type="search"
          aria-label="Search for help"
          placeholder="Search, for example: warehouse"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputClass} py-3 pl-11 text-lg`}
        />
      </div>

      {!searching ? (
        <div className="mt-4 grid grid-cols-2 gap-3 @2xl:grid-cols-3">
          {TILES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className="flex flex-col items-start gap-3 rounded-2xl border border-sand-200 bg-white p-4 text-left font-semibold"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ember-100 text-ember-700">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              {CATEGORY_LABELS[id]}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setCategory(null);
                setQuery("");
              }}
              className="inline-flex items-center gap-1.5 font-semibold text-ember-700"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
              All kinds of help
            </button>
            <p className="text-[17px] text-ink-soft" aria-live="polite">
              {category ? `${CATEGORY_LABELS[category]}: ` : ""}
              {results.length} {results.length === 1 ? "place" : "places"}
            </p>
          </div>
          <div className="mt-3 grid gap-3 @2xl:grid-cols-2">
            {results.map((r) => (
              <UserResourceCard key={r.id} resource={r} />
            ))}
          </div>
          {results.length === 0 && (
            <p className="mt-6 text-ink-soft">
              Nothing matches that yet. Try a shorter word, or ask Entri in your own words.
            </p>
          )}
        </>
      )}
    </Screen>
  );
}
