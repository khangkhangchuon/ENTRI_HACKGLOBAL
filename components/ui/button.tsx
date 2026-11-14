import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "quiet";
type Size = "sm" | "md";

// One look for every button and button-like link.
export function buttonClass(variant: Variant = "secondary", size: Size = "md") {
  return clsx(
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-[15px]",
    variant === "primary" && "bg-ember-600 text-white hover:bg-ember-700",
    variant === "secondary" &&
      "border border-sand-300 bg-white text-ink hover:bg-sand-100",
    variant === "quiet" && "text-ember-700 hover:bg-ember-100",
  );
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button type={type} className={clsx(buttonClass(variant, size), className)} {...rest} />
  );
}
