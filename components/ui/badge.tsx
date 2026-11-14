import clsx from "clsx";

export type Tone = "neutral" | "moss" | "amber" | "ember" | "steel";

const TONES: Record<Tone, string> = {
  neutral: "bg-sand-100 text-ink-soft",
  moss: "bg-moss-100 text-moss-700",
  amber: "bg-amber-100 text-amber-700",
  ember: "bg-ember-100 text-ember-700",
  steel: "bg-steel-100 text-dusk-900",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
