"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin, Physics2DPlugin, useGSAP);
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

export { gsap, ScrollTrigger, useGSAP };
