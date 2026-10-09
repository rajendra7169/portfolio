// Shape samplers for the dust engine. Every sampler returns exactly `n` points
// in a unit box (x, y ∈ [0, 1], y down) plus a per-point size (px) and palette
// index, and every result is angle-sorted around its centroid — see sortByAngle.
// Samplers are pure apart from image loading; the engine lays shapes out in px.

import { NEPAL, KATHMANDU, NEPAL_ASPECT, projectNepal } from "./nepal";

/** Palette indices. The engine maps these to the site colours. */
export const NAVY = 0, BLUE = 1, SKY = 2, PALE = 3, ORANGE = 4;

export type Extra = Record<string, Float32Array | Uint8Array | Int32Array>;
export type Shape = {
  x: Float32Array;
  y: Float32Array;
  size: Float32Array;
  pal: Uint8Array;
  /** width ÷ height of the unit box, so layout can fit it without distortion */
  aspect: number;
  n: number;
  /** per-particle data the engine needs (EQ bar/row, globe vectors, tile id); permuted with the points */
  extra?: Extra;
};

/** Deterministic RNG so the same photo samples the same way on every resize. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function alloc(n: number, aspect: number): Shape {
  return { x: new Float32Array(n), y: new Float32Array(n), size: new Float32Array(n), pal: new Uint8Array(n), aspect, n };
}

/**
 * Reorder points by angle around the centroid (ties by radius). When every
 * shape is ordered the same way, point i of shape A and point i of shape B sit
 * at similar bearings, so a morph sweeps instead of criss-crossing.
 */
export function sortByAngle(s: Shape): Shape {
  let cx = 0, cy = 0;
  for (let i = 0; i < s.n; i++) {
    cx += s.x[i];
    cy += s.y[i] / s.aspect; // compare in isotropic space
  }
  cx /= s.n;
  cy /= s.n;
  const idx = Array.from({ length: s.n }, (_, i) => i);
  const key = new Float64Array(s.n);
  for (let i = 0; i < s.n; i++) {
    const dx = s.x[i] - cx, dy = s.y[i] / s.aspect - cy;
    // angle in [0, 2π), with a sliver of radius so concentric points stay stable
    key[i] = ((Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)) + Math.hypot(dx, dy) * 1e-3;
  }
  idx.sort((a, b) => key[a] - key[b]);
  const out = alloc(s.n, s.aspect);
  idx.forEach((from, to) => {
    out.x[to] = s.x[from];
    out.y[to] = s.y[from];
    out.size[to] = s.size[from];
    out.pal[to] = s.pal[from];
  });
  if (s.extra) {
    out.extra = {};
    for (const [k, arr] of Object.entries(s.extra)) {
      const copy = new (arr.constructor as new (n: number) => typeof arr)(arr.length);
      idx.forEach((from, to) => ((copy as Float32Array)[to] = (arr as Float32Array)[from]));
      out.extra[k] = copy;
    }
  }
  return out;
}

/** Load an image (same-origin SVG works too) and read back its pixels at a working width. */
export async function readPixels(src: string, width = 320): Promise<{ data: Uint8ClampedArray; w: number; h: number }> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();
  const w = width, h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * width));
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  return { data: ctx.getImageData(0, 0, w, h).data, w, h };
}

export type ImageOptions = {
  seed?: number;
  /** share of points that become orange sparks (0..1) */
  sparks?: number;
  /** treat strongly red pixels (a red kurta) as orange instead of by luminance */
  redIsOrange?: boolean;
  /** weight darker pixels more (halftone look) — 0 = uniform over alpha, 1 = strong */
  darkBias?: number;
};

/**
 * Halftone portrait: points land where the image is opaque, more often where it
 * is dark; dark pixels get bigger navy dots, light pixels small pale dots.
 */
export function fromImage(px: { data: Uint8ClampedArray; w: number; h: number }, n: number, opt: ImageOptions = {}): Shape {
  const { data, w, h } = px;
  const rand = rng(opt.seed ?? 7);
  const darkBias = opt.darkBias ?? 0.7;
  // Per-pixel weight = alpha × (1 − darkBias·luma). Build a cumulative table for O(log) sampling.
  const weights = new Float64Array(w * h);
  let total = 0;
  for (let i = 0; i < w * h; i++) {
    const a = data[i * 4 + 3] / 255;
    if (a < 0.2) continue;
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    total += weights[i] = a * (1 - darkBias * luma + 0.08);
  }
  const cdf = new Float64Array(w * h);
  let acc = 0;
  for (let i = 0; i < w * h; i++) cdf[i] = acc += weights[i];
  const s = alloc(n, w / h);
  for (let k = 0; k < n; k++) {
    // binary search the cdf
    const r = rand() * total;
    let lo = 0, hi = w * h - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    const i = lo;
    const pxX = i % w, pxY = (i / w) | 0;
    s.x[k] = (pxX + rand()) / w;
    s.y[k] = (pxY + rand()) / h;
    const R = data[i * 4], G = data[i * 4 + 1], B = data[i * 4 + 2];
    const luma = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
    s.size[k] = 1.3 + 2.4 * (1 - luma);
    if (opt.redIsOrange && R > 110 && R > G * 1.45 && R > B * 1.45) s.pal[k] = ORANGE;
    else s.pal[k] = luma < 0.32 ? NAVY : luma < 0.55 ? BLUE : luma < 0.76 ? SKY : PALE;
  }
  const sparks = opt.sparks ?? 0.01;
  for (let k = 0; k < n; k++) if (rand() < sparks) s.pal[k] = ORANGE;
  return sortByAngle(s);
}

function pointInPolygon(x: number, y: number, poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Nepal: filled with dots, denser along the border. The orange particles
 * (whatever indices carry ORANGE in the portrait) are placed by the engine, so
 * here every point is blue and the Kathmandu position is reported separately.
 */
export function nepal(n: number, seed = 11): Shape & { kathmandu: [number, number] } {
  const rand = rng(seed);
  const poly = NEPAL.map(projectNepal);
  const s = alloc(n, NEPAL_ASPECT);
  // perimeter, for the border band
  const seg: number[] = [];
  let per = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    seg.push(per += Math.hypot((b[0] - a[0]) * NEPAL_ASPECT, b[1] - a[1]));
  }
  const border = Math.round(n * 0.32);
  for (let k = 0; k < border; k++) {
    const t = rand() * per;
    let i = 0;
    while (seg[i] < t) i++;
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const f = (t - (i ? seg[i - 1] : 0)) / (seg[i] - (i ? seg[i - 1] : 0));
    const jx = (rand() - 0.5) * 0.012, jy = (rand() - 0.5) * 0.012 * NEPAL_ASPECT;
    s.x[k] = a[0] + (b[0] - a[0]) * f + jx;
    s.y[k] = a[1] + (b[1] - a[1]) * f + jy;
    s.size[k] = 2 + rand() * 1.4;
    s.pal[k] = rand() < 0.7 ? NAVY : BLUE;
  }
  let k = border;
  let guard = 0;
  while (k < n && guard++ < n * 40) {
    const x = rand(), y = rand();
    if (!pointInPolygon(x, y, poly)) continue;
    s.x[k] = x;
    s.y[k] = y;
    s.size[k] = 1.4 + rand() * 1.4;
    const r = rand();
    s.pal[k] = r < 0.18 ? BLUE : r < 0.6 ? SKY : PALE;
    k++;
  }
  const out = sortByAngle(s) as Shape & { kathmandu: [number, number] };
  out.kathmandu = projectNepal(KATHMANDU);
  return out;
}

/** Points along the outline of a rounded rectangle (unit box), jittered into a band. */
function roundedRectOutline(rand: () => number, count: number, s: Shape, from: number, rx: number, ry: number, inset = 0, band = 0.012) {
  // walk the perimeter in isotropic space: width = aspect, height = 1
  const A = s.aspect, w = A - inset * 2, h = 1 - inset * 2;
  const cr = Math.min(rx, w / 2, h / 2);
  const straight = 2 * (w - 2 * cr) + 2 * (h - 2 * cr), arcs = 2 * Math.PI * cr, per = straight + arcs;
  for (let k = 0; k < count; k++) {
    let t = rand() * per;
    let px = 0, py = 0;
    // top edge, right edge, bottom edge, left edge, with quarter arcs between
    const segs = [
      { len: w - 2 * cr, f: (u: number) => [cr + u, 0] },
      { len: (Math.PI / 2) * cr, f: (u: number) => [w - cr + cr * Math.sin(u / cr), cr - cr * Math.cos(u / cr)] },
      { len: h - 2 * cr, f: (u: number) => [w, cr + u] },
      { len: (Math.PI / 2) * cr, f: (u: number) => [w - cr + cr * Math.cos(u / cr), h - cr + cr * Math.sin(u / cr)] },
      { len: w - 2 * cr, f: (u: number) => [w - cr - u, h] },
      { len: (Math.PI / 2) * cr, f: (u: number) => [cr - cr * Math.sin(u / cr), h - cr + cr * Math.cos(u / cr)] },
      { len: h - 2 * cr, f: (u: number) => [0, h - cr - u] },
      { len: (Math.PI / 2) * cr, f: (u: number) => [cr - cr * Math.cos(u / cr), cr - cr * Math.sin(u / cr)] },
    ];
    for (const sg of segs) {
      if (t <= sg.len) {
        [px, py] = sg.f(t);
        break;
      }
      t -= sg.len;
    }
    const j = (rand() - 0.5) * band * 2;
    s.x[from + k] = (inset + px) / A + j / A;
    s.y[from + k] = inset + py + (rand() - 0.5) * band * 2;
    s.size[from + k] = 1.8 + rand() * 1.2 * ry;
    s.pal[from + k] = rand() < 0.75 ? NAVY : BLUE;
  }
}

export type EqLayout = {
  /** screen box in unit coords */
  sx: number; sy: number; sw: number; sh: number;
  bars: number;
  /** per EQ particle: bar index and row fraction (0 bottom … 1 top) */
  bar: Uint8Array; row: Float32Array; first: number; count: number;
};

/**
 * A device with a 10-band equalizer on its screen. `kind` picks the frame:
 * a tall phone or a wide desktop window (with a title bar and three dots).
 * The EQ particles' resting positions are their bar's full height; the engine
 * animates them with the eq() dynamic.
 */
export function device(n: number, kind: "phone" | "window", seed = 23): Shape & { eq: EqLayout } {
  const rand = rng(seed);
  const aspect = kind === "phone" ? 9 / 19 : 16 / 10.4;
  const s = alloc(n, aspect);
  const frame = Math.round(n * (kind === "phone" ? 0.46 : 0.42));
  roundedRectOutline(rand, frame, s, 0, kind === "phone" ? 0.11 : 0.05, 1);
  let at = frame;
  if (kind === "window") {
    // title bar line and the three dots
    const bar = Math.round(n * 0.06);
    for (let k = 0; k < bar; k++, at++) {
      s.x[at] = 0.02 + rand() * 0.96;
      s.y[at] = 0.085 + (rand() - 0.5) * 0.012;
      s.size[at] = 1.6;
      s.pal[at] = BLUE;
    }
    const dots = Math.round(n * 0.03);
    for (let k = 0; k < dots; k++, at++) {
      const d = k % 3, a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 0.014;
      s.x[at] = 0.05 + d * 0.035 + (Math.cos(a) * r) / aspect;
      s.y[at] = 0.042 + Math.sin(a) * r;
      s.size[at] = 2.2;
      s.pal[at] = [ORANGE, SKY, BLUE][d];
    }
  }
  // screen box (unit coords)
  const sx = kind === "phone" ? 0.1 : 0.08, sw = 1 - sx * 2;
  const sy = kind === "phone" ? 0.1 : 0.16, sh = kind === "phone" ? 0.8 : 0.74;
  const bars = 10, first = at, count = n - at;
  const bar = new Uint8Array(count), row = new Float32Array(count);
  for (let k = 0; k < count; k++, at++) {
    const b = k % bars, r = rand();
    bar[k] = b;
    row[k] = r;
    const bw = sw / bars;
    s.x[at] = sx + bw * (b + 0.18 + rand() * 0.64);
    // resting height = a medium bar, so the static (reduced-motion) frame still shows an EQ
    const hgt = 0.35 + 0.5 * Math.abs(Math.sin(b * 1.7 + 0.4));
    s.y[at] = sy + sh - sh * 0.92 * r * hgt - sh * 0.04;
    s.size[at] = 1.6 + r * 1.2;
    s.pal[at] = r > 0.72 ? SKY : r > 0.4 ? BLUE : NAVY;
  }
  // Non-EQ particles get row = −1 so the engine can tell them apart after sorting.
  const eqBar = new Uint8Array(n), eqRow = new Float32Array(n).fill(-1);
  for (let k = 0; k < count; k++) {
    eqBar[first + k] = bar[k];
    eqRow[first + k] = row[k];
  }
  s.extra = { eqBar, eqRow };
  const out = sortByAngle(s) as Shape & { eq: EqLayout };
  out.eq = { sx, sy, sw, sh, bars, bar, row, first, count };
  return out;
}

export type GlobeData = { ux: Float32Array; uy: Float32Array; uz: Float32Array };

/**
 * A dotted globe: points on latitude and longitude rings plus the poles, as
 * unit vectors. The engine rotates and projects them each frame (globe()).
 * Positions here are the θ = 0 projection, for the static frame.
 */
export function globe(n: number, seed = 31): Shape & { globe: GlobeData } {
  const rand = rng(seed);
  const s = alloc(n, 1);
  const ux = new Float32Array(n), uy = new Float32Array(n), uz = new Float32Array(n);
  const lats = 9, lons = 14;
  for (let k = 0; k < n; k++) {
    let lat: number, lon: number;
    if (rand() < 0.55) {
      // latitude ring: lat fixed, lon uniform
      lat = (((k % lats) + 1) / (lats + 1)) * Math.PI - Math.PI / 2;
      lon = rand() * Math.PI * 2;
    } else {
      // longitude ring: lon fixed, lat uniform (by area)
      lon = ((k % lons) / lons) * Math.PI * 2;
      lat = Math.asin(rand() * 2 - 1);
    }
    ux[k] = Math.cos(lat) * Math.sin(lon);
    uy[k] = Math.sin(lat);
    uz[k] = Math.cos(lat) * Math.cos(lon);
    s.x[k] = 0.5 + ux[k] * 0.48;
    s.y[k] = 0.5 - uy[k] * 0.48;
    s.size[k] = 1.2 + (uz[k] + 1) * 0.9;
    s.pal[k] = uz[k] > 0.35 ? NAVY : uz[k] > -0.2 ? BLUE : uz[k] > -0.6 ? SKY : PALE;
  }
  s.extra = { ux, uy, uz };
  const out = sortByAngle(s) as Shape & { globe: GlobeData };
  out.globe = { ux: out.extra!.ux as Float32Array, uy: out.extra!.uy as Float32Array, uz: out.extra!.uz as Float32Array };
  return out;
}

/** Mitosis keyframe: one big disc and one small disc, the moment before the cells separate. */
export function pinch(n: number, seed = 37): Shape {
  const rand = rng(seed);
  const A = 1.6;
  const s = alloc(n, A);
  const big = Math.round(n * 0.7);
  for (let k = 0; k < n; k++) {
    const inBig = k < big;
    const cx = inBig ? 0.66 * A : 0.955 * A, cy = inBig ? 0.5 : 0.42, r = inBig ? 0.24 : 0.11;
    const a = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * r;
    s.x[k] = (cx + Math.cos(a) * rr) / A;
    s.y[k] = cy + Math.sin(a) * rr;
    s.size[k] = 1.5 + rand() * 1.2;
    s.pal[k] = rr > r * 0.9 ? BLUE : rand() < 0.5 ? SKY : PALE;
  }
  return sortByAngle(s);
}

/**
 * The same `n` points shared between a large "active" silhouette and three
 * small discs, like one cell that has divided: `active` gets 70% of the dots.
 */
export function cells(n: number, active: Shape, others: number, activeIndex: number, seed = 41): Shape {
  const rand = rng(seed + activeIndex);
  const A = 1.6; // layout box aspect: big shape on the right, rail of discs on the left
  const s = alloc(n, A);
  const big = Math.round(n * 0.7);
  // big silhouette fills the right 72% of the box, fitted by its own aspect
  const boxW = 0.7 * A, boxH = 1, fitW = Math.min(boxW, boxH * active.aspect), fitH = fitW / active.aspect;
  const ox = A - 0.02 - fitW, oy = (1 - fitH) / 2;
  for (let k = 0; k < big; k++) {
    const i = Math.floor((k / big) * active.n);
    s.x[k] = (ox + active.x[i] * fitW) / A;
    s.y[k] = oy + active.y[i] * fitH;
    s.size[k] = active.size[i];
    s.pal[k] = active.pal[i];
  }
  const per = Math.floor((n - big) / others);
  for (let d = 0; d < others; d++) {
    const cy = 0.2 + (d / Math.max(1, others - 1)) * 0.6, cx = 0.16, r = 0.085;
    for (let k = 0; k < per; k++) {
      const idx = big + d * per + k;
      if (idx >= n) break;
      const a = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * r;
      s.x[idx] = (cx + Math.cos(a) * rr) / A;
      s.y[idx] = cy + Math.sin(a) * rr;
      s.size[idx] = 1.4 + rand() * 1.2;
      s.pal[idx] = rand() < 0.5 ? SKY : PALE;
    }
  }
  for (let idx = big + others * per; idx < n; idx++) {
    s.x[idx] = s.x[idx - 1];
    s.y[idx] = s.y[idx - 1];
    s.size[idx] = 1.4;
    s.pal[idx] = PALE;
  }
  return sortByAngle(s);
}

/** `count` rounded tiles in a grid (cols × rows), filled with dots; `accent` tiles are navy. */
export function tiles(n: number, count: number, cols: number, accent: number[], seed = 53): Shape {
  const rand = rng(seed);
  const rows = Math.ceil(count / cols);
  const A = (cols * 1.0 + (cols - 1) * 0.18) / (rows * 1.0 + (rows - 1) * 0.18);
  const s = alloc(n, A);
  const tw = 1 / (cols + (cols - 1) * 0.18), th = 1 / (rows + (rows - 1) * 0.18);
  const per = Math.floor(n / count);
  const tile = new Uint8Array(n);
  for (let t = 0; t < count; t++) {
    const c = t % cols, r = Math.floor(t / cols);
    const x0 = c * tw * 1.18, y0 = r * th * 1.18;
    const isAccent = accent.includes(t);
    for (let k = 0; k < per; k++) {
      const idx = t * per + k;
      // rounded by rejecting corners
      let px: number, py: number;
      do {
        px = rand();
        py = rand();
      } while (
        (px < 0.16 && py < 0.16 && Math.hypot(px - 0.16, py - 0.16) > 0.16) ||
        (px > 0.84 && py < 0.16 && Math.hypot(px - 0.84, py - 0.16) > 0.16) ||
        (px < 0.16 && py > 0.84 && Math.hypot(px - 0.16, py - 0.84) > 0.16) ||
        (px > 0.84 && py > 0.84 && Math.hypot(px - 0.84, py - 0.84) > 0.16)
      );
      s.x[idx] = x0 + px * tw;
      s.y[idx] = y0 + py * th;
      s.size[idx] = 1.6 + rand() * 1.1;
      s.pal[idx] = isAccent ? (rand() < 0.8 ? NAVY : BLUE) : rand() < 0.75 ? SKY : PALE;
      tile[idx] = t;
    }
  }
  for (let idx = count * per; idx < n; idx++) {
    s.x[idx] = s.x[idx - 1];
    s.y[idx] = s.y[idx - 1];
    s.size[idx] = 1.4;
    s.pal[idx] = PALE;
    tile[idx] = count - 1;
  }
  s.extra = { tile };
  return sortByAngle(s);
}

/** A scatter the width of the viewport, for the moment before the portrait forms. */
export function scatter(n: number, aspect: number, seed = 61): Shape {
  const rand = rng(seed);
  const s = alloc(n, aspect);
  for (let k = 0; k < n; k++) {
    s.x[k] = rand();
    s.y[k] = rand();
    s.size[k] = 1.2 + rand();
    s.pal[k] = rand() < 0.5 ? SKY : PALE;
  }
  return sortByAngle(s);
}
