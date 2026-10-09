"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";
import { DustEngine } from "./engine";
import { buildShapes } from "./build";

type Dust = { engine: DustEngine | null; phone: boolean; motion: boolean };
const DustContext = createContext<Dust>({ engine: null, phone: false, motion: false });
export const useDust = () => useContext(DustContext);

declare global {
  interface Window {
    __dust?: { engine: DustEngine; state: DustEngine["state"]; layout: DustEngine["layout"] };
  }
}

/**
 * Owns the one engine and the one fixed canvas. Renders nothing when motion is
 * reduced (sections then draw their own still shapes).
 */
export default function DustProvider({ children }: { children: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [dust, setDust] = useState<Dust>({ engine: null, phone: false, motion: false });

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
      const { motion, desktop } = ctx.conditions as Record<string, boolean>;
      if (!motion) {
        setDust({ engine: null, phone: !desktop, motion: false });
        return;
      }
      const cv = canvas.current!;
      const c2d = cv.getContext("2d")!;
      const phone = !desktop;
      const cores = navigator.hardwareConcurrency ?? 8;
      const n = phone ? (cores <= 4 ? 1800 : 2500) : cores <= 4 ? 4000 : 7000;
      const engine = new DustEngine({ n, phone, W: window.innerWidth, H: window.innerHeight });
      window.__dust = { engine, state: engine.state, layout: engine.layout };

      const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1 : 1.5);
      const size = () => {
        const W = window.innerWidth, H = window.innerHeight;
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        engine.resize(W, H);
        window.__dust!.layout = engine.layout;
      };
      size();
      let resizeTimer = 0;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(size, 200);
      };
      window.addEventListener("resize", onResize);

      // Pointer: wind for mice, a burst for touches (inside the current shape).
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || !fine) return;
        engine.state.pointer.x = e.clientX;
        engine.state.pointer.y = e.clientY;
        engine.state.pointer.on = true;
      };
      const onLeave = () => (engine.state.pointer.on = false);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);

      let paused = false;
      const onVis = () => (paused = document.hidden);
      document.addEventListener("visibilitychange", onVis);
      let last = 0;
      const tick = (time: number) => {
        if (paused) return;
        const dt = last ? (time - last) * 1000 : 16;
        last = time;
        engine.tick(time, dt);
        engine.draw(c2d);
      };
      gsap.ticker.add(tick);
      buildShapes(engine);
      setDust({ engine, phone, motion: true });

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("visibilitychange", onVis);
        window.clearTimeout(resizeTimer);
        delete window.__dust;
        setDust({ engine: null, phone, motion: false });
      };
    });
  }, []);

  // Keep the canvas out of the way when motion is off (CSS also hides it, this is the no-CSS fallback).
  useEffect(() => {
    if (canvas.current) canvas.current.hidden = !dust.motion;
  }, [dust.motion]);

  return (
    <DustContext.Provider value={dust}>
      <canvas ref={canvas} className="dm-canvas" aria-hidden="true" />
      {children}
    </DustContext.Provider>
  );
}
