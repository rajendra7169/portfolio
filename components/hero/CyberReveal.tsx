"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// The cyber portrait sits 2.1% of its width further left than the original;
// measured by matching the two head silhouettes (same scale, same aspect).
const OFFSET_X = 0.021;
const ASPECT = 1335 / 1178;

const LIFE = 2; // seconds a revealed patch stays
const FADE = 0.75; // the last part of LIFE, spent dissolving
const BURST_IN = 0.6; // full-suit scan: wipe down…
const BURST_HOLD = 2; // …hold…
const BURST_OUT = 0.6; // …wipe back up

type Dab = { x: number; y: number; t: number };

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/**
 * Hovering the photo opens a lens onto his cyber look. Everywhere the lens
 * passes stays revealed for two seconds, then dissolves with a glitch.
 * Click or tap runs a full scan into the suit and back.
 */
export default function CyberReveal() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = root.current!;
    const cv = box.querySelector("canvas")!;
    const ctx = cv.getContext("2d")!;
    const lens = box.querySelector<HTMLElement>(".hx-lens")!;
    const btn = box.querySelector<HTMLButtonElement>(".hx-cyber-btn")!;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let dabs: Dab[] = [];
    let last: { x: number; y: number } | null = null;
    let burst = -1;
    let inside = false;
    let running = false;
    let img: HTMLImageElement | null = null;
    const now = () => performance.now() / 1000;
    const radius = () => w * 0.15;

    // Faint horizontal scanlines laid over whatever is revealed.
    const scan = document.createElement("canvas");
    scan.width = 1;
    scan.height = 4;
    const sctx = scan.getContext("2d")!;
    sctx.fillStyle = "rgba(124, 200, 240, 0.22)";
    sctx.fillRect(0, 0, 1, 1);
    const scanPattern = ctx.createPattern(scan, "repeat")!;

    const lensX = gsap.quickTo(lens, "x", { duration: 0.25, ease: "power3.out" });
    const lensY = gsap.quickTo(lens, "y", { duration: 0.25, ease: "power3.out" });

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.clientWidth;
      h = box.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lens.style.setProperty("--d", `${radius() * 2}px`);
    };

    const load = () => {
      if (img) return;
      img = new Image();
      img.decoding = "async";
      img.src = w * dpr > 820 ? "/images/hero-cyber-1600.webp" : "/images/hero-cyber-800.webp";
    };

    const start = () => {
      if (running) return;
      running = true;
      gsap.ticker.add(draw);
    };
    const stop = () => {
      running = false;
      gsap.ticker.remove(draw);
      ctx.clearRect(0, 0, w, h);
    };

    function draw() {
      const t = now();
      dabs = dabs.filter((d) => t - d.t < LIFE);
      const b = burst >= 0 ? t - burst : -1;
      if (b > BURST_IN + BURST_HOLD + BURST_OUT) burst = -1;
      if (!dabs.length && burst < 0) {
        if (!inside) stop();
        else ctx.clearRect(0, 0, w, h);
        return;
      }
      if (!img?.complete || !img.naturalWidth) return;

      ctx.clearRect(0, 0, w, h);

      // 1. Paint the mask: soft discs that shrink and dissolve as they age.
      ctx.globalCompositeOperation = "source-over";
      const r0 = radius();
      for (const d of dabs) {
        const age = t - d.t;
        const k = age < LIFE - FADE ? 1 : Math.max(0, 1 - (age - (LIFE - FADE)) / FADE);
        const r = r0 * (0.7 + 0.3 * k);
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
        g.addColorStop(0, `rgba(0,0,0,${k})`);
        g.addColorStop(0.6, `rgba(0,0,0,${k})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      let edge = -1;
      if (burst >= 0) {
        const p = b < BURST_IN ? easeInOut(b / BURST_IN) : b < BURST_IN + BURST_HOLD ? 1 : 1 - easeInOut((b - BURST_IN - BURST_HOLD) / BURST_OUT);
        edge = calm ? (p > 0 ? h : 0) : p * h;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, edge);
      }

      // 2. Keep the cyber portrait only where the mask is painted.
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(img, OFFSET_X * w, 0, w, w * ASPECT);

      // 3. Hologram scanlines on top of the revealed part.
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = scanPattern;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      // 4. Now and then, tear a thin slice sideways: a signal glitch.
      if (!calm && Math.random() < 0.22) {
        const sy = Math.random() * h;
        const sh = 3 + Math.random() * 12;
        const dx = (Math.random() - 0.5) * 18;
        ctx.drawImage(cv, 0, sy * dpr, cv.width, sh * dpr, dx, sy, w, sh);
      }

      // 5. The scanner line riding the edge of a full-suit wipe.
      if (edge > 1 && edge < h - 1) {
        ctx.save();
        ctx.shadowColor = "rgba(74, 168, 224, 0.95)";
        ctx.shadowBlur = 22;
        const line = ctx.createLinearGradient(0, 0, w, 0);
        line.addColorStop(0, "rgba(124, 200, 240, 0)");
        line.addColorStop(0.5, "rgba(255, 255, 255, 1)");
        line.addColorStop(1, "rgba(124, 200, 240, 0)");
        ctx.fillStyle = line;
        ctx.fillRect(0, edge - 1.5, w, 3);
        ctx.restore();
      }
    }

    const used = () => box.classList.add("is-used");

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      inside = true;
      load();
      box.classList.add("is-active");
      gsap.set(lens, { x: e.offsetX, y: e.offsetY });
      start();
    };
    const onLeave = () => {
      inside = false;
      last = null;
      box.classList.remove("is-active");
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      // offsetX/Y are in the button's own coordinates, so the 3D tilt doesn't skew them.
      const x = e.offsetX;
      const y = e.offsetY;
      lensX(x);
      lensY(y);
      const t = now();
      // Fill the gap between pointer samples so fast strokes stay continuous.
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        const steps = Math.min(16, Math.floor(dist / (radius() * 0.3)));
        for (let i = 1; i <= steps; i++) {
          const f = i / (steps + 1);
          dabs.push({ x: last.x + (x - last.x) * f, y: last.y + (y - last.y) * f, t });
        }
      }
      dabs.push({ x, y, t });
      if (dabs.length > 500) dabs.splice(0, dabs.length - 500);
      last = { x, y };
      used();
      start();
    };
    const onClick = () => {
      load();
      // A late tap on a fresh page may land before the image decodes; wait for it.
      const go = () => {
        burst = now();
        start();
      };
      if (img!.complete) go();
      else img!.addEventListener("load", go, { once: true });
      used();
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(box);
    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("pointermove", onMove);
    btn.addEventListener("click", onClick);
    // Fetch the cyber portrait once the page has settled, so the first hover is instant.
    const preload = window.setTimeout(load, 3500);

    return () => {
      window.clearTimeout(preload);
      stop();
      ro.disconnect();
      btn.removeEventListener("pointerenter", onEnter);
      btn.removeEventListener("pointerleave", onLeave);
      btn.removeEventListener("pointermove", onMove);
      btn.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="hx-cyber" ref={root}>
      <canvas className="hx-cyber-canvas" aria-hidden="true" />
      <span className="hx-lens" aria-hidden="true">
        <span className="hx-lens-ring" />
        <span className="hx-lens-label">Cyber mode</span>
      </span>
      <button type="button" className="hx-cyber-btn" aria-label="Show Rajendra's cyber suit for two seconds" data-cursor-hide />
      <span className="hx-cyber-hint" aria-hidden="true">
        <span className="hx-hint-fine">✦ Hover to scan · click for the full suit</span>
        <span className="hx-hint-touch">✦ Tap for the cyber suit</span>
      </span>
    </div>
  );
}
