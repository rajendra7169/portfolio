// The dust engine: one cloud of N particles that morphs between shapes.
// No React, no DOM reads per frame. `state` is a plain object so GSAP can tween
// its numbers directly (gsap.to(state, { t: 2 })). Shape index = integer part
// of state.t (see SHAPES in layout.ts); the fraction is the morph progress.

import { layout as makeLayout, SHAPES, type Layout, type Rect } from "./layout";
import { rng, type Shape, ORANGE } from "./shapes";

export const PALETTE = ["#001c55", "#2f7fc1", "#7cc8f0", "#a6dff7", "#f26b38"];
const CLUSTER_SIZE = 40;
const WIND_R = 110;

export type DustState = {
  /** shape index + morph fraction; GSAP tweens this */
  t: number;
  /** Blazify chip hover: blend toward this shape by hoverMix */
  tHover: number | null;
  hoverMix: number;
  /** idle wander amplitude multiplier */
  wander: number;
  /** scroll-velocity streak intensity 0..1 */
  streak: number;
  eqAmpLyric: number;
  eqAmpPlay: number;
  /** globe rotation */
  theta: number;
  dragVel: number;
  /** listener arcs 0..1 */
  arcs: number;
  zeroG: number;
  burst: { x: number; y: number; t0: number } | null;
  pointer: { x: number; y: number; on: boolean };
  /** Kathmandu connector: headline anchor (stage coords), draw fraction, stage offset */
  link: { x2: number; y2: number; p: number; stageY: number };
  tileScale: number[];
  /** cyber palette blend 0..1 (portrait only) */
  palMix: number;
};

type Kind = "static" | "eq" | "globe" | "tiles";

type Entry = {
  shape: Shape;
  kind: Kind;
  rect: Rect;
  tx: Float32Array;
  ty: Float32Array;
  pal: Uint8Array; // may differ from shape.pal (orange overrides)
  /** eq: screen box in px (bottom, height) */
  eq?: { sx: number; sy: number; sw: number; sh: number; bars: number };
  /** globe: unit vectors (with listener overrides) */
  globe?: { ux: Float32Array; uy: Float32Array; uz: Float32Array };
  /** optional second palette (cyber) */
  palAlt?: Uint8Array;
  /** phone crop: particles with ty below this are hidden */
  cropY?: number;
};

export class DustEngine {
  readonly N: number;
  readonly phone: boolean;
  state: DustState;
  layout: Layout;

  px: Float32Array;
  py: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  rnd: Float32Array;
  kSpring: Float32Array;
  wanderW: Float32Array;
  wanderP: Float32Array;
  /** ORANGE[0] = PIN, ORANGE[1..40] = CLUSTER (Kathmandu / listeners) */
  readonly ORANGE: Uint16Array;
  readonly PIN: number;
  isOrange: Uint8Array;

  private entries = new Map<number, Entry>();
  private waiters = new Map<number, (() => void)[]>();
  private pairKey = "";
  private delay: Float32Array;
  private delayMax = 0;
  private curTX: Float32Array;
  private curTY: Float32Array;
  private curPal: Uint8Array;
  private curSize: Float32Array;
  private gX: Float32Array;
  private gY: Float32Array;
  private gZ: Float32Array;
  private eqH = new Float32Array(10);
  private pinPos = { x: 0, y: 0 };
  private arcsDrawn = 0;
  private frames = 0;
  private slow = 0;
  private step = 1;
  private hidden: Uint8Array;
  private W = 0;
  private H = 0;
  private time = 0;

  constructor(opts: { n: number; phone: boolean; W: number; H: number }) {
    const N = (this.N = opts.n);
    this.phone = opts.phone;
    this.W = opts.W;
    this.H = opts.H;
    this.layout = makeLayout(opts.W, opts.H, opts.phone);
    this.state = {
      t: -1, tHover: null, hoverMix: 0, wander: 1, streak: 0, eqAmpLyric: 1, eqAmpPlay: 1, theta: 0, dragVel: 0,
      arcs: 0, zeroG: 0, burst: null, pointer: { x: -1e4, y: -1e4, on: false }, link: { x2: 0, y2: 0, p: 0, stageY: 0 },
      tileScale: [1, 1, 1, 1, 1, 1, 1, 1], palMix: 0,
    };
    const rand = rng(99);
    this.px = new Float32Array(N);
    this.py = new Float32Array(N);
    this.vx = new Float32Array(N);
    this.vy = new Float32Array(N);
    this.rnd = new Float32Array(N);
    this.kSpring = new Float32Array(N);
    this.wanderW = new Float32Array(N);
    this.wanderP = new Float32Array(N);
    this.delay = new Float32Array(N);
    this.curTX = new Float32Array(N);
    this.curTY = new Float32Array(N);
    this.curPal = new Uint8Array(N);
    this.curSize = new Float32Array(N);
    this.gX = new Float32Array(N);
    this.gY = new Float32Array(N);
    this.gZ = new Float32Array(N);
    this.hidden = new Uint8Array(N);
    this.isOrange = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      this.rnd[i] = rand();
      this.kSpring[i] = 0.085 * (0.7 + 0.3 * rand());
      this.wanderW[i] = 0.8 + rand() * 0.8;
      this.wanderP[i] = rand() * Math.PI * 2;
      this.px[i] = rand() * opts.W;
      this.py[i] = rand() * opts.H;
    }
    // Orange ids: a fixed, well-spread set. PIN first.
    const ids = new Set<number>();
    const r2 = rng(5);
    while (ids.size < 1 + CLUSTER_SIZE) ids.add(Math.floor(r2() * N));
    this.ORANGE = Uint16Array.from(ids);
    this.PIN = this.ORANGE[0];
    this.ORANGE.forEach((i) => (this.isOrange[i] = 1));
  }

  /* ── shapes ──────────────────────────────────────────────────────────── */

  has(index: number) {
    return this.entries.has(index);
  }

  whenReady(index: number): Promise<void> {
    if (this.entries.has(index)) return Promise.resolve();
    return new Promise((res) => {
      const list = this.waiters.get(index) ?? [];
      list.push(res);
      this.waiters.set(index, list);
    });
  }

  /**
   * Register a shape at an index. `kind` tells the frame loop how to treat it;
   * orange particles are re-targeted here for Nepal (Kathmandu) and the globe
   * (listeners), and shown as sparks on the portraits.
   */
  setShape(index: number, shape: Shape, kind: Kind = "static", opts: { palAlt?: Uint8Array } = {}) {
    if (shape.n !== this.N) throw new Error(`shape ${index} has ${shape.n} points, engine has ${this.N}`);
    const pal = new Uint8Array(shape.pal);
    const entry: Entry = { shape, kind, rect: { x: 0, y: 0, w: 0, h: 0 }, tx: new Float32Array(this.N), ty: new Float32Array(this.N), pal, palAlt: opts.palAlt };
    if (kind === "globe" && shape.extra) {
      const ux = new Float32Array(shape.extra.ux as Float32Array), uy = new Float32Array(shape.extra.uy as Float32Array), uz = new Float32Array(shape.extra.uz as Float32Array);
      // Kathmandu faces the viewer at θ = 0; listeners are hashed over populated latitudes.
      const r = rng(17);
      const place = (i: number, latDeg: number, lonDeg: number) => {
        const lat = (latDeg * Math.PI) / 180, lon = ((lonDeg - 85.32) * Math.PI) / 180;
        ux[i] = Math.cos(lat) * Math.sin(lon);
        uy[i] = Math.sin(lat);
        uz[i] = Math.cos(lat) * Math.cos(lon);
      };
      place(this.PIN, 27.71, 85.32);
      for (let k = 1; k < this.ORANGE.length; k++) place(this.ORANGE[k], 10 + r() * 45 * (r() < 0.2 ? -1 : 1), r() * 360);
      entry.globe = { ux, uy, uz };
    }
    if (index === SHAPES.PORTRAIT || index === SHAPES.KURTA || index === SHAPES.NEPAL || kind === "globe") {
      this.ORANGE.forEach((i) => (pal[i] = ORANGE));
    }
    this.entries.set(index, entry);
    this.place(index);
    this.pairKey = ""; // rebuild delays in case this pair is current
    const w = this.waiters.get(index);
    if (w) {
      this.waiters.delete(index);
      w.forEach((fn) => fn());
    }
  }

  /** Compute px targets for one shape from its unit coords and the layout. */
  private place(index: number) {
    const e = this.entries.get(index)!;
    const s = e.shape;
    const rect = (e.rect = this.layout.rect(index, s.aspect));
    for (let i = 0; i < this.N; i++) {
      e.tx[i] = rect.x + s.x[i] * rect.w;
      e.ty[i] = rect.y + s.y[i] * rect.h;
    }
    if (index === SHAPES.NEPAL) {
      // the orange particles gather on Kathmandu
      const k = (s as Shape & { kathmandu?: [number, number] }).kathmandu ?? [0.649, 0.668];
      const kx = rect.x + k[0] * rect.w, ky = rect.y + k[1] * rect.h;
      const r = rng(23);
      this.ORANGE.forEach((i, n) => {
        const a = r() * Math.PI * 2, d = n === 0 ? 0 : Math.sqrt(r()) * 6;
        e.tx[i] = kx + Math.cos(a) * d;
        e.ty[i] = ky + Math.sin(a) * d;
      });
    }
    if (e.kind === "eq") {
      const eq = (s as Shape & { eq?: { sx: number; sy: number; sw: number; sh: number; bars: number } }).eq!;
      e.eq = { sx: rect.x + eq.sx * rect.w, sy: rect.y + eq.sy * rect.h, sw: eq.sw * rect.w, sh: eq.sh * rect.h, bars: eq.bars };
    }
    // Phones: portraits are cut off at the stage bottom (their copy starts right below).
    e.cropY = this.phone && (index === SHAPES.PORTRAIT || index === SHAPES.KURTA) ? 0.42 * this.H : undefined;
  }

  resize(W: number, H: number) {
    this.W = W;
    this.H = H;
    this.layout = makeLayout(W, H, this.phone);
    for (const index of this.entries.keys()) this.place(index);
    this.pairKey = "";
  }

  /** Kathmandu in viewport px (Nepal layout), for DOM overlays. */
  kathmandu() {
    const e = this.entries.get(SHAPES.NEPAL);
    if (!e) return { x: 0, y: 0 };
    return { x: e.tx[this.PIN], y: e.ty[this.PIN] };
  }

  /* ── morph staggering ────────────────────────────────────────────────── */

  private buildDelays(A: number, B: number) {
    const lo = Math.min(A, B), hi = Math.max(A, B);
    const src = this.entries.get(lo)?.shape;
    const d = this.delay, N = this.N, rnd = this.rnd;
    let max = 0.35;
    const key = `${lo}>${hi}`;
    if (key === this.pairKey) return;
    this.pairKey = key;
    if (!src) {
      for (let i = 0; i < N; i++) d[i] = 0.35 * rnd[i];
    } else if (lo === SHAPES.SCATTER) {
      max = 0.55;
      for (let i = 0; i < N; i++) d[i] = 0.55 * rnd[i];
    } else if (lo === SHAPES.PORTRAIT && hi === SHAPES.NEPAL) {
      max = 0.57;
      for (let i = 0; i < N; i++) {
        const u = src.x[i], v = src.y[i];
        let dl = 0.42 * (1 - u) + (v < 0.36 ? 0.12 : 0);
        // the sunglasses let go last
        if (Math.hypot((u - 0.48) * src.aspect, v - 0.18) < 0.13) dl = Math.max(dl, 0.52) + 0.03 * rnd[i];
        d[i] = Math.min(dl, max);
      }
      d[this.PIN] = 0.55;
    } else if (lo === SHAPES.NEPAL && hi === SHAPES.PHONE) {
      for (let i = 0; i < N; i++) d[i] = 0.35 * (1 - src.y[i]);
    } else if (lo === SHAPES.PHONE && hi === SHAPES.WINDOW) {
      max = 0.3;
      for (let i = 0; i < N; i++) d[i] = 0.3 * rnd[i];
    } else if (lo === SHAPES.WINDOW && hi === SHAPES.GLOBE) {
      max = 0.45;
      const row = src.extra?.eqRow as Float32Array | undefined;
      for (let i = 0; i < N; i++) d[i] = row && row[i] >= 0 ? 0.35 * (1 - row[i]) : 0.1 + 0.35 * rnd[i];
    } else if (lo === SHAPES.GLOBE && hi === SHAPES.PINCH) {
      max = 0.3;
      const uy = src.extra?.uy as Float32Array | undefined;
      for (let i = 0; i < N; i++) d[i] = 0.3 * (uy ? Math.abs(uy[i]) : rnd[i]);
    } else if (lo === SHAPES.TILES && hi === SHAPES.KURTA) {
      max = 0.45;
      const tile = src.extra?.tile as Uint8Array | undefined;
      for (let i = 0; i < N; i++) d[i] = 0.05 * (tile ? tile[i] : 0) + 0.1 * rnd[i];
    } else if (lo === SHAPES.CELLS + 3 && hi === SHAPES.TILES) {
      max = 0.4;
      for (let i = 0; i < N; i++) d[i] = 0.4 * rnd[i];
    } else {
      for (let i = 0; i < N; i++) d[i] = 0.35 * rnd[i];
    }
    this.delayMax = max;
  }

  /* ── frame ───────────────────────────────────────────────────────────── */

  private targetsOf(e: Entry, i: number, out: { x: number; y: number }) {
    switch (e.kind) {
      case "globe":
        out.x = this.gX[i];
        out.y = this.gY[i];
        return;
      case "eq": {
        const row = e.shape.extra!.eqRow as Float32Array;
        if (row[i] >= 0) {
          const bar = (e.shape.extra!.eqBar as Uint8Array)[i];
          out.x = e.tx[i];
          out.y = e.eq!.sy + e.eq!.sh - row[i] * this.eqH[bar];
          return;
        }
        break;
      }
      case "tiles": {
        const k = (e.shape.extra!.tile as Uint8Array)[i];
        const sc = this.state.tileScale[k];
        if (sc !== 1) {
          const rects = this.layout.tiles();
          const r = rects[k];
          const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
          out.x = cx + (e.tx[i] - cx) * sc;
          out.y = cy + (e.ty[i] - cy) * sc;
          return;
        }
        break;
      }
    }
    out.x = e.tx[i];
    out.y = e.ty[i];
  }

  private tmpA = { x: 0, y: 0 };
  private tmpB = { x: 0, y: 0 };

  tick(timeSec: number, dtMs: number) {
    const st = this.state, N = this.N;
    this.time = timeSec;
    this.frames++;
    if (this.frames > 120 && this.step === 1) {
      this.slow = dtMs > 24 ? this.slow + 1 : 0;
      if (this.slow >= 3) this.step = 2;
    }

    let t = st.t;
    if (st.hoverMix > 0 && st.tHover !== null) t = t + (st.tHover - t) * st.hoverMix;
    let A = Math.floor(t);
    let f = t - A;
    let B = A + 1;
    if (f < 1e-4) {
      B = A;
      f = 0;
    }
    const gotA = this.entries.get(A), gotB = this.entries.get(B);
    // a shape that isn't built yet: hold whatever is
    if (!gotA && !gotB) return this.integrate(null, null, 0);
    const eA: Entry = gotA ?? gotB!;
    const eB: Entry = gotB ?? gotA!;
    if (!gotA) f = 1;
    if (!gotB) f = 0;
    if (A !== B) this.buildDelays(A, B);

    // per-frame dynamics shared by all particles
    if (eA.kind === "globe" || eB.kind === "globe") this.projectGlobe(eA.kind === "globe" ? eA : eB);
    if (eA.kind === "eq" || eB.kind === "eq") {
      const e = eA.kind === "eq" ? eA : eB;
      const amp = st.eqAmpLyric * st.eqAmpPlay;
      for (let b = 0; b < 10; b++) this.eqH[b] = e.eq!.sh * 0.92 * (0.35 + 0.65 * Math.abs(Math.sin(timeSec * 2 * Math.PI * (0.45 + 0.11 * b) + 1.7 * b))) * Math.min(amp, 1 / 0.92);
    }
    st.streak *= 0.9;
    st.theta += 0.004 + st.dragVel;
    st.dragVel *= 0.95;

    const morphing = A !== B && f > 0 && f < 1;
    const pinArc = A === SHAPES.PORTRAIT && B === SHAPES.NEPAL;
    const span = 1 - this.delayMax;
    const a = this.tmpA, b = this.tmpB;
    const cropA = eA.cropY ?? Infinity, cropB = eB.cropY ?? Infinity;
    for (let i = 0; i < N; i += this.step) {
      let fi = f;
      if (morphing) {
        const s = Math.min(1, Math.max(0, (f - this.delay[i]) / span));
        fi = s * s * (3 - 2 * s);
      }
      let tx: number, ty: number, pal: number, size: number;
      if (fi <= 0) {
        this.targetsOf(eA, i, a);
        tx = a.x;
        ty = a.y;
        pal = eA.pal[i];
        size = eA.shape.size[i];
      } else if (fi >= 1) {
        this.targetsOf(eB, i, b);
        tx = b.x;
        ty = b.y;
        pal = eB.pal[i];
        size = eB.shape.size[i];
      } else {
        this.targetsOf(eA, i, a);
        this.targetsOf(eB, i, b);
        tx = a.x + (b.x - a.x) * fi;
        ty = a.y + (b.y - a.y) * fi;
        pal = fi < 0.5 ? eA.pal[i] : eB.pal[i];
        size = eA.shape.size[i] + (eB.shape.size[i] - eA.shape.size[i]) * fi;
        if (pinArc && i === this.PIN) ty -= 120 * Math.sin(Math.PI * fi);
      }
      // globe depth colours and sizes
      const g = fi < 0.5 ? eA : eB;
      if (g.kind === "globe" && !this.isOrange[i]) {
        const z = this.gZ[i];
        pal = z > 0.25 ? 0 : z > -0.25 ? 2 : 3;
        size = 1.2 + 1.8 * ((z + 1) / 2);
      }
      if (eA.palAlt && st.palMix > 0 && this.rnd[i] < st.palMix && fi < 0.5) pal = eA.palAlt[i];
      this.curTX[i] = tx;
      this.curTY[i] = ty;
      this.curPal[i] = pal;
      this.curSize[i] = size;
      this.hidden[i] = (fi < 0.5 ? ty > cropA : ty > cropB) ? 1 : 0;
    }
    if (eA.kind === "globe" || eB.kind === "globe") {
      this.pinPos.x = this.gX[this.PIN];
      this.pinPos.y = this.gY[this.PIN];
    } else {
      this.pinPos.x = this.px[this.PIN];
      this.pinPos.y = this.py[this.PIN];
    }
    this.integrate(eA, eB, f);
  }

  private integrate(eA: Entry | null, eB: Entry | null, f: number) {
    const st = this.state, N = this.N, W = this.W, H = this.H;
    const wind = st.pointer.on;
    const px = st.pointer.x, py = st.pointer.y;
    const burst = st.burst;
    const now = performance.now();
    const ring = burst ? ((now - burst.t0) / 1000) * 900 : -1;
    if (burst && ring > Math.hypot(W, H)) st.burst = null;
    const pinSlow = eA && eB && eA !== eB && this.pairKey === `${SHAPES.PORTRAIT}>${SHAPES.NEPAL}`;
    for (let i = 0; i < N; i += this.step) {
      let vx = this.vx[i], vy = this.vy[i];
      const x = this.px[i], y = this.py[i];
      if (st.zeroG > 0) {
        vx *= 0.995;
        vy *= 0.995;
        if (x < 0 || x > W) vx *= -0.9;
        if (y < 0 || y > H) vy *= -0.9;
      } else if (eA) {
        const k = pinSlow && i === this.PIN ? 0.035 : this.kSpring[i];
        vx += (this.curTX[i] - x) * k;
        vy += (this.curTY[i] - y) * k;
      }
      if (wind) {
        const dx = x - px, dy = y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < WIND_R * WIND_R && d2 > 0.01) {
          const d = Math.sqrt(d2), q = 1 - d / WIND_R;
          const fz = (q * q * 2.2) / d;
          vx += dx * fz;
          vy += dy * fz;
        }
      }
      if (burst && ring >= 0) {
        const dx = x - burst.x, dy = y - burst.y;
        const d = Math.hypot(dx, dy);
        if (Math.abs(d - ring) < 24 && d > 0.5) {
          vx += (dx / d) * 6;
          vy += (dy / d) * 6;
        }
      }
      const damp = pinSlow && i === this.PIN ? 0.9 : 0.86;
      vx *= damp;
      vy *= damp;
      const sp = vx * vx + vy * vy;
      if (sp > 3600) {
        const m = 60 / Math.sqrt(sp);
        vx *= m;
        vy *= m;
      }
      this.vx[i] = vx;
      this.vy[i] = vy;
      this.px[i] = x + vx;
      this.py[i] = y + vy;
    }
    void f;
  }

  private projectGlobe(e: Entry) {
    const g = e.globe!, N = this.N;
    const { x: cx, y: cy, r: R } = this.layout.globe();
    const th = this.state.theta, cs = Math.cos(th), sn = Math.sin(th);
    const tilt = (23 * Math.PI) / 180, ct = Math.cos(tilt), stl = Math.sin(tilt);
    for (let i = 0; i < N; i++) {
      // rotate about Y, then tilt the axis in the screen plane
      const x1 = g.ux[i] * cs + g.uz[i] * sn, z1 = -g.ux[i] * sn + g.uz[i] * cs, y1 = g.uy[i];
      const x2 = x1 * ct - y1 * stl, y2 = x1 * stl + y1 * ct;
      this.gX[i] = cx + x2 * R;
      this.gY[i] = cy - y2 * R;
      this.gZ[i] = z1;
    }
  }

  /* ── draw ────────────────────────────────────────────────────────────── */

  draw(ctx: CanvasRenderingContext2D) {
    const N = this.N, st = this.state, time = this.time;
    ctx.clearRect(0, 0, this.W, this.H);
    const wander = 0.7 * st.wander;
    const pulse = 1 + 0.35 * Math.sin(2 * Math.PI * 0.8 * time);
    const lagPulse = 1 + 0.35 * Math.sin(2 * Math.PI * 0.8 * (time - 0.12));
    const t = st.t, A = Math.floor(t);
    const onGlobe = this.entries.get(A)?.kind === "globe" || this.entries.get(A + 1)?.kind === "globe";
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = PALETTE[c];
      for (let i = 0; i < N; i += this.step) {
        if (this.curPal[i] !== c || this.hidden[i]) continue;
        let s = this.curSize[i];
        if (this.isOrange[i]) s *= i === this.PIN ? 1.4 : onGlobe ? lagPulse : pulse;
        const wx = wander * Math.sin(time * this.wanderW[i] + this.wanderP[i]);
        const x = this.px[i] + wx, y = this.py[i] + wx * 0.6;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }
    // streaks: fast dust leaves a short trail
    const f = t - A;
    if (st.streak > 0.05 || (f > 0 && f < 1)) {
      for (let c = 0; c < 5; c++) {
        ctx.strokeStyle = PALETTE[c];
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < N; i += this.step) {
          if (this.curPal[i] !== c || this.hidden[i]) continue;
          const vx = this.vx[i], vy = this.vy[i];
          if (vx * vx + vy * vy < 2.25) continue;
          const x = this.px[i], y = this.py[i];
          ctx.moveTo(x - vx * 2.5, y - vy * 2.5);
          ctx.lineTo(x, y);
          any = true;
        }
        if (any) {
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }
    }
    this.drawLink(ctx);
    if (onGlobe && st.arcs > 0.01) this.drawArcs(ctx);
    else this.arcsDrawn = 0;
  }

  private drawLink(ctx: CanvasRenderingContext2D) {
    const { x2, y2, p, stageY } = this.state.link;
    if (p <= 0) return;
    const e = this.entries.get(SHAPES.NEPAL);
    if (!e) return;
    const t = this.state.t;
    if (t < SHAPES.NEPAL - 0.2 || t > SHAPES.NEPAL + 0.5) return;
    const sx = this.px[this.PIN], sy = this.py[this.PIN];
    const ex = x2, ey = y2 + stageY;
    const mx = ex + 36, my = sy;
    const pts = [[sx, sy], [mx, my], [ex, ey]];
    const lens = [Math.hypot(mx - sx, my - sy), Math.hypot(ex - mx, ey - my)];
    const total = lens[0] + lens[1];
    let left = p * total;
    ctx.strokeStyle = "rgba(0, 28, 85, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    for (let k = 0; k < 2 && left > 0; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
      const q = Math.min(1, left / lens[k]);
      ctx.lineTo(ax + (bx - ax) * q, ay + (by - ay) * q);
      left -= lens[k];
    }
    ctx.stroke();
    if (p > 0.02) {
      ctx.fillStyle = PALETTE[ORANGE];
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawArcs(ctx: CanvasRenderingContext2D) {
    const { x: cx, y: cy, r: R } = this.layout.globe();
    const px = this.gX[this.PIN], py = this.gY[this.PIN];
    let n = 0;
    ctx.lineWidth = 1;
    for (let k = 1; k < this.ORANGE.length; k++) {
      const i = this.ORANGE[k];
      const z = this.gZ[i];
      if (z < 0.05 || this.gZ[this.PIN] < -0.2) continue;
      const lx = this.gX[i], ly = this.gY[i];
      const mx = (lx + px) / 2, my = (ly + py) / 2;
      const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
      const qx = mx + (dx / d) * 0.22 * R, qy = my + (dy / d) * 0.22 * R;
      ctx.strokeStyle = `rgba(47, 127, 193, ${(0.35 * this.state.arcs * Math.min(1, z + 0.3)).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(qx, qy, px, py);
      ctx.stroke();
      n++;
    }
    this.arcsDrawn = n;
  }

  /* ── helpers for the DOM and the tests ───────────────────────────────── */

  pos(i: number) {
    return { x: this.px[i], y: this.py[i] };
  }

  settled() {
    let sum = 0, n = 0;
    for (let i = 0; i < this.N; i += 200) {
      sum += Math.hypot(this.px[i] - this.curTX[i], this.py[i] - this.curTY[i]);
      n++;
    }
    return sum / n < 1.5;
  }

  eqHeights() {
    return Array.from(this.eqH);
  }

  arcCount() {
    return this.arcsDrawn;
  }

  /** Nudge every particle a little (0g start). */
  kick(amount = 0.6) {
    for (let i = 0; i < this.N; i++) {
      this.vx[i] += (this.rnd[i] - 0.5) * amount * 2;
      this.vy[i] += (this.rnd[(i * 7) % this.N] - 0.5) * amount * 2;
    }
  }
}
