// Builds every shape for the engine, in scroll order, yielding between them so
// the intro never waits on the later ones.
import { SHAPES } from "./layout";
import type { DustEngine } from "./engine";
import { cells, device, fromImage, globe, nepal, pinch, readPixels, scatter, tiles, type Shape, NAVY, ORANGE, SKY } from "./shapes";

const ILLUSTRATIONS = ["fullstack", "cloud", "design", "video"];

const idle = () =>
  new Promise<void>((r) => ("requestIdleCallback" in window ? (window as Window).requestIdleCallback(() => r(), { timeout: 400 }) : setTimeout(r, 1)));

/**
 * Builds the portrait first (it's needed for the intro), then the rest.
 * Resolves when the portrait is registered; the remaining shapes keep building.
 */
export async function buildShapes(engine: DustEngine): Promise<void> {
  const n = engine.N;
  engine.setShape(SHAPES.SCATTER, scatter(n, engine.layout.W / engine.layout.H));

  const heroPx = await readPixels("/images/hero-800.webp", 320);
  const portrait = fromImage(heroPx, n, { seed: 7, sparks: 0 });
  // Second palette: the cyber-suit version of the same pose, shifted 2.1% left
  //, for the press-and-hold flicker.
  let palAlt: Uint8Array | undefined;
  try {
    const cyber = await readPixels("/images/hero-cyber-800.webp", 320);
    palAlt = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const x = Math.min(cyber.w - 1, Math.max(0, Math.round((portrait.x[i] + 0.021) * cyber.w)));
      const y = Math.min(cyber.h - 1, Math.max(0, Math.round(portrait.y[i] * cyber.h)));
      const o = (y * cyber.w + x) * 4;
      const l = (0.2126 * cyber.data[o] + 0.7152 * cyber.data[o + 1] + 0.0722 * cyber.data[o + 2]) / 255;
      palAlt[i] = cyber.data[o + 3] < 40 ? portrait.pal[i] : l < 0.3 ? NAVY : l < 0.6 ? ORANGE : SKY;
    }
  } catch {
    palAlt = undefined;
  }
  engine.setShape(SHAPES.PORTRAIT, portrait, "static", { palAlt });

  // The rest, in scroll order, between idle periods.
  const later: (() => Promise<void> | void)[] = [
    () => engine.setShape(SHAPES.NEPAL, nepal(n)),
    () => engine.setShape(SHAPES.PHONE, device(n, "phone"), "eq"),
    () => engine.setShape(SHAPES.WINDOW, device(n, "window"), "eq"),
    () => engine.setShape(SHAPES.GLOBE, globe(n), "globe"),
    () => engine.setShape(SHAPES.PINCH, pinch(n)),
    async () => {
      const arts: Shape[] = [];
      for (const name of ILLUSTRATIONS) {
        const px = await readPixels(`/illustrations/${name}.svg`, 300);
        arts.push(fromImage(px, Math.round(n * 0.7), { seed: 50 + arts.length, sparks: 0, darkBias: 0.45 }));
      }
      arts.forEach((art, i) => engine.setShape(SHAPES.CELLS + i, cells(n, art, i)));
    },
    () => engine.setShape(SHAPES.TILES, tiles(n, 8, engine.phone ? 2 : 4, [0, 1, 2]), "tiles"),
    async () => {
      const px = await readPixels("/images/contact-800.webp", 320);
      engine.setShape(SHAPES.KURTA, fromImage(px, n, { seed: 9, sparks: 0, redIsOrange: true }));
    },
  ];
  (async () => {
    for (const step of later) {
      await idle();
      await step();
    }
  })();
}
