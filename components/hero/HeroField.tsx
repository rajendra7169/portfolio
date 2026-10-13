"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { createField } from "./field";

type Painter = { resize: (w: number, h: number, dpr: number) => void; point: (x: number, y: number, active: boolean) => void; run: (on: boolean) => void; end: () => void };

// A canvas handed to a worker can't be taken back, and in development React
// mounts every component twice on the same element: so the worker outlives a
// cleanup by a moment, and a remount straight after picks it up again.
const workers = new WeakMap<HTMLCanvasElement, { worker: Worker; ending: number }>();

/** The canvas drawn by a worker (field.worker.ts), or here where workers can't draw. */
function painter(cv: HTMLCanvasElement, still: boolean): Painter {
  let held = workers.get(cv);
  if (!held && "transferControlToOffscreen" in cv && typeof Worker !== "undefined") {
    try {
      const worker = new Worker(new URL("./field.worker.ts", import.meta.url));
      const off = cv.transferControlToOffscreen();
      worker.postMessage({ type: "init", canvas: off, still }, [off]);
      held = { worker, ending: 0 };
      workers.set(cv, held);
    } catch {}
  }
  if (held) {
    const h = held;
    clearTimeout(h.ending);
    const send = (m: object) => h.worker.postMessage(m);
    return {
      resize: (w, hh, dpr) => send({ type: "resize", w, h: hh, dpr }),
      point: (x, y, active) => send({ type: "pointer", x, y, active }),
      run: (on) => send({ type: "run", on }),
      end: () => {
        send({ type: "run", on: false });
        h.ending = window.setTimeout(() => {
          h.worker.terminate();
          workers.delete(cv);
        }, 1000);
      },
    };
  }
  // On the page, on GSAP's ticker (the same clock Lenis uses).
  const field = createField(cv, still);
  const draw = () => field.draw();
  return { resize: field.resize, point: field.point, run: (on) => (on ? gsap.ticker.add(draw) : gsap.ticker.remove(draw)), end: () => gsap.ticker.remove(draw) };
}

/**
 * A drifting constellation in the site's navy and sky (field.ts). Nodes link up
 * when close, and the cursor tugs nearby nodes toward it and wires itself into the network.
 */
export default function HeroField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = painter(cv, still);

    const resize = () => {
      const rect = cv.getBoundingClientRect();
      p.resize(rect.width, rect.height, Math.min(window.devicePixelRatio || 1, 2));
    };
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const y = e.clientY - r.top;
      p.point(e.clientX - r.left, y, y >= 0 && y <= r.height);
    };
    const onLeave = () => p.point(-1e4, -1e4, false);

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // Animate only while visible.
    const io = new IntersectionObserver(([entry]) => !still && p.run(entry.isIntersecting));
    io.observe(cv);

    return () => {
      p.end();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvas} className="hx-field" aria-hidden="true" />;
}
