"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type Node = { x: number; y: number; vx: number; vy: number; r: number; accent: boolean };

const NAVY = "0, 28, 85";
const SKY = "74, 168, 224";
const LINK = 130; // px: nodes closer than this get a line
const REACH = 170; // px: the cursor's pull radius

/**
 * A drifting constellation in the site's navy and sky. Nodes link up when close,
 * and the cursor tugs nearby nodes toward it and wires itself into the network.
 */
export default function HeroField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    const pointer = { x: -1e4, y: -1e4, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.round((w * h) / 14000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.8,
        accent: Math.random() < 0.18,
      }));
      if (still) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!still) {
          // Gentle pull toward the cursor, then drift.
          if (pointer.active) {
            const dx = pointer.x - n.x;
            const dy = pointer.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < REACH && d > 1) {
              n.vx += (dx / d) * 0.012;
              n.vy += (dy / d) * 0.012;
            }
          }
          n.vx *= 0.992;
          n.vy *= 0.992;
          // Keep a minimum drift so the field never freezes.
          if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.02;
          if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.02;
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${NAVY}, ${(1 - d / LINK) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (pointer.active) {
          const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (d < REACH) {
            ctx.strokeStyle = `rgba(${SKY}, ${(1 - d / REACH) * 0.55})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = a.accent ? `rgba(${SKY}, 0.9)` : `rgba(${NAVY}, 0.32)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = pointer.y >= 0 && pointer.y <= r.height;
    };
    const onLeave = () => void (pointer.active = false);

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // Animate only while visible, on GSAP's ticker (the same clock Lenis uses).
    let running = false;
    const io = new IntersectionObserver(([entry]) => {
      if (still) return;
      if (entry.isIntersecting && !running) gsap.ticker.add(draw);
      if (!entry.isIntersecting && running) gsap.ticker.remove(draw);
      running = entry.isIntersecting;
    });
    io.observe(cv);

    return () => {
      gsap.ticker.remove(draw);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvas} className="hx-field" aria-hidden="true" />;
}
