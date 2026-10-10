"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { contact } from "@/lib/content";
import { useDust } from "./dust/DustProvider";
import { SHAPES } from "./dust/layout";
import StillShape from "./dust/StillShape";

/**
 * Section 2. Desktop: a 160vh section with a sticky 100vh stage, so the DOM
 * overlays (the pin's hit area, the connector anchor) stay aligned with the
 * fixed dust. The connector itself is drawn by the engine from state.link.
 * Phones: in flow, the dust morphs face → Nepal when the section arrives.
 */
export default function KathmanduMotion({ children, tip }: { children: ReactNode; tip: string }) {
  const root = useRef<HTMLElement>(null);
  const { engine } = useDust();

  useGSAP(
    () => {
      const el = root.current!;
      if (!engine) return;
      const state = engine.state;
      const q = gsap.utils.selector(el);
      const stage = q(".dk-stage")[0];
      const pinHit = q(".dk-pin-hit")[0];

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        let dead = false;

        // Entrance, once.
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 60%", once: true } })
          .from(q(".dk-kicker"), { y: 20, autoAlpha: 0, duration: 0.7, ease: "power3.out" }, 0)
          .from(q(".dk-h2 .char"), { yPercent: 118, rotate: 6, duration: 1.1, stagger: 0.03, ease: "expo.out" }, 0.05)
          .from(q(".dk-dot"), { scale: 0, duration: 0.6, ease: "back.out(3)" }, 0.3)
          .to(q(".dk-coords-text"), { scrambleText: { text: contact.coords, chars: "0123456789°·NE", speed: 0.6 }, duration: 0.8, ease: "none" }, 0.3)
          .from(q(".dk-intro, .dk-label, .dk-links"), { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "power3.out" }, 0.35);

        if (desktop) {
          // Connector anchor: the end of the headline's last line, in stage px.
          const measure = () => {
            const rects = q(".dk-anchor")[0].getClientRects();
            const last = rects[rects.length - 1];
            if (!last) return;
            const s = stage.getBoundingClientRect();
            state.link.x2 = last.right - s.left + 14;
            state.link.y2 = last.top - s.top + last.height * 0.55;
            const k = engine.kathmandu();
            gsap.set(pinHit, { left: k.x - 22, top: k.y - 22 });
          };
          engine.whenReady(SHAPES.NEPAL).then(() => !dead && measure());
          ScrollTrigger.addEventListener("refresh", measure);

          // The stage rises into place: the connector's far end rides with it.
          ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "top top",
            onUpdate: (self) => void (state.link.stageY = (1 - self.progress) * window.innerHeight),
            onLeave: () => void (state.link.stageY = 0),
          });
          gsap.fromTo(state.link, { p: 0 }, { p: 1, ease: "none", immediateRender: false, scrollTrigger: { trigger: el, start: "top 35%", end: "top top", scrub: 0.6 } });

          return () => {
            dead = true;
            ScrollTrigger.removeEventListener("refresh", measure);
            state.link.p = 0;
          };
        }

        // Phones: no pin in the hero, so this is where the face becomes Nepal.
        let tw: gsap.core.Tween | undefined;
        const go = inContext(ctx, (t: number) => {
          tw?.kill();
          tw = gsap.to(state, { t, duration: 1.4, ease: "power2.inOut" });
        });
        ScrollTrigger.create({ trigger: el, start: "top 55%", onEnter: () => go(SHAPES.NEPAL), onLeaveBack: () => go(SHAPES.PORTRAIT) });
        return () => {
          dead = true;
        };
      });
    },
    { scope: root, dependencies: [engine] },
  );

  return (
    <section className="dk" ref={root} aria-labelledby="made-in-kathmandu">
      <div className="dk-stage dm-section">
        {children}
        {engine ? (
          <button type="button" className="dk-pin-hit" aria-label={tip}>
            <span className="dk-tip" role="tooltip">
              {tip}
            </span>
          </button>
        ) : (
          <StillShape shape="nepal" label="A map of Nepal drawn in particles, with an orange dot on Kathmandu." />
        )}
      </div>
    </section>
  );
}
