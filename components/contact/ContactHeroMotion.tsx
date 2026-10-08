"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#*";

/** Copy text, falling back to a hidden textarea where the async clipboard is unavailable. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export default function ContactHeroMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);

      // Copy buttons work with or without motion.
      const status = el.querySelector<HTMLElement>("[data-copy-status]")!;
      const timers = new Map<HTMLElement, number>();
      const onCopy = async (e: Event) => {
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".ch-copy");
        if (!btn) return;
        const ok = await copyText(btn.dataset.copy ?? "");
        btn.textContent = ok ? "Copied ✓" : "Press Ctrl+C";
        btn.classList.toggle("is-done", ok);
        status.textContent = ok ? `${btn.getAttribute("aria-label")?.replace("Copy ", "")} copied` : "";
        window.clearTimeout(timers.get(btn));
        timers.set(
          btn,
          window.setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("is-done");
          }, 1800),
        );
      };
      el.addEventListener("click", onCopy);

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, fine: `${MOTION_OK} and (hover: hover) and (pointer: fine)` }, (ctx) => {
        const { motion, fine } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;

        // The sweep turns forever; each blip pings as the beam's leading edge passes it.
        const sweep = q(".ch-sweep")[0];
        const spin = gsap.to(sweep, { rotation: 360, duration: 4.2, ease: "none", repeat: -1 });
        const blips = q(".ch-blip").map((b) => ({ el: b, angle: Number(b.dataset.angle) }));
        let last = 0;
        const ping = () => {
          const now = (Number(gsap.getProperty(sweep, "rotation")) % 360 + 360) % 360;
          blips.forEach((b) => {
            const passed = last <= now ? b.angle > last && b.angle <= now : b.angle > last || b.angle <= now;
            if (!passed) return;
            b.el.classList.remove("is-ping");
            void b.el.offsetWidth; // restart the CSS animation
            b.el.classList.add("is-ping");
          });
          last = now;
        };
        // Only while the radar is on screen. The flag keeps the ticker from being
        // added twice (onToggle may or may not fire for a trigger that starts active).
        let running = false;
        const run = (on: boolean) => {
          if (on === running) return;
          running = on;
          if (on) {
            spin.resume();
            gsap.ticker.add(ping);
          } else {
            spin.pause();
            gsap.ticker.remove(ping);
          }
        };
        const watch = ScrollTrigger.create({
          trigger: q(".ch-stage")[0],
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => run(self.isActive),
        });
        run(watch.isActive);

        // Hovering the radar speeds the sweep up.
        const stage = q(".ch-stage")[0];
        const fast = inContext(ctx, () => gsap.to(spin, { timeScale: 2.6, duration: 0.6 }));
        const slow = inContext(ctx, () => gsap.to(spin, { timeScale: 1, duration: 0.8 }));
        stage.addEventListener("pointerenter", fast);
        stage.addEventListener("pointerleave", slow);

        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .set(q(".ch-bg, .ch-inner"), { opacity: 1 })
          .from(q(".hx-glow"), { scale: 0.4, autoAlpha: 0, duration: 2, stagger: 0.2 }, 0)
          .from(q(".hx-floor-grid"), { rotationX: 88, autoAlpha: 0, duration: 1.8, ease: "expo.inOut" }, 0)
          .from(q(".hx-field"), { autoAlpha: 0, duration: 1.4 }, 0.2)
          // Radar powers up: rings draw outward, ticks flicker on, the beam fades in.
          .from(q(".ch-ring"), { drawSVG: "50% 50%", duration: 1.2, stagger: { each: 0.12, from: "end" }, ease: "expo.inOut" }, 0.1)
          .from(q(".ch-axis"), { drawSVG: "50% 50%", duration: 1, ease: "expo.inOut" }, 0.3)
          .from(q(".ch-tick"), { autoAlpha: 0, duration: 0.01, stagger: { each: 0.008, from: "random" } }, 0.4)
          .from(sweep, { autoAlpha: 0, duration: 0.8 }, 0.9)
          .from(q(".ch-avatar-img"), { scale: 0, duration: 1, ease: "back.out(1.8)" }, 0.5)
          .from(q(".ch-onair"), { y: 14, autoAlpha: 0, duration: 0.6, ease: "back.out(2)" }, 1)
          .from(q(".ch-blip-in"), { scale: 0, duration: 0.6, stagger: 0.09, ease: "back.out(3)" }, 1)
          .from(q(".ch-chip"), { scale: 0.6, y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: "back.out(1.8)" }, 1.3)
          // Copy side.
          .from(q(".ch-eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 }, 0.2)
          .from(q(".ch-title-text"), { yPercent: 105, duration: 1.2 }, 0.3)
          .to(q(".ch-title-text"), { scrambleText: { text: "Contact Me", chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.3)
          .from(q(".ch-blurb"), { y: 24, autoAlpha: 0, duration: 0.9 }, 0.9)
          .from(q(".ch-row"), { x: -40, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.05)
          .from(q(".ch-ctas > *"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.35);
        afterReveal(() => intro.play());

        // Mouse: radar and readouts drift at their own depths.
        let onMove: ((e: PointerEvent) => void) | null = null;
        if (fine) {
          const layers = (q("[data-depth], .ch-read") as HTMLElement[]).map((node) => ({
            d: node.dataset.depth ? Number(node.dataset.depth) : 1.6,
            x: gsap.quickTo(node, "x", { duration: 1, ease: "power3.out" }),
            y: gsap.quickTo(node, "y", { duration: 1, ease: "power3.out" }),
          }));
          onMove = inContext(ctx, (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            layers.forEach((l) => {
              l.x(nx * 24 * l.d);
              l.y(ny * 18 * l.d);
            });
          });
          el.addEventListener("pointermove", onMove);
        }

        return () => {
          gsap.ticker.remove(ping);
          stage.removeEventListener("pointerenter", fast);
          stage.removeEventListener("pointerleave", slow);
          if (onMove) el.removeEventListener("pointermove", onMove);
        };
      }, el);

      return () => {
        el.removeEventListener("click", onCopy);
        timers.forEach((t) => window.clearTimeout(t));
      };
    },
    { scope: root },
  );

  return (
    <section className="ch" ref={root}>
      {children}
    </section>
  );
}
