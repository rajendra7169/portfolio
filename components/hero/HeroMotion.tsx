"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { hero } from "@/lib/content";
import { afterReveal } from "@/components/PageTransition";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}#*01";

export default function HeroMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: MOTION_OK, desktop: `${DESKTOP} and ${MOTION_OK}`, fine: `${MOTION_OK} and (hover: hover) and (pointer: fine)` },
        (ctx) => {
          const { motion, desktop, fine } = ctx.conditions as Record<string, boolean>;
          if (!motion) return;

          /* ── Always-on machinery: orbits, arcs, ticker ─────────────────── */
          const spins = [
            gsap.to(q(".hx-orbit--inner"), { rotation: 360, duration: 34, ease: "none", repeat: -1 }),
            gsap.to(q(".hx-orbit--inner .hx-orb-spin"), { rotation: -360, duration: 34, ease: "none", repeat: -1 }),
            gsap.to(q(".hx-orbit--outer"), { rotation: -360, duration: 52, ease: "none", repeat: -1 }),
            gsap.to(q(".hx-orbit--outer .hx-orb-spin"), { rotation: 360, duration: 52, ease: "none", repeat: -1 }),
            gsap.to(q(".hx-ring--arc"), { rotation: 360, svgOrigin: "300 300", duration: 5, ease: "none", repeat: -1 }),
            gsap.to(q(".hx-ring--arc2"), { rotation: -360, svgOrigin: "300 300", duration: 9, ease: "none", repeat: -1 }),
            gsap.to(q(".hx-ring--dash"), { rotation: 360, svgOrigin: "300 300", duration: 60, ease: "none", repeat: -1 }),
          ];
          const ticker = gsap.to(q(".hx-marquee-track"), { xPercent: -50, duration: 40, ease: "none", repeat: -1 });

          // Hovering the stage spins everything up.
          const stage = q(".hx-stage")[0] as HTMLElement;
          const rev = inContext(ctx, (speed: number) => [...spins, ticker].forEach((t) => gsap.to(t, { timeScale: speed, duration: 0.8, ease: "power2.out" })));
          const onEnter = () => rev(3.5);
          const onLeave = () => rev(1);
          stage.addEventListener("pointerenter", onEnter);
          stage.addEventListener("pointerleave", onLeave);

          // Scroll speed pushes the ticker; it eases back to cruising.
          ScrollTrigger.create({
            trigger: el,
            start: "top top",
            end: "bottom top",
            onUpdate: inContext(ctx, (self: ScrollTrigger) => {
              const v = Math.min(Math.abs(self.getVelocity()) / 250, 6);
              gsap.to(ticker, { timeScale: self.direction * (1 + v), duration: 0.2, overwrite: true });
              gsap.to(ticker, { timeScale: 1, duration: 1.4, delay: 0.25, ease: "power2.out" });
            }),
          });

          /* ── Intro: built now (so nothing flashes), played as the curtain opens ── */
          const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
          // CSS pre-hides these wrappers (no flash before hydration); nothing else animates them.
          intro
            .set(q(".hx-bg, .hx-inner"), { opacity: 1 })
            .from(q(".hx-glow"), { scale: 0.4, autoAlpha: 0, duration: 2, stagger: 0.2 }, 0)
            .from(q(".hx-floor-grid"), { rotationX: 88, autoAlpha: 0, duration: 1.8, ease: "expo.inOut" }, 0)
            .from(q(".hx-field"), { autoAlpha: 0, duration: 1.6 }, 0.2)
            // Stage: disc blooms, rings draw, photo rises, logos pop onto their orbits.
            .from(q(".hx-disc"), { scale: 0, duration: 1.4, ease: "elastic.out(1, 0.6)" }, 0.1)
            // DrawSVG rewrites the dash pattern, so only the solid ring draws on; patterned rings zoom in.
            .from(q(".hx-ring--solid"), { drawSVG: "50% 50%", duration: 1.6, ease: "expo.inOut" }, 0.15)
            .from(q(".hx-ring--dash, .hx-ring--dots"), { scale: 0.6, svgOrigin: "300 300", autoAlpha: 0, duration: 1.4, stagger: 0.15 }, 0.2)
            .from(q(".hx-ring--arc"), { autoAlpha: 0, duration: 1 }, 0.9)
            .from(q(".hx-tick"), { autoAlpha: 0, duration: 0.02, stagger: { each: 0.012, from: "start" } }, 0.3)
            .from(q(".hx-photo"), { yPercent: 18, autoAlpha: 0, scale: 0.94, duration: 1.6 }, 0.35)
            .from(q(".hx-orb-pop"), { scale: 0, autoAlpha: 0, duration: 0.8, ease: "back.out(2.4)", stagger: 0.07 }, 0.8)
            .from(q(".hx-bracket"), { scale: 0.3, autoAlpha: 0, duration: 0.9, stagger: 0.06 }, 0.9)
            .from(q(".hx-chip"), { scale: 0.6, y: 30, autoAlpha: 0, duration: 1, ease: "back.out(1.8)", stagger: 0.15 }, 1.2)
            // Copy: greeting scrambles in, then the name decodes line by line.
            .from(q(".hx-eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 }, 0.2)
            .from(q(".hx-hello"), { scrambleText: { text: " ", chars: "lowerCase", speed: 0.6 }, duration: 0.8 }, 0.3)
            .from(q(".hx-wave"), { rotation: -40, scale: 0, duration: 1, ease: "elastic.out(1, 0.4)" }, 0.4)
            .from(q(".hx-line"), { yPercent: 105, duration: 1.2, stagger: 0.12 }, 0.35)
            .to(q(".hx-line--a"), { scrambleText: { text: hero.first, chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.35)
            .to(q(".hx-line--b"), { scrambleText: { text: hero.last, chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.5)
            .from(q(".hx-build"), { y: 24, autoAlpha: 0, duration: 0.9 }, 1.1)
            .from(q(".hx-intro"), { y: 24, autoAlpha: 0, duration: 0.9 }, 1.2)
            .from(q(".hx-socials li"), { scale: 0, autoAlpha: 0, duration: 0.6, ease: "back.out(2.5)", stagger: 0.05 }, 1.3)
            .from(q(".hx-ctas > *"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.5)
            .from(q(".hx-stat"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.6)
            .from(q(".hx-count"), { textContent: 0, snap: { textContent: 1 }, duration: 1.6, ease: "power2.out", stagger: 0.15 }, 1.6)
            // fromTo: these start at CSS opacity 0, so a plain from() would animate 0 → 0.
            .fromTo(q(".hx-marquee-in"), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1 }, 1.6)
            .fromTo(q(".hx-cue-in"), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 2)
            .from(q(".hx-cyber-hint"), { y: 14, autoAlpha: 0, duration: 0.9, ease: "back.out(2)" }, 2.3);

          // After the intro: "I build …" cycles, decoding each phrase.
          const builds = gsap.timeline({ paused: true, repeat: -1 });
          hero.builds.forEach((_, i) => {
            const next = hero.builds[(i + 1) % hero.builds.length];
            builds
              .to({}, { duration: 2.2 })
              .to(q(".hx-build-text"), { scrambleText: { text: next, chars: "lowerCase", speed: 0.7 }, duration: 0.9, ease: "none" });
          });
          intro.eventCallback("onComplete", () => void builds.play());

          afterReveal(() => intro.play());

          /* ── Cursor: stage tilts in 3D, layers drift at their own depth, light follows ── */
          let onMove: ((e: PointerEvent) => void) | null = null;
          if (fine) {
            const tiltX = gsap.quickTo(q(".hx-tilt"), "rotationX", { duration: 0.9, ease: "power3.out" });
            const tiltY = gsap.quickTo(q(".hx-tilt"), "rotationY", { duration: 0.9, ease: "power3.out" });
            const layers = (q("[data-depth]") as HTMLElement[]).map((node) => ({
              d: Number(node.dataset.depth),
              x: gsap.quickTo(node, "x", { duration: 1, ease: "power3.out" }),
              y: gsap.quickTo(node, "y", { duration: 1, ease: "power3.out" }),
            }));
            const spot = q(".hx-spot")[0];
            const spotX = gsap.quickTo(spot, "x", { duration: 0.6, ease: "power3.out" });
            const spotY = gsap.quickTo(spot, "y", { duration: 0.6, ease: "power3.out" });

            onMove = inContext(ctx, (e: PointerEvent) => {
              const r = el.getBoundingClientRect();
              const nx = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
              const ny = (e.clientY - r.top) / r.height - 0.5;
              tiltY(nx * 14);
              tiltX(-ny * 10);
              layers.forEach((l) => {
                l.x(nx * 28 * l.d);
                l.y(ny * 22 * l.d);
              });
              spotX(e.clientX - r.left);
              spotY(e.clientY - r.top);
            });
            el.addEventListener("pointermove", onMove);
          }

          /* ── Scroll exit (desktop): pin the hero and take it apart ───────── */
          if (desktop) {
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: el, start: "top top", end: "+=75%", scrub: 0.6, pin: true, refreshPriority: 1 },
              })
              .to(q(".hx-copy"), { y: -140, autoAlpha: 0 }, 0)
              .to(q(".hx-stage"), { scale: 0.72, y: -40 }, 0)
              .to(q(".hx-rings-wrap"), { scale: 1.9, autoAlpha: 0 }, 0)
              .to(q(".hx-orbit--outer, .hx-orbit--inner"), { scale: 1.6, autoAlpha: 0 }, 0)
              .to(q(".hx-chip-pos--a"), { x: -260, y: -120, autoAlpha: 0, rotation: -12 }, 0)
              .to(q(".hx-chip-pos--b"), { x: 280, y: -60, autoAlpha: 0, rotation: 10 }, 0)
              .to(q(".hx-chip-pos--c"), { x: 220, y: 140, autoAlpha: 0, rotation: 8 }, 0)
              .to(q(".hx-floor"), { yPercent: 30, autoAlpha: 0 }, 0)
              .to(q(".hx-marquee, .hx-cue"), { y: 80, autoAlpha: 0 }, 0)
              .to(q(".hx-stage"), { autoAlpha: 0, duration: 0.35 }, 0.65);
          } else {
            // Phones: no pin, just a light parallax as it scrolls away.
            gsap.to(q(".hx-stage"), { yPercent: -5, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
          }

          return () => {
            if (onMove) el.removeEventListener("pointermove", onMove);
            stage.removeEventListener("pointerenter", onEnter);
            stage.removeEventListener("pointerleave", onLeave);
          };
        },
        el,
      );
    },
    { scope: root },
  );

  return (
    <section className="hx" ref={root}>
      {children}
    </section>
  );
}
