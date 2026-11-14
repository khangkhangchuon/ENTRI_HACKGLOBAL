import { Clock, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Organization, type Resource } from "@/lib/demo/types";

export function TierBadge({ org }: { org?: Organization }) {
  if (!org) return null;
  return org.tier === "partner" ? (
    <Badge tone="ember">Partner</Badge>
  ) : (
    <Badge>{org.publicInfo ? "Listed, public information" : "Listed"}</Badge>
  );
}

// One resource in the network, as the caseworker sees it.
export function ResourceCard({
  resource,
  org,
  children,
}: {
  resource: Resource;
  org?: Organization;
  children?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-sand-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="steel">{CATEGORY_LABELS[resource.category]}</Badge>
        <TierBadge org={org} />
        {resource.fairChance && <Badge tone="moss">Fair-chance employer</Badge>}
      </div>
      <h3 className="mt-2 text-lg font-semibold leading-snug">{resource.name}</h3>
      <p className="text-sm text-ink-soft">{org?.name}</p>
      <p className="mt-2 text-[15px]">{resource.offers}</p>
      <dl className="mt-3 space-y-1 text-sm text-ink-soft">
        <div className="flex gap-2">
          <dt>
            <MapPin className="mt-0.5 h-4 w-4" aria-label="Address" />
          </dt>
          <dd>
            {resource.address}, {resource.borough}
          </dd>
        </div>
        {resource.hours && (
          <div className="flex gap-2">
            <dt>
              <Clock className="mt-0.5 h-4 w-4" aria-label="Hours" />
            </dt>
            <dd>{resource.hours}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt>
            <Phone className="mt-0.5 h-4 w-4" aria-label="Contact" />
          </dt>
          <dd>{resource.contact}</dd>
        </div>
      </dl>
      {(resource.payRange || resource.housingType || resource.capacity) && (
        <p className="mt-2 text-sm text-ink-soft">
          {[resource.payRange, resource.housingType, resource.capacity].filter(Boolean).join(". ")}
        </p>
      )}
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-semibold text-ember-700">
          Who it is for and how to apply
        </summary>
        <p className="mt-1.5 text-ink-soft">
          <span className="font-semibold text-ink">Who it is for:</span> {resource.eligibility}
        </p>
        <p className="mt-1 text-ink-soft">
          <span className="font-semibold text-ink">How to apply:</span> {resource.howToApply}
        </p>
      </details>
      {children && <div className="mt-auto flex flex-wrap gap-2 pt-4">{children}</div>}
    </article>
  );
}
