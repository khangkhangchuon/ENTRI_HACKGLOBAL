"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Building2, User } from "lucide-react";
import { EntriMark } from "@/components/brand/logo";

// The turn of the page. Organizations and people start scattered and grey.
// As the visitor scrolls, the scene warms up, Entri appears in the middle,
// and a line draws from Entri to every organization and person.

type Node = { kind: "org" | "person"; x: number; y: number; label?: string };

// Positions are percentages of the scene's width and height.
const NODES: Node[] = [
  { kind: "org", x: 13, y: 20, label: "Housing" },
  { kind: "org", x: 86, y: 17, label: "Jobs" },
  { kind: "org", x: 90, y: 63, label: "Legal aid" },
  { kind: "org", x: 9, y: 66, label: "Health care" },
  { kind: "org", x: 71, y: 87, label: "Training" },
  { kind: "org", x: 28, y: 88, label: "ID and benefits" },
  { kind: "person", x: 31, y: 31 },
  { kind: "person", x: 68, y: 34 },
  { kind: "person", x: 20, y: 46 },
  { kind: "person", x: 80, y: 42 },
  { kind: "person", x: 37, y: 68 },
  { kind: "person", x: 63, y: 66 },
  { kind: "person", x: 50, y: 15 },
  { kind: "person", x: 50, y: 86 },
];

const GREY = "#8894a0";
const INK = "#261d15";
const EMBER = "#b4571a";

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

// A line that grows from Entri in the middle out to one organization or
// person.
function Link({
  node,
  grow,
  opacity,
}: {
  node: Node;
  grow: MotionValue<number>;
  opacity: MotionValue<number>;
}) {
  const x2 = useTransform(grow, (v) => 50 + (node.x - 50) * v);
  const y2 = useTransform(grow, (v) => 50 + (node.y - 50) * v);
  return (
    <motion.line
      x1="50"
      y1="50"
      x2={x2}
      y2={y2}
      stroke="#e68a45"
      strokeWidth="2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      style={{ opacity }}
    />
  );
}

function Scene({
  progress,
  isStatic,
}: {
  progress: MotionValue<number>;
  isStatic: boolean;
}) {
  // Each part of the story takes a slice of the scroll.
  const warmth = useTransform(progress, [0.28, 0.58], [0, 1]);
  const nodeOpacity = useTransform(progress, [0.28, 0.58], [0.6, 1]);
  const orgColor = useTransform(progress, [0.28, 0.58], [GREY, INK]);
  const personColor = useTransform(progress, [0.28, 0.58], [GREY, EMBER]);
  const tileColor = useTransform(progress, [0.28, 0.58], ["#dfe3e7", "#ffffff"]);
  const hubOpacity = useTransform(progress, [0.5, 0.62], [0, 1]);
  const hubScale = useTransform(progress, [0.5, 0.66], [0.6, 1]);
  const lines = useTransform(progress, [0.6, 0.88], [0, 1]);
  const lineOpacity = useTransform(progress, [0.6, 0.64], [0, 0.75]);
  const beforeOpacity = useTransform(progress, [0, 0.3, 0.45], [1, 1, 0]);
  const afterOpacity = useTransform(progress, [0.62, 0.78], [0, 1]);

  return (
    <div
      className={
        isStatic
          ? "relative overflow-hidden bg-[linear-gradient(to_bottom,#ccd3da_0%,#fbf7f0_30%)] py-20"
          : "sticky top-0 flex h-svh flex-col justify-center overflow-hidden bg-[#ccd3da]"
      }
    >
      {/* The warm light that comes up as you scroll. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-paper"
        style={{ opacity: isStatic ? 0 : warmth }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-5">
        <div className="relative mx-auto h-24 max-w-2xl text-center sm:h-20">
          <motion.p
            className="absolute inset-x-0 top-0 font-display text-2xl leading-snug text-dusk-900 sm:text-3xl"
            style={{ opacity: beforeOpacity }}
          >
            Organizations are built to help, and people need them, but the two rarely find each
            other.
          </motion.p>
          <motion.p
            className="absolute inset-x-0 top-0 font-display text-3xl text-ink sm:text-4xl"
            style={{ opacity: afterOpacity }}
          >
            Entri connects them.
          </motion.p>
        </div>

        <div className="relative mx-auto mt-6 aspect-[4/5] w-full max-w-4xl sm:aspect-[16/9]">
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {NODES.map((n) => (
              <Link key={`${n.x}-${n.y}`} node={n} grow={lines} opacity={lineOpacity} />
            ))}
          </svg>

          {NODES.map((n) => (
            <motion.div
              key={`${n.x}-${n.y}`}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                opacity: nodeOpacity,
                color: n.kind === "org" ? orgColor : personColor,
              }}
            >
              {n.kind === "org" ? (
                <>
                  <motion.span
                    className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm sm:h-14 sm:w-14"
                    style={{ backgroundColor: tileColor }}
                  >
                    <Building2 className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden />
                  </motion.span>
                  <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">
                    {n.label}
                  </span>
                </>
              ) : (
                <motion.span
                  className="flex h-9 w-9 items-center justify-center rounded-full shadow-sm sm:h-11 sm:w-11"
                  style={{ backgroundColor: tileColor }}
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </motion.span>
              )}
            </motion.div>
          ))}

          <motion.div
            className="absolute left-1/2 top-1/2 -ml-10 -mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-white text-ink shadow-[0_0_0_10px_rgba(230,138,69,0.18),0_10px_30px_rgba(180,87,26,0.25)] sm:-ml-12 sm:-mt-12 sm:h-24 sm:w-24"
            style={{ opacity: hubOpacity, scale: hubScale }}
          >
            <EntriMark className="h-10 w-10 sm:h-12 sm:w-12" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function ConnectScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const finished = useMotionValue(1);

  // Visitors who ask for reduced motion get the finished, connected picture
  // with no scrolling effect.
  const isStatic = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  return (
    <section
      ref={ref}
      className={isStatic ? "" : "h-[300vh]"}
      aria-label="Scattered organizations and people become one network when Entri connects them."
    >
      <Scene
        key={isStatic ? "static" : "scroll"}
        progress={isStatic ? finished : scrollYProgress}
        isStatic={isStatic}
      />
    </section>
  );
}
