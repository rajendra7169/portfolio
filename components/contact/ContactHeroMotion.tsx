"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, Draggable, useGSAP, MOTION_OK, inContext } from "@/lib/gsap";
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
        // Only the copy buttons: match on the data attribute, not a class that could be reused.
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-copy]");
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

      // The seconds hand runs on real time, the same in Kathmandu as anywhere.
      const sec = q(".cc-sec")[0] as HTMLElement;
      const now = new Date();
      sec.style.animationDelay = `-${now.getSeconds() + now.getMilliseconds() / 1000}s`;

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, fine: `${MOTION_OK} and (hover: hover) and (pointer: fine)` }, (ctx) => {
        const { motion, fine } = ctx.conditions as Record<string, boolean>;

        // ── The clock: one thick hand, pointing at one channel at a time.
        const stage = q(".ch-stage")[0] as HTMLElement;
        const hand = q(".cc-hand")[0] as HTMLElement;
        const wedge = q(".cc-wedge")[0] as HTMLElement;
        const label = q(".cc-hand-name")[0] as HTMLElement;
        const marks = q(".cc-mark") as HTMLAnchorElement[];
        const nowLink = q(".cc-now")[0] as HTMLAnchorElement;
        const nowName = q(".cc-now-name")[0];
        const nowHandle = q(".cc-now-handle")[0];
        const HOUR = 360 / marks.length;
        let on = 0;
        let rot = 0; // the hand's rotation, unwrapped, so a tick always turns forwards
        const theme = (i: number) => {
          const m = marks[i];
          stage.style.setProperty("--cc", m.dataset.c!);
          stage.style.setProperty("--cc2", m.dataset.c2!);
          stage.dataset.on = String(i);
          marks.forEach((x, j) => x.classList.toggle("is-on", j === i));
          if (i !== on || label.textContent !== m.dataset.name) {
            label.textContent = m.dataset.name!;
            label.classList.remove("is-paint");
            void label.offsetWidth; // repaint the name from scratch
            label.classList.add("is-paint");
          }
          // On the left half of the dial the name turns over, so it never reads upside down.
          hand.classList.toggle("is-flip", i * HOUR > 180);
          nowLink.href = m.href;
          nowLink.target = m.target;
          nowName.textContent = m.dataset.name!;
          nowHandle.textContent = m.dataset.handle!;
          on = i;
        };
        const point = (i: number, tick = false) => {
          let d = ((((i * HOUR - rot) % 360) + 540) % 360) - 180;
          if (tick && d <= 0) d += 360;
          rot += d;
          theme(i);
          if (!motion) return void gsap.set([hand, wedge], { rotation: rot });
          gsap.to([hand, wedge], tick ? { rotation: rot, duration: 1, ease: "elastic.out(1, 0.42)", overwrite: true } : { rotation: rot, duration: 0.6, ease: "back.out(1.5)", overwrite: true });
        };
        gsap.set([hand, wedge], { rotation: 0 });
        theme(0);

        // It ticks round by itself while on screen, and waits while someone's using it.
        let shown = false;
        let held = false;
        let quietTill = 0;
        const quiet = () => (quietTill = Date.now() + 6000);
        // (It starts once the intro has spun the hand in. The wait between ticks is a
        // timer, not a delayed tween, so GSAP's ticker can sleep through it.)
        let waiting = 0;
        const step = inContext(ctx, () => {
          if (shown && !held && Date.now() > quietTill && !document.hidden) point((on + 1) % marks.length, true);
          waiting = window.setTimeout(step, 2800);
        });
        const tick = motion
          ? {
              restart: () => {
                clearTimeout(waiting);
                waiting = window.setTimeout(step, 2800);
              },
              kill: () => clearTimeout(waiting),
            }
          : null;
        const watch = ScrollTrigger.create({
          trigger: stage,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (shown = self.isActive),
        });
        shown = watch.isActive;

        // Hover or tab to a channel, and the hand swings to it.
        const toMark = inContext(ctx, (e: Event) => {
          const m = (e.target as Element).closest<HTMLElement>(".cc-mark");
          if (!m) return;
          quiet();
          if (+m.dataset.i! !== on) point(+m.dataset.i!);
        });
        const clock = q(".cc")[0] as HTMLElement;
        clock.addEventListener("focusin", toMark);
        if (fine) clock.addEventListener("pointerover", toMark);
        const hold = () => (held = true);
        const letGo = () => ((held = false), quiet());
        stage.addEventListener("pointerenter", hold);
        stage.addEventListener("pointerleave", letGo);

        // Drag the hand round: the clock changes colour as it passes each channel,
        // and settles on the nearest one. A tap on the hand opens that channel.
        let drag: Draggable;
        const nearest = (r: number) => ((Math.round(r / HOUR) % marks.length) + marks.length) % marks.length;
        [drag] = Draggable.create(hand, {
          type: "rotation",
          onPress: inContext(ctx, () => {
            held = true;
            gsap.killTweensOf([hand, wedge]);
          }),
          onDrag: inContext(ctx, () => {
            gsap.set(wedge, { rotation: drag.rotation });
            const i = nearest(drag.rotation);
            if (i !== on) theme(i);
          }),
          onRelease: inContext(ctx, () => {
            rot = drag.rotation;
            point(nearest(rot));
            letGo();
          }),
          onClick: inContext(ctx, () => {
            const m = marks[on];
            if (m.target === "_blank") window.open(m.href, "_blank", "noopener");
            else location.href = m.href;
          }),
        });

        if (!motion)
          return () => {
            drag.kill();
            clock.removeEventListener("focusin", toMark);
            stage.removeEventListener("pointerenter", hold);
            stage.removeEventListener("pointerleave", letGo);
          };

        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .set(q(".ch-bg, .ch-inner"), { opacity: 1 })
          .from(q(".hx-glow"), { scale: 0.4, autoAlpha: 0, duration: 2, stagger: 0.2 }, 0)
          .from(q(".hx-floor-grid"), { rotationX: 88, autoAlpha: 0, duration: 1.8, ease: "expo.inOut" }, 0)
          .from(q(".hx-field"), { autoAlpha: 0, duration: 1.4 }, 0.2)
          // The clock winds up: the dial grows, the minutes flicker on, the hours pop
          // in round the face, and the hand spins once before it lands.
          .from(q(".cc-bezel, .cc-face"), { scale: 0.6, autoAlpha: 0, duration: 1.4, stagger: 0.08 }, 0.1)
          .from(q(".cc-tick"), { autoAlpha: 0, duration: 0.01, stagger: { each: 0.012, from: "random" } }, 0.5)
          .from(q(".ch-avatar-img"), { scale: 0, duration: 1, ease: "back.out(1.8)" }, 0.5)
          .from(q(".ch-onair"), { y: 14, autoAlpha: 0, duration: 0.6, ease: "back.out(2)" }, 1)
          .from(q(".cc-mark-in"), { scale: 0, duration: 0.6, stagger: 0.09, ease: "back.out(3)" }, 0.9)
          .fromTo([hand, wedge], { rotation: -360 }, { rotation: 0, duration: 1.8, ease: "elastic.out(1, 0.5)", immediateRender: false }, 1.1)
          .from(q(".cc-sec, .cc-time"), { autoAlpha: 0, duration: 0.6 }, 1.6)
          .from(q(".ch-chip"), { scale: 0.6, y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: "back.out(1.8)" }, 1.3)
          // Copy side.
          .from(q(".ch-eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 }, 0.2)
          .from(q(".ch-title-text"), { yPercent: 105, duration: 1.2 }, 0.3)
          .to(q(".ch-title-text"), { scrambleText: { text: "Contact Me", chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.3)
          .from(q(".ch-blurb"), { y: 24, autoAlpha: 0, duration: 0.9 }, 0.9)
          .from(q(".ch-row"), { x: -40, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.05)
          .from(q(".ch-ctas > *"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.35)
          .add(() => tick?.restart());
        afterReveal(() => intro.play());

        // Mouse: the clock and its readouts drift at their own depths.
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
          drag.kill();
          tick?.kill();
          clock.removeEventListener("focusin", toMark);
          clock.removeEventListener("pointerover", toMark);
          stage.removeEventListener("pointerenter", hold);
          stage.removeEventListener("pointerleave", letGo);
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
