"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, Draggable, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { useDust } from "@/components/home/dust/DustProvider";
import { layout, SHAPES } from "@/components/home/dust/layout";
import StillShape from "@/components/home/dust/StillShape";

const SPIN_MAX = 0.12; // rad/frame, either direction
const DRAG_GAIN = 0.0025; // rad per dragged px
const KEY_KICK = 0.02;
const clampSpin = gsap.utils.clamp(-SPIN_MAX, SPIN_MAX);

/**
 * Section 4: the dust is a spinning globe (engine shape 4). This drives
 * state.t (entry scrub 3 → 4, then pinned +=120%), state.arcs (the listener
 * arcs draw in over the first 15% of the pin) and state.dragVel through a
 * Draggable proxy and the arrow keys. The hit button sits on the globe rect.
 */
export default function ListenTogetherMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const hit = useRef<HTMLButtonElement>(null);
  const { engine } = useDust();

  useGSAP(
    () => {
      const el = root.current!;
      const btn = hit.current;
      if (!engine || !btn) return; // reduced motion (or not mounted yet): nothing moves, no triggers
      const state = engine.state;
      const q = gsap.utils.selector(el);

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        let dead = false;

        // The hit area covers the globe rect (viewport px). While the section is
        // pinned at the top, its origin is the viewport origin, so absolute
        // left/top from the layout line up; phones use position: fixed instead.
        const place = () => {
          const g = layout(window.innerWidth, window.innerHeight, !desktop).globe();
          gsap.set(btn, { left: g.x - g.r, top: g.y - g.r, width: g.r * 2, height: g.r * 2 });
        };
        place();
        ScrollTrigger.addEventListener("refresh", place);

        // Copy entrance, once.
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 60%", once: true } })
          .from(q(".dg-h2 .char"), { yPercent: 118, rotate: 6, duration: 1.1, stagger: 0.03, ease: "expo.out" }, 0)
          .from(q(".dg-lead, .dg-coords, .dg-tag"), { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "power3.out" }, 0.15)
          .from(q(".dg-ic"), { scale: 0, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: "back.out(1.8)" }, 0.4)
          .from(q(".dg-points li"), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: "power3.out" }, 0.55);

        // Spin: a Draggable on an off-DOM proxy, triggered by the hit button,
        // feeds horizontal movement into the engine's angular velocity.
        const proxy = document.createElement("div");
        const [drag] = Draggable.create(proxy, {
          type: "x",
          trigger: btn,
          allowNativeTouchScrolling: true,
          onPress() {
            gsap.set(proxy, { x: 0 });
            btn.classList.add("is-grabbing");
          },
          onDrag() {
            state.dragVel = clampSpin(state.dragVel + this.deltaX * DRAG_GAIN);
          },
          onRelease() {
            btn.classList.remove("is-grabbing");
          },
        });
        const onKey = (e: KeyboardEvent) => {
          const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          state.dragVel = clampSpin(state.dragVel + dir * KEY_KICK);
        };
        btn.addEventListener("keydown", onKey);

        if (desktop) {
          // Pin; the listener arcs draw in over the first 15% of it.
          ScrollTrigger.create({
            trigger: el,
            start: "top top",
            end: "+=120%",
            pin: true,
            refreshPriority: 7,
            invalidateOnRefresh: true,
            onUpdate: (self) => void (state.arcs = gsap.utils.clamp(0, 1, self.progress / 0.15)),
          });
          // Entry: the window becomes the globe while the section rises.
          engine.whenReady(SHAPES.GLOBE).then(
            inContext(ctx, () => {
              if (dead) return;
              gsap.fromTo(
                state,
                { t: SHAPES.WINDOW },
                { t: SHAPES.GLOBE, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: 0.8 } },
              );
            }),
          );
        } else {
          // Phones: no pin. The hit is fixed over the globe only while this section is the one on screen.
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => btn.classList.toggle("is-on", self.isActive),
          });
          engine.whenReady(SHAPES.GLOBE).then(
            inContext(ctx, () => {
              if (dead) return;
              const go = (t: number, arcs: number) => {
                gsap.to(state, { t, duration: 1.4, ease: "power2.inOut", overwrite: "auto" });
                gsap.to(state, { arcs, duration: 0.8, delay: arcs ? 0.9 : 0, ease: "power2.out", overwrite: "auto" });
              };
              ScrollTrigger.create({
                trigger: el,
                start: "top 55%",
                onEnter: () => go(SHAPES.GLOBE, 1),
                onLeaveBack: () => go(SHAPES.WINDOW, 0),
              });
            }),
          );
        }

        return () => {
          dead = true;
          drag.kill();
          btn.removeEventListener("keydown", onKey);
          ScrollTrigger.removeEventListener("refresh", place);
          btn.classList.remove("is-grabbing", "is-on");
          state.arcs = 0;
        };
      }, el);
    },
    { scope: root, dependencies: [engine] },
  );

  return (
    <section className="dg dm-section" ref={root} aria-labelledby="listen-together">
      {children}
      {engine ? (
        <button ref={hit} type="button" className="dg-hit" aria-label="Spin the globe. Use the left and right arrow keys." data-cursor="DRAG" />
      ) : (
        <StillShape shape="globe" label="A globe drawn in particles, with listeners around the world connected to Kathmandu." />
      )}
    </section>
  );
}
