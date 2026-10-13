// The hero's drifting constellation (HeroField.tsx) as plain drawing code. It runs
// in a worker on an OffscreenCanvas (field.worker.ts), so the page's main thread
// never draws or uploads a frame of it; where that isn't supported, it runs on
// the page itself, the same way.
export type FieldCanvas = HTMLCanvasElement | OffscreenCanvas;
type Node = { x: number; y: number; vx: number; vy: number; r: number; accent: boolean };

const NAVY = "0, 28, 85";
const SKY = "74, 168, 224";
const LINK = 130; // px: nodes closer than this get a line
const REACH = 170; // px: the cursor's pull radius

/** Nodes link up when close, and the cursor tugs nearby nodes toward it and wires itself into the network. */
export function createField(cv: FieldCanvas, still: boolean) {
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  let w = 0;
  let h = 0;
  let nodes: Node[] = [];
  const pointer = { x: -1e4, y: -1e4, active: false };

  const resize = (width: number, height: number, dpr: number) => {
    w = width;
    h = height;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(110, Math.round((w * h) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 1.8,
      accent: Math.random() < 0.18,
    }));
    if (still) draw();
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      if (!still) {
        // Gentle pull toward the cursor, then drift.
        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < REACH && d > 1) {
            n.vx += (dx / d) * 0.012;
            n.vy += (dy / d) * 0.012;
          }
        }
        n.vx *= 0.992;
        n.vy *= 0.992;
        // Keep a minimum drift so the field never freezes.
        if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.02;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
    }
    // Lines, grouped by strength into a few strokes (to the nearest 1%: the same
    // look as one stroke per line, at a fraction of the canvas calls).
    const L2 = LINK * LINK;
    const groups: number[][] = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= L2) continue;
        const k = Math.round((1 - Math.sqrt(d2) / LINK) * 16);
        if (k) (groups[k] ??= []).push(a.x, a.y, b.x, b.y);
      }
    }
    ctx.lineWidth = 1;
    groups.forEach((g, k) => {
      ctx.strokeStyle = `rgba(${NAVY}, ${k / 100})`;
      ctx.beginPath();
      for (let n = 0; n < g.length; n += 4) {
        ctx.moveTo(g[n], g[n + 1]);
        ctx.lineTo(g[n + 2], g[n + 3]);
      }
      ctx.stroke();
    });
    if (pointer.active) {
      for (const a of nodes) {
        const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (d >= REACH) continue;
        ctx.strokeStyle = `rgba(${SKY}, ${(1 - d / REACH) * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }
    // The nodes, in two fills (plain and accent).
    for (const accent of [false, true]) {
      ctx.fillStyle = accent ? `rgba(${SKY}, 0.9)` : `rgba(${NAVY}, 0.32)`;
      ctx.beginPath();
      for (const a of nodes) {
        if (a.accent !== accent) continue;
        ctx.moveTo(a.x + a.r, a.y);
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  };

  const point = (x: number, y: number, active: boolean) => {
    pointer.x = x;
    pointer.y = y;
    pointer.active = active;
  };

  return { resize, draw, point };
}
