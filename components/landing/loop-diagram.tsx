// The loop: each need depends on another one, so there is no clear place
// to begin. Drawn as three needs on a closed circle.
const CX = 230;
const CY = 170;
const R = 108;

const point = (deg: number, r = R) => {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
};

const NODES = [
  { label: "A home", deg: -90 },
  { label: "A job", deg: 30 },
  { label: "An ID", deg: 150 },
];

const ARROWS = [
  { deg: -30, label: "needs income", x: 348, y: 100, anchor: "start" as const },
  { deg: 90, label: "needs an ID", x: CX, y: 318, anchor: "middle" as const },
  { deg: 210, label: "needs an address", x: 112, y: 100, anchor: "end" as const },
];

export function LoopDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-20 0 500 335"
      className={className}
      role="img"
      aria-label="A loop with no starting point. A home needs income, so it needs a job. A job needs an ID. An ID needs an address, so it needs a home."
    >
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        className="stroke-steel-500"
        strokeWidth="2.5"
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
      {ARROWS.map((a) => {
        const p = point(a.deg);
        return (
          <g key={a.label}>
            <polygon
              points="-8,-7 8,0 -8,7"
              transform={`translate(${p.x} ${p.y}) rotate(${a.deg + 90})`}
              className="fill-steel-500"
            />
            <text
              x={a.x}
              y={a.y}
              textAnchor={a.anchor}
              className="fill-dusk-600 text-[15px] italic"
            >
              {a.label}
            </text>
          </g>
        );
      })}
      {NODES.map((n) => {
        const p = point(n.deg);
        return (
          <g key={n.label}>
            <circle cx={p.x} cy={p.y} r="42" className="fill-white stroke-steel-500" strokeWidth="2" />
            <text
              x={p.x}
              y={p.y + 6}
              textAnchor="middle"
              className="fill-dusk-900 font-display text-[19px]"
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
