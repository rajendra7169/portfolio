"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";
import { afterReveal } from "./PageTransition";

type Preset = { from: gsap.TweenVars; to: gsap.TweenVars; duration?: number; ease?: string; inner?: string };

// data-anim="…" values. Every preset ends at the element's natural state.
const PRESETS: Record<string, Preset> = {
  up: { from: { y: 46, autoAlpha: 0 }, to: { y: 0, autoAlpha: 1 } },
  left: { from: { x: -80, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 } },
  right: { from: { x: 80, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 } },
  pop: { from: { scale: 0.2, autoAlpha: 0 }, to: { scale: 1, autoAlpha: 1 }, duration: 0.7, ease: "back.out(2.2)" },
  zoom: { from: { scale: 0.88, y: 40, autoAlpha: 0 }, to: { scale: 1, y: 0, autoAlpha: 1 }, duration: 1.1 },
  line: { from: { scaleX: 0 }, to: { scaleX: 1 }, duration: 1.3, ease: "expo.inOut" },
  mask: { from: { clipPath: "inset(100% 0% 0% 0%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" }, duration: 1.5, ease: "expo.inOut" },
  // Splits are rendered by <Chars>; each letter rises out of its line.
  chars: { from: { yPercent: 118, rotate: 6 }, to: { yPercent: 0, rotate: 0 }, duration: 1.1, ease: "expo.out", inner: ".char" },
};

/**
 * Wrap a page's content. Elements with data-anim animate in when scrolled to;
 * children of a data-anim-group animate together with a stagger.
 * Also handles data-parallax (percent), data-tilt and data-magnetic.
 */
export default function Motion({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const mm = gsap.matchMedia();

      mm.add(
        MOTION_OK,
        () => {
          const groups = Array.from(el.querySelectorAll<HTMLElement>("[data-anim-group]"));
          const loose = Array.from(el.querySelectorAll<HTMLElement>("[data-anim]")).filter((a) => !a.closest("[data-anim-group]"));
          const units: [HTMLElement, HTMLElement[], number][] = [
            ...groups.map((g) => [g, Array.from(g.querySelectorAll<HTMLElement>("[data-anim]")), Number(g.dataset.animGroup || 0.08)] as [HTMLElement, HTMLElement[], number]),
            ...loose.map((a) => [a, [a], 0] as [HTMLElement, HTMLElement[], number]),
          ];

          units.forEach(([trigger, items, stagger]) => {
            const plan = items.map((item) => {
              const p = PRESETS[item.dataset.anim!] ?? PRESETS.up;
              const targets = p.inner ? item.querySelectorAll(p.inner) : item;
              gsap.set(targets, p.from);
              if (p.inner) gsap.set(item, { autoAlpha: 1 });
              return { p, targets, delay: Number(item.dataset.delay || 0) };
            });
            const play = contextSafe!(() =>
              plan.forEach(({ p, targets, delay }, i) =>
                gsap.to(targets, {
                  ...p.to,
                  duration: p.duration ?? 0.95,
                  ease: p.ease ?? "power3.out",
                  delay: i * stagger + delay,
                  stagger: p.inner ? 0.035 : 0,
                }),
              ),
            );
            ScrollTrigger.create({ trigger, start: "top 92%", once: true, onEnter: () => afterReveal(play) });
          });

          el.querySelectorAll<HTMLElement>("[data-parallax]").forEach((p) =>
            gsap.to(p, {
              yPercent: -Number(p.dataset.parallax),
              ease: "none",
              scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true },
            }),
          );
        },
        el,
      );

      // Pointer flourishes only where there's a real mouse.
      mm.add(
        `${MOTION_OK} and (hover: hover) and (pointer: fine)`,
        () => {
          const off: (() => void)[] = [];
          const bind = (node: HTMLElement, move: (e: PointerEvent) => void, leave: () => void) => {
            const m = contextSafe!(move);
            const l = contextSafe!(leave);
            node.addEventListener("pointermove", m);
            node.addEventListener("pointerleave", l);
            off.push(() => {
              node.removeEventListener("pointermove", m);
              node.removeEventListener("pointerleave", l);
            });
          };

          el.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
            gsap.set(card, { transformPerspective: 900 });
            const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
            const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
            bind(
              card,
              (e) => {
                const r = card.getBoundingClientRect();
                ry(((e.clientX - r.left) / r.width - 0.5) * 9);
                rx(-((e.clientY - r.top) / r.height - 0.5) * 9);
              },
              () => {
                rx(0);
                ry(0);
              },
            );
          });

          el.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((node) => {
            const x = gsap.quickTo(node, "x", { duration: 0.4, ease: "power3.out" });
            const y = gsap.quickTo(node, "y", { duration: 0.4, ease: "power3.out" });
            bind(
              node,
              (e) => {
                const r = node.getBoundingClientRect();
                x((e.clientX - r.left - r.width / 2) * 0.3);
                y((e.clientY - r.top - r.height / 2) * 0.4);
              },
              () => {
                x(0);
                y(0);
              },
            );
          });

          return () => off.forEach((fn) => fn());
        },
        el,
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

/** Splits text into per-letter spans for data-anim="chars". Screen readers get the plain text. */
export function Chars({ text }: { text: string }) {
  return (
    <span className="chars">
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, w) => (
        <span className="chars-word" key={w} aria-hidden="true">
          {word.split("").map((c, i) => (
            <span className="char" key={i}>
              {c}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
