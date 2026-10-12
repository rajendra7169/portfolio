"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, Draggable, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
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

      // Text the lanyard passes behind turns light. The strap's two end markers give
      // its centre line on screen; widened to the strap, that outline clips the ink
      // copies of the hero text and of the header bar. Redrawn every frame while the
      // hero is on screen, so it follows the swing.
      const header = document.querySelector<HTMLElement>(".header");
      const inks = [q(".xh-ink")[0] as HTMLElement, header].filter(Boolean) as HTMLElement[];
      const [ends0, ends1] = [q(".xh-strap-a")[0], q(".xh-strap-b")[0]];
      const strap = q(".xh-strap")[0] as HTMLElement;
      const wide = matchMedia(DESKTOP);
      const drawInk = () => {
        const a = ends0.getBoundingClientRect();
        const b = ends1.getBoundingClientRect();
        const len = Math.hypot(b.left - a.left, b.top - a.top) || 1;
        const [ux, uy] = [(b.left - a.left) / len, (b.top - a.top) / len];
        const half = strap.offsetWidth / 2;
        const [nx, ny] = [-uy * half, ux * half];
        // On a desktop the lanyard hangs from the top of the screen: run its top end
        // well past the edge. On a phone it starts at its clip under the buttons.
        const over = wide.matches ? 300 : 0;
        const [ax, ay] = [a.left - ux * over, a.top - uy * over];
        const pts = [
          [ax + nx, ay + ny],
          [b.left + nx, b.top + ny],
          [b.left - nx, b.top - ny],
          [ax - nx, ay - ny],
        ];
        for (const t of inks) {
          const r = t.getBoundingClientRect();
          t.style.setProperty("--ink", `polygon(${pts.map(([x, y]) => `${(x - r.left).toFixed(1)}px ${(y - r.top).toFixed(1)}px`).join(", ")})`);
        }
      };
      const inkOn = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? gsap.ticker.add(drawInk) : gsap.ticker.remove(drawInk)),
      });
      drawInk();

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP, fine: `${MOTION_OK} and (hover: hover) and (pointer: fine)` }, (ctx) => {
        const { motion, desktop, fine } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        const swing = q(".xh-swing")[0];
        const tilt = q(".xh-badge-tilt")[0] as HTMLElement;

        // The swings below are made for a desktop, where the card hangs about 500px
        // under its pivot across half a wide screen. On a phone there is far less
        // room either side, so every angle is scaled to keep the card's travel to a
        // tenth of the screen's width, and it never swings up over the buttons.
        const reach = () => Math.max(1, tilt.offsetTop + tilt.offsetHeight / 2);
        const k = () => (desktop ? 1 : Math.min(1, (innerWidth * 0.1) / reach() / Math.sin((22 * Math.PI) / 180)));
        const period = () => (desktop ? 5.4 : 5.4 * gsap.utils.clamp(1, 1.5, Math.sqrt(reach() / 470)));

        // Idle sway, like a badge hanging in a breeze. Recreated after every
        // swing (a killed tween can't be relied on to restart).
        let sway: gsap.core.Tween | null = null;
        const stopSway = () => {
          sway?.kill();
          sway = null;
        };
        const startSway = inContext(ctx, () => {
          stopSway();
          const a = 2.4 * k();
          sway = gsap.to(swing, { keyframes: { rotation: [0, a, 0, -a, 0], easeEach: "sine.inOut" }, duration: period(), ease: "none", repeat: -1 });
        });
        // Let go and it swings back through centre, losing energy each pass.
        const settle = inContext(ctx, (from: number) => {
          stopSway();
          gsap.fromTo(swing, { rotation: from }, { rotation: 0, duration: 2.4 * (period() / 5.4), ease: "elastic.out(1.1, 0.18)", overwrite: "auto", onComplete: startSway });
        });
        // A push from wherever it hangs now (in desktop degrees), then the same settle.
        let kicking = false;
        const kick = inContext(ctx, (by: number) => {
          if (kicking) return;
          kicking = true;
          stopSway();
          const to = by * k();
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
          bounds: { minRotation: -70 * k(), maxRotation: 70 * k() },
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

        // The phone turned, or the window resized: the reach, and so the limits, change.
        const rebound = () => drag.applyBounds({ minRotation: -70 * k(), maxRotation: 70 * k() });
        ScrollTrigger.addEventListener("refresh", rebound);

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
          // (On a phone the strap starts under the buttons: a short drop, faded in, so it never crosses them.)
          .from(q(".xh-drop"), desktop ? { yPercent: -120, duration: 1.1, ease: "bounce.out" } : { yPercent: -18, autoAlpha: 0, duration: 1, ease: "bounce.out" }, 0.25)
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
          ScrollTrigger.removeEventListener("refresh", rebound);
          if (onMove) tilt.removeEventListener("pointermove", onMove);
          if (onLeave) tilt.removeEventListener("pointerleave", onLeave);
        };
      }, el);

      return () => {
        badge.removeEventListener("click", flip);
        gsap.ticker.remove(drawInk);
        inkOn.kill();
        header?.style.removeProperty("--ink");
      };
    },
    { scope: root },
  );

  return (
    <section className="xh" ref={root}>
      {children}
    </section>
  );
}
