import clsx from "clsx";
import { useId } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const inputClass =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-ink placeholder:text-ink-soft/70";

function Label({ htmlFor, label, hint }: { htmlFor: string; label: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold">
      {label}
      {hint && <span className="ml-1.5 font-normal text-ink-soft">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  hint,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} hint={hint} />
      <input id={id} className={inputClass} {...rest} />
    </div>
  );
}

export function TextArea({
  label,
  hint,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} hint={hint} />
      <textarea id={id} className={clsx(inputClass, "leading-relaxed")} {...rest} />
    </div>
  );
}

export function SelectField({
  label,
  hint,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} hint={hint} />
      <select id={id} className={inputClass} {...rest}>
        {children}
      </select>
    </div>
  );
}
