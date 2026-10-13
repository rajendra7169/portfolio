"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#*";

export default function EduHeroMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, fine: `${MOTION_OK} and (hover: hover) and (pointer: fine)` }, (ctx) => {
        const { motion, fine } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;

        // The seal turns slowly; its text ring turns the other way. (Web Animations of
        // transform on the svg layers: run by the browser on the GPU, nothing to do
        // per frame. On svg elements only transform goes to the GPU, not rotate.)
        const turn = (sel: string, turns: number, seconds: number) =>
          q(sel).map((n) => n.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${turns * 360}deg)` }], { duration: seconds * 1000, iterations: Infinity }));
        const spins = [...turn(".eh-seal-layer--text", 1, 40), ...turn(".eh-seal-layer--rosette", -1, 90)];
        const rate = { v: 1 };
        // Off screen, they rest.
        ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (self) => spins.forEach((a) => (self.isActive ? a.play() : a.pause())) });

        // Confetti: every piece launches from the cap with its own velocity and angle.
        const burst = inContext(ctx, () => {
          const pieces = q(".eh-confetti i");
          gsap.killTweensOf(pieces);
          gsap.set(pieces, { x: 0, y: 0, rotation: 0, autoAlpha: 1, scale: () => gsap.utils.random(0.6, 1.2) });
          gsap.to(pieces, {
            duration: () => gsap.utils.random(1.4, 2.2),
            physics2D: { velocity: () => gsap.utils.random(320, 720), angle: () => gsap.utils.random(200, 340), gravity: 900 },
            rotation: () => gsap.utils.random(-540, 540),
            ease: "none",
          });
          gsap.to(pieces, { autoAlpha: 0, duration: 0.5, delay: () => gsap.utils.random(1, 1.6) });
        });

        // Toss: the cap flies up spinning, lands with a squash, and the confetti pops.
        const toss = inContext(ctx, () => {
          const cap = q(".eh-cap");
          gsap.killTweensOf(cap); // a second click restarts the toss cleanly
          gsap.set(cap, { autoAlpha: 1 }); // in case that cut the intro's fade-in short
          gsap
            .timeline()
            .to(cap, { y: "-38%", rotation: -14, duration: 0.45, ease: "power2.out" })
            .to(cap, { rotation: 346, duration: 0.9, ease: "power1.inOut" }, 0)
            .to(cap, { y: "0%", duration: 0.45, ease: "power2.in" }, 0.45)
            .add(burst, 0.88)
            .to(cap, { scaleY: 0.9, scaleX: 1.06, duration: 0.1, ease: "power1.out" }, 0.9)
            .to(cap, { scaleY: 1, scaleX: 1, rotation: 360, duration: 0.6, ease: "elastic.out(1, 0.4)" })
            .set(cap, { rotation: 0 });
          gsap.to(rate, { v: 5, duration: 0.3, yoyo: true, repeat: 1, repeatDelay: 0.4, overwrite: true, onUpdate: () => spins.forEach((a) => a.updatePlaybackRate(rate.v)) });
        });
        const tossBtn = q(".eh-toss")[0];
        tossBtn.addEventListener("click", toss);

        // Intro, played as the curtain opens.
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" }, onComplete: toss });
        intro
          .set(q(".eh-bg, .eh-inner"), { opacity: 1 })
          .from(q(".hx-glow"), { scale: 0.4, autoAlpha: 0, duration: 2, stagger: 0.2 }, 0)
          .from(q(".hx-floor-grid"), { rotationX: 88, autoAlpha: 0, duration: 1.8, ease: "expo.inOut" }, 0)
          .from(q(".hx-field"), { autoAlpha: 0, duration: 1.4 }, 0.2)
          .from(q(".eh-seal"), { scale: 0.2, rotation: -120, autoAlpha: 0, duration: 1.6, ease: "elastic.out(1, 0.55)" }, 0.1)
          .from(q(".eh-ribbon"), { scaleY: 0, duration: 0.9, stagger: 0.1, ease: "back.out(2)" }, 0.7)
          .from(q(".eh-cap"), { y: "-60%", autoAlpha: 0, duration: 1.1, ease: "bounce.out" }, 0.5)
          .from(q(".eh-chip"), { scale: 0.6, y: 30, autoAlpha: 0, duration: 1, ease: "back.out(1.8)", stagger: 0.15 }, 1.1)
          .from(q(".eh-eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 }, 0.2)
          .from(q(".eh-title-text"), { yPercent: 105, duration: 1.2 }, 0.3)
          .to(q(".eh-title-text"), { scrambleText: { text: "Education", chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.3)
          .from(q(".eh-sub"), { y: 24, autoAlpha: 0, duration: 0.9 }, 0.9)
          .from(q(".eh-stat"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.05)
          .from(q(".eh-count"), { textContent: 0, snap: { textContent: 1 }, duration: 1.4, ease: "power2.out", stagger: 0.12 }, 1.05)
          .from(q(".eh-arena-label"), { autoAlpha: 0, duration: 0.6 }, 1.2)
          .from(q(".eh-arena li"), { x: -40, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 1.25);
        afterReveal(() => intro.play());

        // Cursor: the stage tilts and each layer drifts at its own depth.
        let onMove: ((e: PointerEvent) => void) | null = null;
        if (fine) {
          const tiltX = gsap.quickTo(q(".eh-tilt"), "rotationX", { duration: 0.9, ease: "power3.out" });
          const tiltY = gsap.quickTo(q(".eh-tilt"), "rotationY", { duration: 0.9, ease: "power3.out" });
          const layers = (q("[data-depth]") as HTMLElement[]).map((node) => ({
            d: Number(node.dataset.depth),
            x: gsap.quickTo(node, "x", { duration: 1, ease: "power3.out" }),
            y: gsap.quickTo(node, "y", { duration: 1, ease: "power3.out" }),
          }));
          onMove = inContext(ctx, (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            tiltY(nx * 12);
            tiltX(-ny * 9);
            layers.forEach((l) => {
              l.x(nx * 26 * l.d);
              l.y(ny * 20 * l.d);
            });
          });
          el.addEventListener("pointermove", onMove);
        }

        // Scrolling away: the stage drifts up slower than the page.
        gsap.to(q(".eh-stage"), { yPercent: -10, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });

        return () => {
          spins.forEach((a) => a.cancel());
          tossBtn.removeEventListener("click", toss);
          if (onMove) el.removeEventListener("pointermove", onMove);
        };
      }, el);
    },
    { scope: root },
  );

  return (
    <section className="eh" ref={root}>
      {children}
    </section>
  );
}
