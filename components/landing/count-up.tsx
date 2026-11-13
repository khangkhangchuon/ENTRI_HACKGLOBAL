"use client";

import { useEffect, useRef } from "react";

const format = (n: number) => Math.round(n).toLocaleString("en-US");

// Counts quickly from 0 to `value` the first time it scrolls into view.
// The real number is always in the page for screen readers, and it shows
// straight away for visitors who have reduced motion turned on.
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1500,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const visual = useRef<HTMLSpanElement>(null);
  const final = `${prefix}${format(value)}${suffix}`;

  useEffect(() => {
    const el = visual.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const show = (n: number) => {
      el.textContent = `${prefix}${format(n)}${suffix}`;
    };
    show(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // Ease out: fast at first, then settling on the final number.
          const eased = 1 - Math.pow(1 - t, 4);
          show(value * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      show(value);
    };
  }, [value, prefix, suffix, duration]);

  return (
    <span className={className}>
      <span ref={visual} aria-hidden className="tabular-nums">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
