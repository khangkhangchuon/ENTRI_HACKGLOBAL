import clsx from "clsx";

// The mark: an open doorway with a single warm dot inside it.
// The doorway is the gate. The dot is the person, and the place to begin.
export function EntriMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={clsx("h-8 w-8", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M7.5 28.5V14a8.5 8.5 0 0 1 17 0v14.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="20" r="3.4" className="fill-ember-500" />
    </svg>
  );
}

// The wordmark: "entri" in lowercase, with the dot of the i in ember.
export function EntriWordmark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "font-display font-medium tracking-tight leading-none",
        className,
      )}
      aria-label="Entri"
      role="img"
    >
      <span aria-hidden>entr</span>
      <span aria-hidden className="relative inline-block">
        {"ı"}
        <span className="absolute left-1/2 top-[0.2em] h-[0.19em] w-[0.19em] -translate-x-1/2 rounded-full bg-ember-500" />
      </span>
    </span>
  );
}

export function EntriLogo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: { mark: "h-6 w-6", word: "text-2xl", gap: "gap-1.5" },
    md: { mark: "h-8 w-8", word: "text-3xl", gap: "gap-2" },
    lg: { mark: "h-14 w-14", word: "text-6xl", gap: "gap-3" },
  }[size];
  return (
    <span className={clsx("inline-flex items-center", sizes.gap, className)}>
      <EntriMark className={sizes.mark} />
      <EntriWordmark className={sizes.word} />
    </span>
  );
}
