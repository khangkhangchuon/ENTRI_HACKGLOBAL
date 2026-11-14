"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { inputClass } from "./field";

const iconButton =
  "rounded-md p-1.5 text-ink-soft hover:bg-sand-100 disabled:opacity-30 disabled:hover:bg-transparent";

export function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

// A short list of text lines that can be edited, reordered, removed and
// added to.
export function EditableList({
  label,
  items,
  onChange,
  addLabel = "Add",
  ordered,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  ordered?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold">{label}</legend>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {ordered && (
              <span className="w-5 shrink-0 text-center text-sm text-ink-soft">{i + 1}</span>
            )}
            <input
              aria-label={`${label}, line ${i + 1}`}
              className={inputClass}
              value={item}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            />
            {ordered && (
              <>
                <button
                  type="button"
                  className={iconButton}
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => onChange(move(items, i, i - 1))}
                >
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => onChange(move(items, i, i + 1))}
                >
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </button>
              </>
            )}
            <button
              type="button"
              className={iconButton}
              aria-label={`Remove line ${i + 1}`}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-1.5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-ember-700 hover:bg-ember-100"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {addLabel}
      </button>
    </fieldset>
  );
}
