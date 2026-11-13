"use client";

import { motion, useReducedMotion } from "motion/react";

// The dots stand for the help that already exists. Scattered and grey in the
// problem. Connected and warm once Entri appears.
const POINTS: [number, number][] = [
  [40, 60], [120, 28], [205, 78], [300, 36], [385, 70], [470, 30], [545, 82],
  [78, 138], [170, 160], [262, 132], [350, 168], [440, 128], [520, 170],
];

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [0, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
  [1, 8], [2, 9], [3, 9], [4, 10], [4, 11], [6, 12], [2, 8], [5, 11],
];

export function Dots({
  connected = false,
  className,
}: {
  connected?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 585 200" className={className} aria-hidden>
      {connected
        ? LINKS.map(([a, b], i) => (
            <motion.line
              key={`${a}-${b}`}
              x1={POINTS[a][0]}
              y1={POINTS[a][1]}
              x2={POINTS[b][0]}
              y2={POINTS[b][1]}
              className="stroke-ember-400"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              viewport={{ once: true, amount: 0.6 }}
              // With reduced motion the lines appear at once.
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.9, delay: 0.2 + i * 0.07, ease: "easeOut" }
              }
            />
          ))
        : null}
      {POINTS.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={connected ? 7 : 6}
          className={connected ? "fill-ember-500" : "fill-steel-300"}
        />
      ))}
    </svg>
  );
}
