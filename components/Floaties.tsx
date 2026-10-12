// In a file of its own, with no imports, so client components can use it
// without pulling in Bits' server-only icon sets (the whole Iconify catalogue).

/** Drifting plus signs and dots around an illustration, like the original education art. */
export function Floaties() {
  const bits = [
    { k: "+", x: 6, y: 12, c: "#55d6be" }, { k: "•", x: 48, y: 4, c: "#f4978e" }, { k: "+", x: 80, y: 10, c: "#55d6be" },
    { k: "✦", x: 22, y: 8, c: "#7b9ee8" }, { k: "+", x: 92, y: 52, c: "#55d6be" }, { k: "•", x: 84, y: 76, c: "#f4978e" },
    { k: "•", x: 64, y: 92, c: "#7b9ee8" }, { k: "+", x: 4, y: 84, c: "#55d6be" }, { k: "✦", x: 44, y: 96, c: "#7b9ee8" },
  ];
  return (
    <span className="floaties" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} className="floatie" style={{ left: `${b.x}%`, top: `${b.y}%`, color: b.c, animationDelay: `${i * -0.7}s` }}>
          {b.k}
        </span>
      ))}
    </span>
  );
}
