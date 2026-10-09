"use client";

import { useEffect, useRef } from "react";
import { PALETTE } from "./engine";
import { useDust } from "./DustProvider";
import { device, fromImage, globe, nepal, readPixels, tiles, type Shape } from "./shapes";

export type StillKind = "portrait" | "nepal" | "phone" | "globe" | "cells-row" | "tiles" | "kurta";

/**
 * Reduced motion: an in-flow canvas with one shape drawn once. Nothing moves.
 * Only rendered when the provider reports motion off.
 */
export default function StillShape({ shape, label }: { shape: StillKind; label: string }) {
  const { motion } = useDust();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (motion) return;
    const cv = ref.current;
    if (!cv) return;
    let dead = false;
    (async () => {
      const n = 3500;
      let s: Shape;
      const draw = (sh: Shape, extraDraw?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
        if (dead) return;
        const w = cv.clientWidth, h = w / sh.aspect;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        cv.style.height = `${h}px`;
        const ctx = cv.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        for (let c = 0; c < 5; c++) {
          ctx.fillStyle = PALETTE[c];
          for (let i = 0; i < sh.n; i++) {
            if (sh.pal[i] !== c) continue;
            const sz = sh.size[i];
            ctx.fillRect(sh.x[i] * w - sz / 2, sh.y[i] * h - sz / 2, sz, sz);
          }
        }
        extraDraw?.(ctx, w, h);
      };
      switch (shape) {
        case "portrait":
          s = fromImage(await readPixels("/images/hero-800.webp", 320), n, { seed: 7, sparks: 0.01 });
          return draw(s);
        case "kurta":
          s = fromImage(await readPixels("/images/contact-800.webp", 320), n, { seed: 9, sparks: 0, redIsOrange: true });
          return draw(s);
        case "nepal": {
          const np = nepal(n);
          return draw(np, (ctx, w, h) => {
            const [kx, ky] = np.kathmandu;
            ctx.fillStyle = PALETTE[4];
            ctx.beginPath();
            ctx.arc(kx * w, ky * h, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 28, 85, 0.55)";
            ctx.beginPath();
            ctx.moveTo(kx * w, ky * h);
            ctx.lineTo(kx * w + 36, ky * h);
            ctx.lineTo(kx * w + 36, 8);
            ctx.lineTo(0, 8);
            ctx.stroke();
          });
        }
        case "phone":
          return draw(device(n, "phone"));
        case "globe":
          return draw(globe(n));
        case "tiles":
          return draw(tiles(n, 8, 4, [0, 1, 2]));
        case "cells-row": {
          // four silhouettes side by side
          const names = ["fullstack", "cloud", "design", "video"];
          const row: Shape = { x: new Float32Array(n), y: new Float32Array(n), size: new Float32Array(n), pal: new Uint8Array(n), aspect: 4, n };
          const per = Math.floor(n / 4);
          for (let k = 0; k < 4; k++) {
            const art = fromImage(await readPixels(`/illustrations/${names[k]}.svg`, 240), per, { seed: 50 + k, sparks: 0, darkBias: 0.45 });
            for (let i = 0; i < per; i++) {
              const idx = k * per + i;
              row.x[idx] = (k + 0.05 + art.x[i] * 0.9) / 4;
              row.y[idx] = 0.05 + art.y[i] * 0.9;
              row.size[idx] = art.size[i];
              row.pal[idx] = art.pal[i];
            }
          }
          return draw(row);
        }
      }
    })();
    return () => {
      dead = true;
    };
  }, [motion, shape]);

  if (motion) return null;
  return <canvas ref={ref} className="dm-still" role="img" aria-label={label} />;
}
