"use client";

// Where a Devanagari font's headline stroke (the shirorekha) falls, measured in
// this browser. The bars Stories draws (the masthead's, the welcome's, the small
// headings') have to sit exactly on it, and a fixed fraction of the font size
// can't do that: browsers round the line box, the baseline and the stroke to
// whole pixels differently at every size. So the text is drawn on a canvas in
// the same font, the stroke's top edge and thickness are read off the pixels
// (to a fraction of a pixel, from its anti-aliased edges), and the bars are
// placed from the text's own baseline.

export type Headline = { above: number; thick: number }; // px: stroke top above the baseline, and thickness

const cache = new Map<string, Headline | null>();

export function headline(font: string, sample: string): Headline | null {
  const key = `${font}|${sample}`;
  if (cache.has(key)) return cache.get(key)!;
  const size = parseFloat(/([\d.]+)px/.exec(font)?.[1] ?? "0");
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!size || !ctx) return null;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(sample).width) + 8;
  const h = Math.ceil(size * 2);
  c.width = w;
  c.height = h;
  ctx.font = font; // resizing the canvas resets its state
  ctx.textBaseline = "alphabetic";
  const base = Math.round(size * 1.35);
  ctx.fillText(sample, 4, base);
  const px = ctx.getImageData(0, 0, w, h).data;
  const alpha = (x: number, y: number) => px[(y * w + x) * 4 + 3] / 255;

  // The stroke is the run of rows inked furthest across: rows within 85% of the most-inked one.
  const ink = Array.from({ length: h }, (_, y) => {
    let n = 0;
    for (let x = 0; x < w; x++) n += alpha(x, y) > 0.5 ? 1 : 0;
    return n;
  });
  const most = Math.max(...ink);
  const core = ink.flatMap((n, y) => (n >= most * 0.85 ? [y] : []));
  if (!core.length) return (cache.set(key, null), null);
  const first = core[0];
  const last = core[core.length - 1];
  // Its anti-aliased edges, read in the columns the stroke fully covers, give the fraction beyond.
  const cols = Array.from({ length: w }, (_, x) => x).filter((x) => alpha(x, first) > 0.9 && alpha(x, last) > 0.9);
  const edge = (y: number) => (cols.length && y >= 0 && y < h ? cols.reduce((s, x) => s + alpha(x, y), 0) / cols.length : 0);
  const top = first - edge(first - 1);
  const bottom = last + 1 + edge(last + 1);
  const out = { above: base - top, thick: bottom - top };
  cache.set(key, out);
  return out;
}

/** The CSS font of an element, for measuring with. */
export const fontOf = (el: Element) => {
  const cs = getComputedStyle(el);
  return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
};

/**
 * Call `place` once the font is loaded and, if `resize`, whenever the window
 * changes size (the masthead's size follows the window). Returns a cleanup.
 */
export function whenFont(el: Element, sample: string, place: () => void, resize = false) {
  let live = true;
  let raf = 0;
  const run = () => {
    if (live) place();
  };
  const font = fontOf(el);
  (document.fonts ? document.fonts.load(font, sample) : Promise.resolve()).then(run, run);
  document.fonts?.ready.then(run, run);
  const onResize = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(run);
  };
  if (resize) window.addEventListener("resize", onResize);
  return () => {
    live = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
  };
}
