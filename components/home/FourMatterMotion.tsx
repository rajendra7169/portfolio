"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { useLenis } from "@/components/SmoothScroll";
import { useDust } from "./dust/DustProvider";
import { SHAPES } from "./dust/layout";
import StillShape from "./dust/StillShape";

/**
 * Section 5: mitosis. The globe pinches (shape 5) and divides into four cells
 * (6..9). Desktop pins for three screens and steps through the skills; the
 * rail buttons sit exactly on the dust discs (§4.5).
 */
export default function FourMatterMotion({ children, labels }: { children: ReactNode; labels: string[] }) {
  const root = useRef<HTMLElement>(null);
  const { engine } = useDust();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(
    () => {
      const el = root.current!;
      if (!engine) return;
      const state = engine.state;
      const q = gsap.utils.selector(el);
      const steps = q(".dc-step");
      const btns = q(".dc-rail-btn") as HTMLButtonElement[];

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        const offs: (() => void)[] = [];
        let cur = 0;

        const mark = (i: number) => {
          steps.forEach((s, k) => s.classList.toggle("is-live", k === i));
          btns.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
        };

        /* ── Step swap: the old title leaves upward, the new one rises in ─── */
        const show = inContext(ctx, (i: number) => {
          if (i === cur) return;
          const dir = i > cur ? 1 : -1;
          const prev = steps[cur], next = steps[i];
          cur = i;
          mark(i);
          gsap.to(prev.querySelectorAll(".char"), { yPercent: -115 * dir, rotate: 0, duration: 0.35, ease: "power2.in", overwrite: true });
          gsap.to(prev.querySelectorAll(".dc-fade, .dc-ic"), { autoAlpha: 0, y: -16 * dir, duration: 0.3, ease: "power2.in", overwrite: true });
          gsap.to(prev, { autoAlpha: 0, duration: 0, delay: 0.36, overwrite: true });
          gsap.to(next, { autoAlpha: 1, duration: 0, overwrite: true });
          gsap.fromTo(next.querySelectorAll(".char"), { yPercent: 115 * dir, rotate: 0 }, { yPercent: 0, duration: 0.9, stagger: 0.014, delay: 0.2, ease: "expo.out", overwrite: true });
          gsap.fromTo(next.querySelectorAll(".dc-fade"), { autoAlpha: 0, y: 16 * dir }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, delay: 0.3, ease: "power3.out", overwrite: true });
          gsap.fromTo(next.querySelectorAll(".dc-ic"), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.02, delay: 0.35, ease: "back.out(2)", overwrite: true });
          gsap.to(next.querySelector(".dc-num"), { scrambleText: { text: `0${i + 1}`, chars: "0123456789", speed: 0.8 }, duration: 0.6, ease: "none" });
        });

        if (desktop) {
          // Stack the steps; only the live one shows.
          gsap.set(steps, { autoAlpha: (k: number) => (k === 0 ? 1 : 0) });
          mark(0);

          // Rail buttons sit on the dust's rail discs; the track joins them.
          const place = () => {
            const slots = engine.layout.rail();
            btns.forEach((b, k) => gsap.set(b, { left: slots[k].x - slots[k].r, top: slots[k].y - slots[k].r, width: slots[k].r * 2, height: slots[k].r * 2 }));
            gsap.set(q(".dc-rail-track"), { left: slots[0].x - 1, top: slots[0].y, height: slots[3].y - slots[0].y });
          };
          place();
          ScrollTrigger.addEventListener("refresh", place);
          offs.push(() => ScrollTrigger.removeEventListener("refresh", place));

          // Entry: globe → pinch → four cells while the section rises.
          gsap
            .timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: 0.8 } })
            .fromTo(state, { t: SHAPES.GLOBE }, { t: SHAPES.PINCH, duration: 0.5, ease: "power3.inOut", immediateRender: false }, 0)
            .fromTo(state, { t: SHAPES.PINCH }, { t: SHAPES.CELLS, duration: 0.5, ease: "power2.out", immediateRender: false }, 0.5);

          // Pin: hold each cell, then divide into the next.
          const fill = q(".dc-rail-fill")[0];
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=300%",
              scrub: 0.8,
              pin: true,
              refreshPriority: 6,
              onUpdate: (self) => {
                gsap.set(fill, { scaleY: self.progress });
                show(Math.min(3, Math.floor(self.progress * 4)));
              },
            },
          });
          for (let k = 1; k < 4; k++) tl.fromTo(state, { t: SHAPES.CELLS + k - 1 }, { t: SHAPES.CELLS + k, duration: 0.12, immediateRender: false }, 0.19 + 0.25 * (k - 1));
          tl.to({}, { duration: 0.19 }, 0.81);
          const pin = tl.scrollTrigger!;

          const jump = (i: number) => {
            const y = pin.start + (pin.end - pin.start) * ((i + 0.5) / 4);
            const l = lenisRef.current;
            if (l) l.scrollTo(y, { duration: 1.2 });
            else window.scrollTo({ top: y, behavior: "smooth" });
          };
          btns.forEach((b, k) => {
            const fn = () => jump(k);
            b.addEventListener("click", fn);
            offs.push(() => b.removeEventListener("click", fn));
          });

          // Headline of step 0 on arrival.
          gsap.from(steps[0].querySelectorAll(".char"), { yPercent: 118, rotate: 6, duration: 1.1, stagger: 0.03, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 60%", once: true } });
          gsap.from(steps[0].querySelectorAll(".dc-fade, .dc-ic"), { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.04, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 55%", once: true } });
        } else {
          // Phones: four blocks in flow; each calls its cell. The first one runs the mitosis.
          let tw: gsap.core.Animation | undefined;
          const go = inContext(ctx, (t: number, i: number) => {
            tw?.kill();
            mark(i);
            if (i === 0 && t === SHAPES.CELLS && state.t < SHAPES.PINCH)
              tw = gsap.timeline().to(state, { t: SHAPES.PINCH, duration: 0.7, ease: "power3.inOut" }).to(state, { t: SHAPES.CELLS, duration: 0.7, ease: "power2.out" });
            else tw = gsap.to(state, { t, duration: 1.4, ease: "power2.inOut" });
          });
          steps.forEach((s, i) => {
            ScrollTrigger.create({
              trigger: s,
              start: "top 55%",
              onEnter: () => go(SHAPES.CELLS + i, i),
              onLeaveBack: () => (i === 0 ? go(SHAPES.GLOBE, 0) : go(SHAPES.CELLS + i - 1, i - 1)),
            });
            gsap.from(s.querySelectorAll(".char"), { yPercent: 118, rotate: 6, duration: 1.1, stagger: 0.03, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 75%", once: true } });
          });
        }

        return () => {
          offs.forEach((fn) => fn());
          steps.forEach((s, k) => s.classList.toggle("is-live", k === 0));
        };
      });
    },
    { scope: root, dependencies: [engine] },
  );

  return (
    <section className="dc dm-section" ref={root} aria-label="What I do: four kinds of matter">
      {children}
      {engine ? (
        <div className="dc-rail" role="group" aria-label="Skills">
          <span className="dc-rail-track" aria-hidden="true">
            <span className="dc-rail-fill" />
          </span>
          {labels.map((l, i) => (
            <button type="button" className="dc-rail-btn" data-i={i} key={l} aria-label={`Skill ${i + 1}: ${l}`} aria-current={i === 0 ? "step" : undefined}>
              <span className="dc-rail-no" aria-hidden="true">
                0{i + 1}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <StillShape shape="cells-row" label="Four silhouettes drawn in particles: a laptop, a cloud, a design canvas and a video timeline." />
      )}
    </section>
  );
}
