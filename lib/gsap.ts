"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Draggable } from "gsap/Draggable";
import { useGSAP as useGSAPBase } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin, Physics2DPlugin, Draggable, useGSAPBase);
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
const heldSetups: (() => void)[] = [];
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
    const fn = list.shift();
    if (!fn) return done?.();
    fn();
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
    heldSetups.push(() => {
      if (!(context as gsap.Context & { isReverted?: boolean }).isReverted) context.add(() => run(context, contextSafe));
    });
  }, config);
}) as typeof useGSAPBase;

export { gsap, ScrollTrigger, Draggable };
