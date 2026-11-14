"use client";

import {
  Bookmark,
  BookmarkCheck,
  Clock,
  MapPin,
  Phone,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { CATEGORY_LABELS, onCaseload, type Resource } from "@/lib/demo/types";

// A place that can help, as the person using Entri sees it.
export function UserResourceCard({ resource }: { resource: Resource }) {
  const me = useDemo(selectMainClient);
  const org = useDemo((s) =>
    s.organizations.find((o) => o.id === resource.orgId),
  );
  const saved = useDemo((s) => s.savedResourceIds.includes(resource.id));
  const toggleSaved = useDemo((s) => s.toggleSaved);
  const tellCaseworker = useDemo((s) => s.tellCaseworker);
  const caseworker = useDemo((s) => s.caseworker);
  // Only someone who has a caseworker can pass a place on to them.
  const connected = onCaseload(me);

  return (
    <article className="rounded-2xl border border-sand-200 bg-white p-4">
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="steel">{CATEGORY_LABELS[resource.category]}</Badge>
        {resource.fairChance && <Badge tone="moss">Fair-chance employer</Badge>}
      </div>
      <h3 className="mt-2 text-xl font-semibold leading-snug">
        {resource.name}
      </h3>
      <p className="text-[15px] text-ink-soft">{org?.name}</p>
      <p className="mt-2">{resource.offers}</p>
      <ul className="mt-3 space-y-1.5 text-[17px] text-ink-soft">
        <li className="flex gap-2">
          <MapPin className="mt-1 h-5 w-5 shrink-0" aria-hidden />
          {resource.address}, {resource.borough}
        </li>
        {resource.hours && (
          <li className="flex gap-2">
            <Clock className="mt-1 h-5 w-5 shrink-0" aria-hidden />
            {resource.hours}
          </li>
        )}
        <li className="flex gap-2">
          <Phone className="mt-1 h-5 w-5 shrink-0" aria-hidden />
          {resource.contact}
        </li>
      </ul>
      {resource.payRange && (
        <p className="mt-2 text-[17px]">Pay: {resource.payRange}</p>
      )}
      <p className="mt-3 rounded-xl bg-sand-100 p-3 text-[17px]">
        <span className="font-semibold">How to start:</span>{" "}
        {resource.howToApply}
      </p>
      <div className={`mt-3 grid gap-2 ${connected ? "grid-cols-2" : ""}`}>
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => toggleSaved(resource.id)}
          className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-sand-300 bg-white px-3 py-2.5 text-[17px] font-semibold"
        >
          {saved ? (
            <BookmarkCheck className="h-5 w-5 text-moss-600" aria-hidden />
          ) : (
            <Bookmark className="h-5 w-5" aria-hidden />
          )}
          {saved ? "Saved" : "Save"}
        </button>
        {connected && (
          <button
            type="button"
            onClick={() => {
              tellCaseworker(me.id, resource.id);
              toast(`${caseworker.firstName} will see that you are interested`);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-sand-300 bg-white px-3 py-2.5 text-[17px] font-semibold"
          >
            <UserRoundCheck className="h-5 w-5" aria-hidden />
            Tell {caseworker.firstName}
          </button>
        )}
      </div>
    </article>
  );
}
