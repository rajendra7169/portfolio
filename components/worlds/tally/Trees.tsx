// The forest's trees, drawn the way Tally draws them (src/components/Forest.jsx):
// round, pine and willow crowns, lighter when late, deeper with fireflies on
// overtime, smaller when you left early, and a stump for a day missed.
// Each tree is a <g class="tl-tree"> with no transform of its own, so GSAP can
// grow it from the ground; its position lives on the wrapping <g>.
import type { Kind, Shape } from "./forest";

const LEAF: Record<string, [string, string]> = {
  normal: ["#16a34a", "#15803d"],
  overtime: ["#15803d", "#166534"],
  late: ["#84cc16", "#65a30d"],
  early: ["#65a30d", "#4d7c0f"],
};

export function TreeArt({ kind, shape = "round" }: { kind: Kind; shape?: Shape }) {
  if (kind === "off") return null;
  if (kind === "absent")
    return (
      <>
        <ellipse cx="0" cy="2" rx="14" ry="3" fill="#92400e" opacity="0.3" />
        <rect x="-8" y="-6" width="16" height="8" rx="2" fill="#92400e" />
        <ellipse cx="0" cy="-6" rx="8" ry="2.5" fill="#b45309" />
        <circle cx="0" cy="-6" r="2" fill="#78350f" opacity="0.6" />
      </>
    );
  const [leaf, shade] = LEAF[kind];
  const flies = kind === "overtime" && (
    <g className="tl-flies">
      <circle cx="6" cy="-32" r="1.8" fill="#fef9c3" />
      <circle cx="-9" cy="-22" r="1.3" fill="#fde047" />
      <circle cx="10" cy="-14" r="1.1" fill="#fde047" />
    </g>
  );
  if (shape === "pine")
    return (
      <>
        <ellipse cx="0" cy="2" rx="14" ry="3" fill="#000" opacity="0.15" />
        <rect x="-2.5" y="-8" width="5" height="10" fill="#78350f" />
        <polygon points="0,-30 -14,-8 14,-8" fill={leaf} />
        <polygon points="0,-38 -10,-20 10,-20" fill={shade} />
        <polygon points="0,-44 -7,-30 7,-30" fill={leaf} />
        {flies}
      </>
    );
  if (shape === "willow")
    return (
      <>
        <ellipse cx="0" cy="2" rx="14" ry="3" fill="#000" opacity="0.15" />
        <rect x="-2" y="-6" width="4" height="8" fill="#78350f" />
        <ellipse cx="0" cy="-20" rx="16" ry="14" fill={leaf} />
        <ellipse cx="-6" cy="-14" rx="6" ry="9" fill={shade} opacity="0.6" />
        <ellipse cx="6" cy="-12" rx="5" ry="8" fill={shade} opacity="0.6" />
        {flies}
      </>
    );
  return (
    <>
      <ellipse cx="0" cy="2" rx="14" ry="3" fill="#000" opacity="0.15" />
      <rect x="-2.5" y="-10" width="5" height="12" fill="#78350f" />
      <circle cx="0" cy="-22" r="14" fill={leaf} />
      <circle cx="-8" cy="-16" r="7" fill={shade} opacity="0.8" />
      <circle cx="8" cy="-18" r="6" fill={shade} opacity="0.6" />
      <circle cx="0" cy="-28" r="5" fill={leaf} />
      {flies}
    </>
  );
}

/** A sapling: what a check-in plants before the day is done. */
export function Sapling() {
  return (
    <>
      <ellipse cx="0" cy="2" rx="9" ry="2.4" fill="#000" opacity="0.15" />
      <path d="M0,2 Q0.6,-7 0,-13" stroke="#15803d" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <ellipse cx="-3.4" cy="-9" rx="3.6" ry="1.8" fill="#22c55e" transform="rotate(-30 -3.4 -9)" />
      <ellipse cx="3.6" cy="-12" rx="3.6" ry="1.8" fill="#16a34a" transform="rotate(28 3.6 -12)" />
    </>
  );
}

export function Tree({ x, y, s, kind, shape, className, data }: { x: number; y: number; s: number; kind: Kind; shape?: Shape; className?: string; data?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={`tl-tree${className ? ` ${className}` : ""}`} data-day={data}>
        <TreeArt kind={kind} shape={shape} />
      </g>
    </g>
  );
}

/** A Himalayan skyline: jagged peaks with snow on the tallest. */
export function Range({ seed, w, h, peaks, rise, className }: { seed: number; w: number; h: number; peaks: number; rise: number; className: string }) {
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const pts: [number, number][] = [[0, h]];
  const step = w / peaks;
  for (let i = 0; i <= peaks; i++) {
    const x = i * step + (rnd() - 0.5) * step * 0.4;
    const top = h - rise * (0.45 + rnd() * 0.55);
    pts.push([x - step * 0.22, top + rise * (0.18 + rnd() * 0.2)], [x, top], [x + step * 0.18, top + rise * (0.1 + rnd() * 0.2)]);
  }
  pts.push([w, h]);
  const d = "M" + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L") + " Z";
  return <path className={className} d={d} />;
}
