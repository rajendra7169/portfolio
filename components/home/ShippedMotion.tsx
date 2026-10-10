"use client";

// Section 6 — Shipped: the dust scatters from the last skill cell into eight app
// tiles, and the eight DOM tiles (name, date, logos, links) settle exactly on
// them (spec §4.6). Desktop: a sticky 100vh stage keeps the overlays aligned
// with the fixed dust through the 60vh dwell. Phones: no sticky stage, the
// tiles become an in-flow list under the dust. Reduced motion: a still.
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";
import { useDust } from "./dust/DustProvider";
import { SHAPES, layout as makeLayout } from "./dust/layout";
import StillShape from "./dust/StillShape";

const PREV = SHAPES.CELLS + 3; // the shape the dust arrives from (section 5, last skill)
const FINE = `${MOTION_OK} and (hover: hover) and (pointer: fine)`;

export default function ShippedMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const { engine } = useDust();

  useGSAP(
    () => {
      const el = root.current;
      // No engine: reduced motion (StillShape draws the tiles) or not mounted yet.
      if (!el || !engine) return;
      const state = engine.state;
      const q = gsap.utils.selector(el);
      const tiles = q(".ds-tile");

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP, fine: FINE }, (ctx) => {
        const { motion, desktop, fine } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        let dead = false;
        const offs: (() => void)[] = [];

        /* ── Dust: cells → tiles on the way in, back on the way out ────────── */
        // One tween at a time (overwrite: "auto" would also kill other sections' scrubbed t tweens).
        let tw: gsap.core.Tween | undefined;
        const morph = inContext(ctx, (t: number) => {
          tw?.kill();
          tw = gsap.to(state, { t, duration: desktop ? 1.6 : 1.4, ease: "power2.inOut" });
        });
        let want = -1;
        // Shapes build lazily; a morph to one that isn't there yet would just hold.
        const aim = (t: number) => {
          want = t;
          if (engine.has(t)) return morph(t);
          engine.whenReady(t).then(() => !dead && want === t && morph(t));
        };
        ScrollTrigger.create({
          trigger: el,
          start: desktop ? "top 75%" : "top 55%",
          onEnter: () => aim(SHAPES.TILES),
          onLeaveBack: () => aim(PREV),
        });

        /* ── Copy: counter, headline, intro + CTA, once, after the curtain ─── */
        const count = q(".ds-count")[0];
        const reveal = gsap.timeline({ paused: true });
        reveal.from(q(".ds-h2 .char"), { yPercent: 118, rotate: 6, duration: 1.1, stagger: 0.03, ease: "expo.out" }, 0);
        if (count) {
          const to = Number(count.dataset.to ?? count.textContent ?? 0);
          reveal.fromTo(count, { textContent: 0 }, { textContent: to, snap: { textContent: 1 }, duration: 1.4, ease: "power2.out" }, 0);
        }
        reveal.from([...q(".ds-intro"), ...q(".ds-ctas")], { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "power3.out" }, 0.25);
        ScrollTrigger.create({ trigger: el, start: "top 60%", once: true, onEnter: () => afterReveal(() => reveal.play()) });

        /* ── Tiles ─────────────────────────────────────────────────────────── */
        if (desktop) {
          // Lay each DOM tile exactly on its dust tile. The stage is sticky at top: 0, so
          // once it is stuck, stage px = viewport px = the engine's layout px.
          const place = () => {
            const rects = makeLayout(window.innerWidth, window.innerHeight, engine.phone).tiles();
            tiles.forEach((tile, k) => {
              const r = rects[k];
              if (r) gsap.set(tile, { left: r.x, top: r.y, width: r.w, height: r.h });
            });
          };
          place();
          ScrollTrigger.addEventListener("refresh", place);
          offs.push(() => ScrollTrigger.removeEventListener("refresh", place));

          // Labels rise onto the dust once the stage is (nearly) stuck, and leave with it.
          gsap.set(tiles, { autoAlpha: 0, y: 18 });
          const show = inContext(ctx, () => gsap.to(tiles, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", overwrite: "auto" }));
          const hide = inContext(ctx, () => gsap.to(tiles, { autoAlpha: 0, y: 18, duration: 0.3, ease: "power2.in", overwrite: "auto" }));
          ScrollTrigger.create({ trigger: el, start: "top 20%", onEnter: show, onLeaveBack: hide });

          // Hover / focus: the engine scales that tile's particles around its centre (no DOM reads).
          const scale = inContext(ctx, (k: number, s: number) => {
            gsap.to(state.tileScale, { [k]: s, duration: 0.45, ease: "power3.out", overwrite: "auto" });
          });
          tiles.forEach((tile, k) => {
            const on = () => scale(k, 1.08);
            const off = () => scale(k, 1);
            if (fine) {
              tile.addEventListener("pointerenter", on);
              tile.addEventListener("pointerleave", off);
            }
            tile.addEventListener("focusin", on);
            tile.addEventListener("focusout", off);
            offs.push(() => {
              tile.removeEventListener("pointerenter", on);
              tile.removeEventListener("pointerleave", off);
              tile.removeEventListener("focusin", on);
              tile.removeEventListener("focusout", off);
            });
          });
        } else {
          // Phones: the list rows slide in under the dust.
          gsap.from(tiles, {
            autoAlpha: 0,
            y: 18,
            duration: 0.7,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: { trigger: q(".ds-grid")[0] ?? el, start: "top 85%", once: true },
          });
        }

        return () => {
          dead = true;
          offs.forEach((fn) => fn());
          state.tileScale.fill(1);
        };
      });
    },
    { scope: root, dependencies: [engine] },
  );

  return (
    <section className="ds dm-section" ref={root} aria-labelledby="shipped">
      <div className="ds-stage">
        {children}
        <div className="ds-right">
          {/* Reduced motion only (renders nothing when the engine runs). */}
          <StillShape shape="tiles" label="Eight app tiles, drawn in particles" />
        </div>
      </div>
    </section>
  );
}
