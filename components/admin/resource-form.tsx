"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo/store";
import {
  BOROUGHS,
  CATEGORY_LABELS,
  CATEGORY_NEEDS,
  NEED_CHIPS,
  type Borough,
  type Category,
  type Need,
  type Resource,
} from "@/lib/demo/types";

// The standard form for one of the organization's own listings. The fields
// change a little with the type of resource.
export function ResourceForm({
  resource,
  onClose,
}: {
  resource?: Resource;
  onClose: () => void;
}) {
  const homeOrgId = useDemo((s) => s.homeOrgId);
  const addResource = useDemo((s) => s.addResource);
  const updateResource = useDemo((s) => s.updateResource);

  const [category, setCategory] = useState<Category>(resource?.category ?? "jobs");
  const [services, setServices] = useState<Need[]>(
    resource?.services ?? CATEGORY_NEEDS.jobs,
  );
  const [f, setF] = useState({
    name: resource?.name ?? "",
    borough: resource?.borough ?? ("Brooklyn" as Borough),
    address: resource?.address ?? "",
    offers: resource?.offers ?? "",
    eligibility: resource?.eligibility ?? "",
    howToApply: resource?.howToApply ?? "",
    contact: resource?.contact ?? "",
    hours: resource?.hours ?? "",
    payRange: resource?.payRange ?? "",
    housingType: resource?.housingType ?? "",
    capacity: resource?.capacity ?? "",
  });
  const [fairChance, setFairChance] = useState(resource?.fairChance ?? true);

  const set = (key: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }));
  const options = CATEGORY_NEEDS[category];

  const save = () => {
    const chosen = services.filter((s) => options.includes(s));
    const values: Omit<Resource, "id"> = {
      orgId: homeOrgId,
      name: f.name.trim(),
      category,
      services: chosen.length ? chosen : [options[0]],
      borough: f.borough,
      address: f.address.trim(),
      offers: f.offers.trim(),
      eligibility: f.eligibility.trim(),
      howToApply: f.howToApply.trim(),
      contact: f.contact.trim(),
      hours: f.hours.trim() || undefined,
      fairChance: category === "jobs" ? fairChance : undefined,
      payRange: category === "jobs" ? f.payRange.trim() || undefined : undefined,
      housingType: category === "housing" ? f.housingType.trim() || undefined : undefined,
      capacity: category === "housing" ? f.capacity.trim() || undefined : undefined,
    };
    if (resource) {
      updateResource(resource.id, values);
      toast("Listing updated");
    } else {
      addResource(values);
      toast("Listing added. It is live in the network and in Find help.");
    }
    onClose();
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Type of resource"
          value={category}
          onChange={(e) => {
            const next = e.target.value as Category;
            setCategory(next);
            setServices([CATEGORY_NEEDS[next][0]]);
          }}
        >
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Borough" value={f.borough} onChange={set("borough")}>
          {BOROUGHS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </SelectField>
      </div>

      {options.length > 1 && (
        <fieldset>
          <legend className="text-sm font-semibold">What it helps with</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {options.map((n) => (
              <label
                key={n}
                className="flex items-center gap-2 rounded-lg border border-sand-300 bg-white px-3 py-1.5"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-ember-600"
                  checked={services.includes(n)}
                  onChange={(e) =>
                    setServices(
                      e.target.checked ? [...services, n] : services.filter((s) => s !== n),
                    )
                  }
                />
                {NEED_CHIPS[n]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <TextField
        label="Name of the listing"
        value={f.name}
        onChange={set("name")}
        required
        maxLength={120}
      />
      <TextArea
        label="What it offers"
        rows={2}
        value={f.offers}
        onChange={set("offers")}
        required
        maxLength={400}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Address"
          hint="Street and cross street"
          value={f.address}
          onChange={set("address")}
          required
          maxLength={120}
        />
        <TextField
          label="Contact"
          value={f.contact}
          onChange={set("contact")}
          required
          maxLength={120}
        />
        <TextField
          label="Who it is for"
          value={f.eligibility}
          onChange={set("eligibility")}
          required
          maxLength={300}
        />
        <TextField
          label="How to apply"
          value={f.howToApply}
          onChange={set("howToApply")}
          required
          maxLength={300}
        />
        <TextField
          label="Hours"
          hint="Optional"
          value={f.hours}
          onChange={set("hours")}
          maxLength={120}
        />
        {category === "jobs" && (
          <TextField
            label="Pay range"
            hint="Optional"
            value={f.payRange}
            onChange={set("payRange")}
            maxLength={80}
          />
        )}
        {category === "housing" && (
          <>
            <TextField
              label="Type of housing"
              hint="Optional"
              value={f.housingType}
              onChange={set("housingType")}
              maxLength={80}
            />
            <TextField
              label="Capacity"
              hint="Optional"
              value={f.capacity}
              onChange={set("capacity")}
              maxLength={80}
            />
          </>
        )}
      </div>

      {category === "jobs" && (
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            className="h-4 w-4 accent-ember-600"
            checked={fairChance}
            onChange={(e) => setFairChance(e.target.checked)}
          />
          Fair-chance employer. Skills are considered before a record.
        </label>
      )}

      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">
          {resource ? "Save changes" : "Add listing"}
        </Button>
      </div>
    </form>
  );
}
