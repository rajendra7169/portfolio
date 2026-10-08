"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, Draggable, useGSAP, MOTION_OK, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#*";

export default function ExpHeroMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const badge = q(".xh-badge")[0] as HTMLButtonElement;

      // Flip works everywhere (and from the keyboard). Draggable swallows the
      // click that ends a drag, so a fling never flips the card by accident.
      const flip = () => {
        const on = el.classList.toggle("is-flipped");
        badge.setAttribute("aria-pressed", String(on));
      };
      badge.addEventListener("click", flip);

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, fine: `${MOTION_OK} and (hover: hover) and (pointer: fine)` }, (ctx) => {
        const { motion, fine } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        const swing = q(".xh-swing")[0];

        // Idle sway, like a badge hanging in a breeze. Recreated after every
        // swing (a killed tween can't be relied on to restart).
        let sway: gsap.core.Tween | null = null;
        const stopSway = () => {
          sway?.kill();
          sway = null;
        };
        const startSway = inContext(ctx, () => {
          stopSway();
          sway = gsap.to(swing, { keyframes: { rotation: [0, 2.4, 0, -2.4, 0], easeEach: "sine.inOut" }, duration: 5.4, ease: "none", repeat: -1 });
        });
        // Let go and it swings back through centre, losing energy each pass.
        const settle = inContext(ctx, (from: number) => {
          stopSway();
          gsap.fromTo(swing, { rotation: from }, { rotation: 0, duration: 2.4, ease: "elastic.out(1.1, 0.18)", overwrite: "auto", onComplete: startSway });
        });
        // A push from wherever it hangs now, then the same settle.
        let kicking = false;
        const kick = inContext(ctx, (to: number) => {
          if (kicking) return;
          kicking = true;
          stopSway();
          gsap.to(swing, {
            rotation: to,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: () => {
              kicking = false;
              settle(to);
            },
          });
        });

        const [drag] = Draggable.create(swing, {
          type: "rotation",
          trigger: badge,
          dragClickables: true,
          allowNativeTouchScrolling: true,
          bounds: { minRotation: -70, maxRotation: 70 },
          onPress() {
            stopSway();
            kicking = false;
            gsap.killTweensOf(swing);
            el.classList.add("is-grabbed");
          },
          onRelease() {
            el.classList.remove("is-grabbed");
            settle(this.rotation);
          },
        });

        // Scrolling gives the badge a little kick in the direction of travel.
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom top",
          onUpdate(self) {
            if (drag.isPressed) return;
            const push = gsap.utils.clamp(-18, 18, self.getVelocity() / 120);
            if (Math.abs(push) > 4) kick(push);
          },
        });

        // Intro: the badge drops in on its strap and swings to rest.
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .set(q(".xh-bg, .xh-inner"), { opacity: 1 })
          .from(q(".hx-glow"), { scale: 0.4, autoAlpha: 0, duration: 2, stagger: 0.2 }, 0)
          .from(q(".hx-floor-grid"), { rotationX: 88, autoAlpha: 0, duration: 1.8, ease: "expo.inOut" }, 0)
          .from(q(".hx-field"), { autoAlpha: 0, duration: 1.4 }, 0.2)
          .from(q(".xh-drop"), { yPercent: -120, duration: 1.1, ease: "bounce.out" }, 0.25)
          .add(() => kick(22), 0.95)
          .from(q(".xh-anchor"), { scale: 0, duration: 0.6, ease: "back.out(3)" }, 0.2)
          .from(q(".xh-eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 }, 0.2)
          .from(q(".xh-title-text"), { yPercent: 105, duration: 1.2 }, 0.3)
          .to(q(".xh-title-text"), { scrambleText: { text: "Experience", chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.3)
          .from(q(".xh-intro"), { y: 24, autoAlpha: 0, duration: 0.9 }, 0.9)
          .from(q(".xh-status"), { y: 20, autoAlpha: 0, duration: 0.8 }, 1.05)
          .from(q(".xh-stat"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.15)
          .from(q(".xh-count"), { textContent: 0, snap: { textContent: 1 }, duration: 1.4, ease: "power2.out", stagger: 0.12 }, 1.15)
          .from(q(".xh-ctas > *"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.3)
          .from(q(".xh-hint"), { autoAlpha: 0, y: 10, duration: 0.8 }, 1.8);
        afterReveal(() => intro.play());

        // Mouse: the badge leans toward the cursor; the foil follows it.
        let onMove: ((e: PointerEvent) => void) | null = null;
        let onLeave: (() => void) | null = null;
        if (fine) {
          const tilt = q(".xh-badge-tilt")[0];
          gsap.set(tilt, { transformPerspective: 900 });
          const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.6, ease: "power3.out" });
          const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.6, ease: "power3.out" });
          onMove = inContext(ctx, (e: PointerEvent) => {
            const r = tilt.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width;
            const ny = (e.clientY - r.top) / r.height;
            ry((nx - 0.5) * 24);
            rx(-(ny - 0.5) * 16);
            el.style.setProperty("--mx", `${nx * 100}%`);
            el.style.setProperty("--my", `${ny * 100}%`);
            el.style.setProperty("--fx", `${20 + nx * 60}%`);
          });
          onLeave = () => {
            ry(0);
            rx(0);
          };
          tilt.addEventListener("pointermove", onMove);
          tilt.addEventListener("pointerleave", onLeave);
        }

        return () => {
          drag.kill();
          if (onMove) q(".xh-badge-tilt")[0].removeEventListener("pointermove", onMove);
          if (onLeave) q(".xh-badge-tilt")[0].removeEventListener("pointerleave", onLeave);
        };
      }, el);

      return () => badge.removeEventListener("click", flip);
    },
    { scope: root },
  );

  return (
    <section className="xh" ref={root}>
      {children}
    </section>
  );
}
