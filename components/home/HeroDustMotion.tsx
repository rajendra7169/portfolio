"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";
import { hero } from "@/lib/content";
import { useDust } from "./dust/DustProvider";
import { SHAPES } from "./dust/layout";
import StillShape from "./dust/StillShape";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}#*01";
const PORTRAIT_ASPECT = 800 / 906; // hero-800.webp

/**
 * Section 1: the dust streams in from a scatter and becomes his face while the
 * copy decodes. Desktop pins it for one screen: the copy leaves, the face
 * becomes Nepal, and the name shrinks into the HUD tag (§4.1).
 */
export default function HeroDustMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const hit = useRef<HTMLButtonElement>(null);
  const { engine } = useDust();

  useGSAP(
    () => {
      const el = root.current!;
      const btn = hit.current;
      if (!engine || !btn) return; // reduced motion (or not mounted yet): everything is visible as rendered
      const state = engine.state;
      const q = gsap.utils.selector(el);

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        let dead = false;
        const copy = q(".dh-copy")[0];
        const name = q(".dh-name")[0];
        const rest = q(".dh-copy > :not(.dh-name):not(.sr-only)");

        // The hit area covers the portrait (section px = viewport px while the hero is at the top).
        const place = () => {
          const r = engine.layout.rect(SHAPES.PORTRAIT, PORTRAIT_ASPECT);
          const crop = desktop ? r.h : Math.min(r.h, 0.42 * window.innerHeight - r.y);
          gsap.set(btn, { left: r.x, top: r.y, width: r.w, height: crop });
        };
        place();
        ScrollTrigger.addEventListener("refresh", place);

        /* ── Intro: copy decodes while the dust streams into his face ─────── */
        const intro = gsap
          .timeline({ paused: true })
          .set(copy, { opacity: 1 })
          .from(q(".dh-eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, 0.2)
          .from(q(".dh-line"), { yPercent: 105, y: 0, duration: 1.1, stagger: 0.12, ease: "expo.out" }, 0.35)
          .to(q(".hx-line--a"), { scrambleText: { text: hero.first, chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.35)
          .to(q(".hx-line--b"), { scrambleText: { text: hero.last, chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.5)
          .from(q(".dh-build"), { y: 30, autoAlpha: 0, duration: 0.9, ease: "power3.out" }, 1.1)
          .from(q(".dh-intro"), { y: 30, autoAlpha: 0, duration: 0.9, ease: "power3.out" }, 1.2)
          .from(q(".dh-socials li"), { scale: 0, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: "back.out(2.5)" }, 1.3)
          .from(q(".dh-ctas .btn"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 1.5)
          .from(q(".dh-stats"), { y: 24, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, 1.6)
          .from(q(".dh-count"), { textContent: 0, snap: { textContent: 1 }, duration: 1.6, ease: "power2.out", stagger: 0.15 }, 1.6)
          .fromTo(q(".dh-cue-in"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 2.0);

        // The slot reel: one line every 2.4s, looping through the clone.
        const items = q(".dh-reel-item").length;
        const reel = gsap.timeline({ repeat: -1, paused: true });
        for (let k = 1; k < items; k++) reel.to(q(".dh-reel-track"), { yPercent: (-100 / items) * k, duration: 0.7, ease: "expo.inOut" }, k * 2.4 - 0.7);
        reel.set(q(".dh-reel-track"), { yPercent: 0 }, (items - 1) * 2.4 + 0.01);
        intro.call(() => void reel.play(), [], 2.6);

        afterReveal(
          inContext(ctx, () => {
            if (dead) return;
            intro.play();
            // Only stream in from the scatter when we're actually at the top (a reload
            // mid-page leaves t to the section that owns it).
            if (window.scrollY < 8 && state.t < 0)
              engine.whenReady(SHAPES.PORTRAIT).then(
                inContext(ctx, () => {
                  if (!dead && window.scrollY < 8) gsap.to(state, { t: SHAPES.PORTRAIT, duration: 1.8, ease: "power2.out" });
                }),
              );
          }),
        );

        /* ── Tap / Space: a burst; press and hold: the cyber suit flickers through ── */
        const burstAt = (x: number, y: number) => (state.burst = { x, y, t0: performance.now() });
        let holdTimer = 0;
        const cyber = inContext(ctx, (on: boolean) => gsap.to(state, { palMix: on ? 1 : 0, duration: on ? 0.5 : 0.35, ease: "power2.out", overwrite: true }));
        const onDown = (e: PointerEvent) => {
          burstAt(e.clientX, e.clientY);
          holdTimer = window.setTimeout(() => cyber(true), 220);
        };
        const onUp = () => {
          window.clearTimeout(holdTimer);
          if (state.palMix > 0) cyber(false);
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key !== " " && e.key !== "Enter") return;
          e.preventDefault();
          const r = btn.getBoundingClientRect();
          burstAt(r.left + r.width / 2, r.top + r.height * 0.4);
        };
        btn.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        btn.addEventListener("pointercancel", onUp);
        btn.addEventListener("keydown", onKey);

        if (desktop) {
          /* ── Pin: the copy leaves, face → Nepal, the name docks into the HUD tag ── */
          const tag = document.querySelector<HTMLElement>(".dn-tag");
          const tagName = tag?.querySelector("b");
          let pin: ScrollTrigger | undefined;
          // Name rect without its own transform, in the pinned frame (section at the viewport top).
          const nameBase = () => {
            const r = name.getBoundingClientRect();
            const past = pin ? Math.max(0, window.scrollY - pin.end) : 0;
            return { left: r.left - (gsap.getProperty(name, "x") as number), top: r.top - (gsap.getProperty(name, "y") as number) + past, h: r.height / ((gsap.getProperty(name, "scale") as number) || 1) };
          };
          const tagBase = () => {
            if (!tag || !tagName) return { left: 24, top: window.innerHeight - 60, h: 16 };
            const r = tagName.getBoundingClientRect();
            return { left: r.left - (gsap.getProperty(tag, "x") as number), top: r.top - (gsap.getProperty(tag, "y") as number), h: r.height };
          };
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el, start: "top top", end: "+=100%", scrub: 0.8, pin: true, refreshPriority: 10, invalidateOnRefresh: true },
          });
          pin = tl.scrollTrigger;
          tl.to(q(".dh-cue"), { autoAlpha: 0, duration: 0.1 }, 0)
            .to(rest, { y: -120, autoAlpha: 0, duration: 0.45, stagger: 0.02 }, 0.1)
            .fromTo(state, { t: SHAPES.PORTRAIT }, { t: SHAPES.NEPAL, duration: 0.68, immediateRender: false }, 0.12)
            .to(
              name,
              {
                x: () => tagBase().left - nameBase().left,
                y: () => tagBase().top - nameBase().top,
                scale: () => (tagBase().h * 2.1) / nameBase().h,
                transformOrigin: "left top",
                duration: 0.7,
                ease: "power2.inOut",
              },
              0.15,
            )
            .set(name, { autoAlpha: 0 }, 0.85)
            .set(tag ?? {}, { autoAlpha: 1 }, 0.85)
            .to({}, { duration: 0.15 }, 0.85);
        } else {
          // Phones: no pin. The name fades with the copy as the hero leaves; Kathmandu takes the dust.
          gsap.to(copy, { autoAlpha: 0.15, y: -40, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom 30%", scrub: 0.6 } });
        }

        return () => {
          dead = true;
          ScrollTrigger.removeEventListener("refresh", place);
          btn.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          btn.removeEventListener("pointercancel", onUp);
          btn.removeEventListener("keydown", onKey);
          window.clearTimeout(holdTimer);
          state.palMix = 0;
        };
      });
    },
    { scope: root, dependencies: [engine] },
  );

  return (
    <section className="dh dm-section" ref={root} aria-label="Introduction">
      {children}
      <div className="dh-stage">
        {engine ? (
          <button
            ref={hit}
            type="button"
            className="dh-hit"
            aria-label="Rajendra's portrait, drawn in particles. Press Space to scatter it."
            data-cursor-hide
          />
        ) : (
          <StillShape shape="portrait" label="Rajendra Pandey in a suit and sunglasses, drawn in particles" />
        )}
      </div>
    </section>
  );
}
