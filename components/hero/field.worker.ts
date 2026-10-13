// Draws the hero's constellation off the main thread (see field.ts): the page
// hands over its canvas, then sends the size, the pointer and whether it's on screen.
import { createField } from "./field";

type Msg =
  | { type: "init"; canvas: OffscreenCanvas; still: boolean }
  | { type: "resize"; w: number; h: number; dpr: number }
  | { type: "pointer"; x: number; y: number; active: boolean }
  | { type: "run"; on: boolean };

const scope = self as unknown as {
  onmessage: ((e: MessageEvent<Msg>) => void) | null;
  requestAnimationFrame?: (cb: () => void) => number;
};
const nextFrame = (cb: () => void) => (scope.requestAnimationFrame ? scope.requestAnimationFrame(cb) : setTimeout(cb, 16));

let field: ReturnType<typeof createField> | null = null;
let running = false;
let looping = false;
const loop = () => {
  if (!running || !field) return void (looping = false);
  field.draw();
  nextFrame(loop);
};

scope.onmessage = ({ data: m }) => {
  if (m.type === "init") field = createField(m.canvas, m.still);
  else if (m.type === "resize") field?.resize(m.w, m.h, m.dpr);
  else if (m.type === "pointer") field?.point(m.x, m.y, m.active);
  else {
    running = m.on;
    if (running && !looping) {
      looping = true;
      loop();
    }
  }
};
