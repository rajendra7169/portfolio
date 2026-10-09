"use client";

// Section 7 — Say hello: the dust becomes the kurta portrait and breathes while
// the closing copy settles beside it (spec §4.7). The HUD owns the name-tag
// docking tween; this file only renders the slot it docks into.
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";
import { useDust } from "./dust/DustProvider";
import { SHAPES } from "./dust/layout";
import StillShape from "./dust/StillShape";

const PREV = SHAPES.TILES; // the shape the dust arrives from (section 6)

export default function SayHelloMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const { engine } = useDust();

  useGSAP(
    () => {
      const el = root.current;
      // No engine: reduced motion (StillShape draws the kurta) or not mounted yet.
      if (!el || !engine) return;
      const state = engine.state;
      const q = gsap.utils.selector(el);

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        let dead = false;

        // Dust: tiles → kurta on the way in, and the slow breathe while we're here.
        const morph = inContext(ctx, (t: number, wander: number) => {
          gsap.to(state, { t, duration: desktop ? 1.6 : 1.4, ease: "power2.inOut", overwrite: "auto" });
          gsap.to(state, { wander, duration: 1, ease: "power2.out", overwrite: "auto" });
        });
        const arrive = ScrollTrigger.create({
          trigger: el,
          start: desktop ? "top 65%" : "top 55%",
          onEnter: () => {
            if (engine.has(SHAPES.KURTA)) return morph(SHAPES.KURTA, 2);
            // Shapes build lazily; a morph to one that isn't there yet would just hold.
            engine.whenReady(SHAPES.KURTA).then(() => !dead && arrive.isActive && morph(SHAPES.KURTA, 2));
          },
          onLeaveBack: () => morph(PREV, 1),
        });

        // Copy entrance, once, after the curtain.
        const reveal = gsap
          .timeline({ paused: true })
          .from(q(".dy-h2 .char"), { yPercent: 118, rotate: 6, duration: 1.1, stagger: 0.03, ease: "expo.out" }, 0)
          .from(q(".dy-blurb"), { y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out" }, 0.25)
          .from([...q(".dy-ctas .btn"), ...q(".dy-socials li")], { scale: 0, autoAlpha: 0, duration: 0.7, stagger: 0.05, ease: "back.out(2.2)" }, 0.4)
          .from(q(".dy-email"), { y: 24, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, 0.7)
          // The foot holds the tag's docking slot: fade only, so its measured rect never moves.
          .from(q(".dy-foot"), { autoAlpha: 0, duration: 0.8, ease: "power2.out" }, 0.9);
        ScrollTrigger.create({ trigger: el, start: "top 60%", once: true, onEnter: () => afterReveal(() => reveal.play()) });

        return () => {
          dead = true;
        };
      });
    },
    { scope: root, dependencies: [engine] },
  );

  return (
    <section className="dy dm-section" ref={root} aria-labelledby="say-hello">
      {children}
      {/* Reduced motion only (renders nothing when the engine runs). */}
      <StillShape shape="kurta" label="Rajendra in a red kurta, drawn in particles" />
    </section>
  );
}
