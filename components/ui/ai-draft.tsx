import clsx from "clsx";
import { Sparkles } from "lucide-react";

// The marker for anything the AI wrote. A dashed border and a label say
// that a person still has to review it.
export function AiChip({ label = "AI-drafted. Needs your review." }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-100 px-2.5 py-0.5 text-sm font-semibold text-ember-700">
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function AiDrafted({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border-2 border-dashed border-ember-400/70 bg-white p-5",
        className,
      )}
    >
      <AiChip label={label} />
      <div className="mt-3">{children}</div>
    </div>
  );
}
