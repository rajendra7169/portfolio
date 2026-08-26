/**
 * scrollStore.ts — the single normalized scroll value the whole page reads.
 *
 * the brief §7: never read `window.scrollY` in a component. Everything goes
 * through here. The store is a plain module object rather than React state
 * because the 3D scene samples it every frame — pushing that through React
 * would re-render the tree sixty times a second for no reason.
 *
 * Two guards matter (the brief §5):
 *   · progress is clamped 0–1 and returns 0 for a zero-height document, which
 *     is what you get for a frame or two during hydration
 *   · measurements are recomputed on resize, debounced at 150ms, because a
 *     mobile address bar showing and hiding fires resize continuously
 */

export interface ActBounds {
  /** Normalized document position where the act's top crosses the viewport top. */
  start: number;
  end: number;
}

export interface ScrollState {
  /** 0 at the top of the document, 1 at the bottom. Always finite. */
  progress: number;
  /** Pixels of scroll. Kept for measurement only — do not animate from it. */
  y: number;
  /** Signed, in px/frame, smoothed. Used for subtle scene lead-in. */
  velocity: number;
  activeAct: string | null;
  /** 0–1 inside the active act. */
  actProgress: number;
  acts: Record<string, ActBounds>;
  /** Document scroll range in px. 0 before first measure. */
  limit: number;
}

const state: ScrollState = {
  progress: 0,
  y: 0,
  velocity: 0,
  activeAct: null,
  actProgress: 0,
  acts: {},
  limit: 0,
};

type Listener = (s: ScrollState) => void;

const frameListeners = new Set<Listener>();
const actListeners = new Set<Listener>();

export const scroll = state;

/** Fires on every scroll update. Keep the callback cheap — no React setState. */
export function subscribeScroll(fn: Listener): () => void {
  frameListeners.add(fn);
  return () => frameListeners.delete(fn);
}

/** Fires only when the active act changes. Safe for React state. */
export function subscribeAct(fn: Listener): () => void {
  actListeners.add(fn);
  return () => actListeners.delete(fn);
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

let registered: string[] = [];

/** Section ids, in document order. Registered once by App on mount. */
export function registerActs(ids: readonly string[]): void {
  registered = [...ids];
}

/**
 * Re-measures every registered section against the document. Cheap enough to
 * run on resize, expensive enough that it must not run per frame.
 */
export function measure(): void {
  if (typeof document === 'undefined') return;

  const doc = document.documentElement;
  const limit = Math.max(0, doc.scrollHeight - window.innerHeight);
  state.limit = limit;

  const acts: Record<string, ActBounds> = {};
  if (limit > 0) {
    for (const id of registered) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      acts[id] = {
        start: clamp01(top / limit),
        end: clamp01((top + rect.height) / limit),
      };
    }
  }
  state.acts = acts;
  update();
}

let lastY = 0;

/** Recomputes derived values from the current scroll position. */
export function update(): void {
  if (typeof window === 'undefined') return;

  const y = window.scrollY || 0;
  const limit = state.limit;

  state.velocity = state.velocity * 0.8 + (y - lastY) * 0.2;
  lastY = y;
  state.y = y;
  // A zero-height document during hydration must read 0, never NaN.
  state.progress = limit > 0 ? clamp01(y / limit) : 0;

  let active: string | null = null;
  let actProgress = 0;
  // The act whose band contains the viewport's vertical middle is the active
  // one — using the top makes the label flip a full viewport too early.
  const probe = limit > 0 ? clamp01((y + window.innerHeight * 0.4) / limit) : 0;
  for (const id of registered) {
    const bounds = state.acts[id];
    if (!bounds) continue;
    if (probe >= bounds.start && probe < bounds.end) {
      active = id;
      const span = bounds.end - bounds.start;
      actProgress = span > 0 ? clamp01((probe - bounds.start) / span) : 0;
      break;
    }
  }
  // Past the last measured band (the footer, say) the last act stays active
  // rather than the label blanking out.
  if (!active && registered.length > 0) {
    active = probe <= 0 ? (registered[0] ?? null) : (registered[registered.length - 1] ?? null);
    actProgress = probe <= 0 ? 0 : 1;
  }

  const changed = active !== state.activeAct;
  state.activeAct = active;
  state.actProgress = actProgress;

  for (const fn of frameListeners) fn(state);
  if (changed) for (const fn of actListeners) fn(state);
}

/**
 * Progress across an arbitrary span of the document, clamped. The scene uses
 * this to cross-fade objects between acts without hard-coding any p values —
 * DESIGN.md §7 requires the boundaries come from measured offsets.
 */
export function actRange(id: string): ActBounds {
  return state.acts[id] ?? { start: 0, end: 0 };
}
