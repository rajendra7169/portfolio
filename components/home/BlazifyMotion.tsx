"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, Draggable, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { useLenis } from "@/components/SmoothScroll";
import { projects } from "@/lib/content";
import { useDust } from "./dust/DustProvider";
import { SHAPES } from "./dust/layout";

const FINE = "(hover: hover) and (pointer: fine)";
const NAVY = "#001c55";
const BOLT = "#f26b38";

/**
 * Section 3: the dust is a Blazify phone with a live equalizer, then a desktop
 * window. The lyric (the project description, word by word) drives the EQ
 * amplitude; the knob scrubs it; ♪ Play throws notes and kicks the EQ (§4.3).
 */
export default function BlazifyMotion({ children }: { children: ReactNode }) {
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

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP, fine: FINE }, (ctx) => {
        const { motion, desktop, fine } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        let dead = false;
        const offs: (() => void)[] = [];
        const on = <K extends keyof HTMLElementEventMap>(t: EventTarget, type: K | string, fn: (e: never) => void) => {
          t.addEventListener(type, fn as EventListener);
          offs.push(() => t.removeEventListener(type, fn as EventListener));
        };

        /* ── Lyric timelines: one per sub-state, the word lights up as the EQ pumps ── */
        const subs = ["a", "b"] as const;
        const lyrics = subs.map((s) => {
          const box = q(`.db-state--${s}`)[0];
          const words = gsap.utils.toArray<HTMLElement>(box.querySelectorAll(".db-word"));
          const track = box.querySelector<HTMLElement>(".db-track")!;
          const knob = box.querySelector<HTMLButtonElement>(".db-knob")!;
          knob.disabled = false;
          const span = () => Math.max(0, track.clientWidth - knob.offsetWidth);
          let dragging = false;
          const tl = gsap.timeline({ paused: true, repeat: -1 });
          words.forEach((w, k) => {
            tl.to(w, { color: BOLT, y: -2, duration: 0.12 }, k * 0.28).to(w, { color: NAVY, y: 0, duration: 0.3 }, k * 0.28 + 0.26);
          });
          tl.to({}, { duration: 1.2 });
          tl.eventCallback("onUpdate", () => {
            const p = tl.progress();
            state.eqAmpLyric = 1 + 0.9 * (1 - ((p * words.length * 1.15) % 1));
            if (!dragging) gsap.set(knob, { x: p * span() });
            knob.setAttribute("aria-valuenow", String(Math.round(p * 100)));
          });
          let resume: gsap.core.Tween | undefined;
          const [drag] = Draggable.create(knob, {
            type: "x",
            bounds: track,
            allowNativeTouchScrolling: false,
            onPress() {
              dragging = true;
              resume?.kill();
            },
            onDrag() {
              tl.progress(this.x / (span() || 1)).pause();
            },
            onRelease() {
              dragging = false;
              resume = gsap.delayedCall(1.2, () => void (live() === s && tl.play()));
            },
          });
          on(knob, "keydown", (e: KeyboardEvent) => {
            const d = e.key === "ArrowRight" ? 0.04 : e.key === "ArrowLeft" ? -0.04 : 0;
            if (!d) return;
            e.preventDefault();
            tl.progress(gsap.utils.clamp(0, 0.999, tl.progress() + d));
          });
          offs.push(() => {
            drag.kill();
            resume?.kill();
            knob.disabled = true;
          });
          return { s, tl, box };
        });

        let sub: "a" | "b" = "a";
        let active = false;
        const live = () => (active ? sub : null);
        const sync = () => lyrics.forEach((l) => (live() === l.s ? l.tl.play() : l.tl.pause()));

        /* ── Sub-state swap: phone copy ↔ desktop copy ───────────────────── */
        const chips = q(".db-chip");
        const source = q(".db-source")[0] as HTMLAnchorElement;
        const setSub = inContext(ctx, (next: "a" | "b", instant = false) => {
          if (next === sub && !instant) return;
          sub = next;
          chips.forEach((c) => {
            const lit = (c.dataset.sub === "window") === (next === "b");
            if (lit) c.setAttribute("aria-current", "true");
            else c.removeAttribute("aria-current");
          });
          source.href = next === "a" ? projects[0].url : projects[2].url;
          if (desktop) {
            const [show, hide] = next === "a" ? [lyrics[0].box, lyrics[1].box] : [lyrics[1].box, lyrics[0].box];
            if (instant) {
              gsap.set(hide, { autoAlpha: 0, y: 0 });
              gsap.set(show, { autoAlpha: 1, y: 0 });
            } else {
              const dir = next === "b" ? 1 : -1;
              gsap.to(hide, { autoAlpha: 0, y: -24 * dir, duration: 0.35, ease: "power2.in", overwrite: true });
              gsap.fromTo(show, { autoAlpha: 0, y: 24 * dir }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power3.out", overwrite: true });
              gsap.to(q(".db-h2-text"), { scrambleText: { text: "Blazify", chars: "upperCase", speed: 0.7 }, duration: 0.6, ease: "none", overwrite: true });
            }
          }
          sync();
        });
        setSub("a", true);

        /* ── Dust ─────────────────────────────────────────────────────────── */
        let pin: ScrollTrigger | undefined;
        if (desktop) {
          gsap.fromTo(state, { t: SHAPES.NEPAL }, { t: SHAPES.PHONE, ease: "none", immediateRender: false, scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: 0.8 } });
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el, start: "top top", end: "+=200%", scrub: 0.8, pin: true, refreshPriority: 8 },
            onUpdate: () => setSub(tl.progress() >= 0.5 ? "b" : "a"),
          });
          tl.fromTo(state, { t: SHAPES.PHONE }, { t: SHAPES.WINDOW, duration: 0.18, immediateRender: false }, 0.42).to({}, { duration: 0.4 }, 0.6);
          pin = tl.scrollTrigger;
          ScrollTrigger.create({ trigger: el, start: "top bottom", end: () => (pin ? pin.end + window.innerHeight : "bottom top"), onToggle: (self) => ((active = self.isActive), sync()) });
        } else {
          // Phones: the two copies are in flow; each one calls its shape when it arrives.
          let tw: gsap.core.Tween | undefined;
          const go = inContext(ctx, (t: number) => {
            tw?.kill();
            tw = gsap.to(state, { t, duration: 1.4, ease: "power2.inOut" });
          });
          ScrollTrigger.create({ trigger: lyrics[0].box, start: "top 55%", onEnter: () => go(SHAPES.PHONE), onLeaveBack: () => go(SHAPES.NEPAL) });
          ScrollTrigger.create({ trigger: lyrics[1].box, start: "top 55%", onEnter: () => (go(SHAPES.WINDOW), setSub("b")), onLeaveBack: () => (go(SHAPES.PHONE), setSub("a")) });
          ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (self) => ((active = self.isActive), sync()) });
        }

        // Copy entrance, once.
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } })
          .to(q(".db-h2-text"), { scrambleText: { text: "Blazify", chars: "upperCase", speed: 0.6 }, duration: 0.9, ease: "none" }, 0)
          .from(q(".db-sub--a, .db-desc--a, .db-state--a .db-track"), { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: "power3.out" }, 0.1)
          .from(q(".db-pill, .db-chip"), { scale: 0.6, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: "back.out(2)" }, 0.3)
          .from(q(".db-stat, .db-links > *"), { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.45);

        /* ── ♪ Play: the notes fly, the equalizer jumps ───────────────────── */
        const play = q(".db-play")[0];
        const notes = q(".db-note").filter((n) => n.offsetParent !== null || getComputedStyle(n).display !== "none");
        let pressTimer = 0;
        on(
          play,
          "click",
          inContext(ctx, () => {
            play.setAttribute("aria-pressed", "true");
            window.clearTimeout(pressTimer);
            pressTimer = window.setTimeout(() => play.setAttribute("aria-pressed", "false"), 2000);
            gsap.killTweensOf(notes);
            gsap.set(notes, { x: 0, y: 0, rotation: 0, autoAlpha: 1 });
            gsap.to(notes, {
              duration: 2.2,
              physics2D: { velocity: () => gsap.utils.random(300, 600), angle: () => gsap.utils.random(-120, -60), gravity: 900 },
              rotation: () => gsap.utils.random(-180, 180),
              autoAlpha: 0,
              ease: "none",
            });
            gsap.timeline().to(state, { eqAmpPlay: 2, duration: 0.25, ease: "power2.out" }).to(state, { eqAmpPlay: 1, duration: 0.6, ease: "power2.inOut" }, 2.0);
          }),
        );
        offs.push(() => window.clearTimeout(pressTimer));

        /* ── Chips: hover previews the other device; click jumps to it ────── */
        chips.forEach((c) => {
          const shape = c.dataset.sub === "window" ? SHAPES.WINDOW : SHAPES.PHONE;
          if (fine && desktop) {
            on(c, "pointerenter", inContext(ctx, () => {
              state.tHover = shape;
              gsap.to(state, { hoverMix: 1, duration: 0.9, ease: "power2.inOut", overwrite: true });
            }));
            on(c, "pointerleave", inContext(ctx, () => gsap.to(state, { hoverMix: 0, duration: 0.7, ease: "power2.inOut", overwrite: true })));
          }
          on(c, "click", () => {
            const l = lenisRef.current;
            let y: number;
            if (desktop && pin) y = pin.start + (pin.end - pin.start) * (shape === SHAPES.WINDOW ? 0.8 : 0.2);
            else y = lyrics[shape === SHAPES.WINDOW ? 1 : 0].box.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.46;
            if (l) l.scrollTo(y, { duration: 1.2 });
            else window.scrollTo({ top: y, behavior: "smooth" });
          });
        });

        return () => {
          dead = true;
          void dead;
          offs.forEach((fn) => fn());
          lyrics.forEach((l) => l.tl.kill());
          state.eqAmpLyric = 1;
          state.eqAmpPlay = 1;
          state.hoverMix = 0;
          state.tHover = null;
        };
      });
    },
    { scope: root, dependencies: [engine] },
  );

  return (
    <section className="db dm-section" ref={root} aria-labelledby="blazify">
      {children}
    </section>
  );
}
