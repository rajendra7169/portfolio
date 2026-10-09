// Where each dust shape sits in the viewport. A pure function of the viewport,
// shared by the engine (particle targets) and the DOM overlays (hit areas,
// tiles, rail buttons), so both always agree.

export type Rect = { x: number; y: number; w: number; h: number };

export const SHAPES = {
  SCATTER: -1, PORTRAIT: 0, NEPAL: 1, PHONE: 2, WINDOW: 3, GLOBE: 4, PINCH: 5,
  CELLS: 6, // 6..9
  TILES: 10, KURTA: 11,
} as const;

/** Largest rect of the given aspect (w/h) inside `box`, placed by `ax, ay` (0 = start, 1 = end). */
export function fit(box: Rect, aspect: number, ax = 0.5, ay = 0.5): Rect {
  let w = box.w, h = w / aspect;
  if (h > box.h) {
    h = box.h;
    w = h * aspect;
  }
  return { x: box.x + (box.w - w) * ax, y: box.y + (box.h - h) * ay, w, h };
}

export type Layout = {
  W: number;
  H: number;
  phone: boolean;
  /** rect for a shape index given its aspect (cells and kurta use their own) */
  rect: (shape: number, aspect: number) => Rect;
  /** eight tile rects, in project order */
  tiles: () => Rect[];
  /** the three inactive-cell rail discs: centre + radius, in skill order (desktop only) */
  rail: () => { x: number; y: number; r: number }[];
  /** globe centre + radius */
  globe: () => { x: number; y: number; r: number };
};

export function layout(W: number, H: number, phone: boolean): Layout {
  // Phones: every shape lives in the top 42% so copy (which starts at 46svh) never meets dust.
  const stage: Rect = phone ? { x: 0.06 * W, y: 0.1 * H, w: 0.88 * W, h: 0.32 * H } : { x: 0, y: 0, w: W, h: H };

  const rect = (shape: number, aspect: number): Rect => {
    if (phone) {
      // portraits fit by width and are cropped by the engine at the stage bottom
      if (shape === SHAPES.PORTRAIT || shape === SHAPES.KURTA) {
        const w = stage.w * 0.72, h = w / aspect;
        return { x: stage.x + (stage.w - w) / 2, y: stage.y, w, h };
      }
      return fit(stage, aspect);
    }
    switch (shape) {
      case SHAPES.SCATTER:
        return { x: 0, y: 0, w: W, h: H };
      case SHAPES.PORTRAIT:
        return fit({ x: 0.5 * W, y: 0.06 * H, w: 0.46 * W, h: 0.94 * H }, aspect, 0.5, 1);
      case SHAPES.NEPAL:
        return fit({ x: 0.44 * W, y: 0.24 * H, w: 0.52 * W, h: 0.56 * H }, aspect);
      case SHAPES.PHONE: {
        const h = 0.74 * H, w = h * aspect;
        return { x: 0.72 * W - w / 2, y: 0.53 * H - h / 2, w, h };
      }
      case SHAPES.WINDOW: {
        const w = Math.min(0.46 * W, 0.74 * H * 1.6), h = w / aspect;
        return { x: 0.71 * W - w / 2, y: 0.53 * H - h / 2, w, h };
      }
      case SHAPES.GLOBE: {
        const r = 0.33 * H;
        return { x: 0.71 * W - r, y: 0.51 * H - r, w: 2 * r, h: 2 * r };
      }
      case SHAPES.PINCH:
        return fit({ x: 0.42 * W, y: 0.18 * H, w: 0.56 * W, h: 0.68 * H }, aspect, 1);
      case SHAPES.TILES:
        return fit({ x: 0.5 * W, y: 0.26 * H, w: 0.46 * W, h: 0.54 * H }, aspect, 0.5, 0);
      case SHAPES.KURTA:
        return fit({ x: 0.5 * W, y: 0.04 * H, w: 0.46 * W, h: 0.96 * H }, aspect, 0.5, 1);
      default:
        // CELLS_0..3: the composed layout box (big silhouette right, discs on the rail)
        return fit({ x: 0.42 * W, y: 0.18 * H, w: 0.56 * W, h: 0.68 * H }, aspect, 1);
    }
  };

  const tiles = (): Rect[] => {
    const cols = phone ? 2 : 4, rows = phone ? 4 : 2;
    const box = rect(SHAPES.TILES, (cols + (cols - 1) * 0.18) / (rows + (rows - 1) * 0.18));
    const tw = box.w / (cols + (cols - 1) * 0.18), th = box.h / (rows + (rows - 1) * 0.18);
    return Array.from({ length: 8 }, (_, t) => ({
      x: box.x + (t % cols) * tw * 1.18,
      y: box.y + Math.floor(t / cols) * th * 1.18,
      w: tw,
      h: th,
    }));
  };

  const rail = () => {
    const box = rect(SHAPES.CELLS, 1.6);
    return [0, 1, 2].map((d) => ({ x: box.x + (0.16 / 1.6) * box.w, y: box.y + (0.2 + (d / 2) * 0.6) * box.h, r: 0.085 * box.h }));
  };

  const globe = () => {
    const r = rect(SHAPES.GLOBE, 1);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2, r: r.w / 2 };
  };

  return { W, H, phone, rect, tiles, rail, globe };
}
