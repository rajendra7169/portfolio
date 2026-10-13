"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Draggable } from "gsap/Draggable";
import { useGSAP as useGSAPBase } from "@gsap/react";

if (typeof window !== "undefined") {
  // As it registers, ScrollTrigger starts an empty requestAnimationFrame loop (a
  // workaround for an old Firefox repaint glitch) that runs for as long as the
  // page is open. A frame requested on every screen refresh makes the browser
  // render one, restyling everything animated on the page each time, even with
  // nothing moving. The loop only continues by asking again, so dropping its
  // first request stops it; every other request goes through untouched.
  const raf = window.requestAnimationFrame;
  let starting = true;
  window.requestAnimationFrame = (cb) => {
    if (starting) {
      const src = String(cb);
      if (src.length < 120 && src.includes("requestAnimationFrame(")) return 0;
    }
    return raf.call(window, cb);
  };
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin, Physics2DPlugin, Draggable, useGSAPBase);
  starting = false;
  window.requestAnimationFrame = raf;
  // With nothing animating, GSAP's ticker stops asking for frames, but only checks
  // every 120 frames (two seconds of frames for nothing after each animation).
  gsap.config({ autoSleep: 20 });
}

/**
 * Wrap a function so the tweens it makes belong to `ctx` — use the matchMedia
 * callback's own context here, not useGSAP's contextSafe. GSAP runs animation
 * callbacks inside the context the animation was created in; calling another
 * context's wrapper from there nests the two contexts into each other, and the
 * next revert recurses forever ("Maximum call stack size exceeded" in getTweens).
 */
export function inContext<T extends (...args: never[]) => unknown>(ctx: gsap.Context, fn: T): T {
  return (ctx.add as unknown as (name: null, f: T) => T)(null, fn);
}

/**
 * Pause these animations while `trigger` is off screen, and carry on from where
 * they were when it's back (only those that were playing). Endless loops kept
 * the page rendering every frame for parts no one could see. Make it inside the
 * same context as the animations, so it goes when they do.
 */
export function pauseOffscreen(trigger: Element, animations: () => (gsap.core.Animation | null | undefined)[]) {
  const held = new Set<gsap.core.Animation>();
  return ScrollTrigger.create({
    trigger,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      if (self.isActive) {
        held.forEach((a) => a.resume());
        held.clear();
      } else
        animations().forEach((a) => {
          if (a && !a.paused() && a.isActive()) {
            a.pause();
            held.add(a);
          }
        });
    },
  });
}

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 900px)";

/**
 * While a page change is under way, the animation set-up of the page that is
 * mounting waits (`holdSetups`) until the browser has taken its picture of the
 * new page and the view transition is moving (`runSetups`). Set-up measures
 * layout, builds ScrollTriggers and sets inline styles; done inside the swap,
 * all of that is time the old page sits frozen on screen.
 */
let holdingSetups = false;
const heldSetups: { context: gsap.Context; run: () => void }[] = [];
export function holdSetups() {
  holdingSetups = true;
}
/**
 * Run the held set-ups one component per task, in mount order (the hero first),
 * so the hero's entrance is already moving while the heavier sections below are
 * still setting up, instead of everything waiting on one long block. `done`
 * runs after the last one.
 */
export function runSetups(done?: () => void) {
  holdingSetups = false;
  const list = heldSetups.splice(0);
  const next = () => {
    const job = list.shift();
    if (!job) return done?.();
    job.run();
    window.setTimeout(next, 0);
  };
  next();
}

type Callback = (context: gsap.Context, contextSafe: (fn: (...args: never[]) => unknown) => (...args: never[]) => unknown) => unknown;
/** @gsap/react's useGSAP, held back during a page change (see holdSetups). */
export const useGSAP = ((callback?: unknown, config?: unknown) => {
  if (typeof callback !== "function") return (useGSAPBase as (c?: unknown) => unknown)(callback);
  const run = callback as Callback;
  return (useGSAPBase as (cb: Callback, c?: unknown) => unknown)((context, contextSafe) => {
    if (!holdingSetups) return run(context, contextSafe);
    // Later, inside the same context, so whatever it makes (and any cleanup it
    // returns) still reverts with the component; skipped if that already happened.
    // One per component: React's development mode mounts every component twice
    // (mount, unmount, mount again) on the same context, and running both held
    // set-ups built every ScrollTrigger twice (the hero's doubled pin pushed it
    // 75% of the screen down after any page change back to Home).
    const job = {
      context,
      run: () => {
        if (!(context as gsap.Context & { isReverted?: boolean }).isReverted) context.add(() => run(context, contextSafe));
      },
    };
    const i = heldSetups.findIndex((h) => h.context === context);
    if (i >= 0) heldSetups[i] = job;
    else heldSetups.push(job);
  }, config);
}) as typeof useGSAPBase;

export { gsap, ScrollTrigger, Draggable };
