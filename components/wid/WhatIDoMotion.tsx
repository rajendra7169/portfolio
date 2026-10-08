"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";
import { useLenis } from "@/components/SmoothScroll";

type Q = (sel: string) => HTMLElement[];
const pad = (n: number) => String(n).padStart(2, "0");

/** Centre of `el` in `area`'s coordinates (unaffected by el's own scale). */
const centre = (el: Element, area: Element) => {
  const r = el.getBoundingClientRect();
  const a = area.getBoundingClientRect();
  return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 };
};

/* Each builder returns a paused timeline that plays its scene from scratch.
   Function-based values are re-measured on every play (we invalidate first). */

function editorScene(q: Q) {
  const tl = gsap.timeline({ paused: true });
  const lines = q(".wd-code-text");
  tl.set(lines, { clipPath: "inset(0 100% 0 0)" })
    .set(q(".wd-ph-el"), { autoAlpha: 0, y: 14 })
    .set(q(".wd-ok"), { autoAlpha: 0 })
    .set(q(".wd-status"), { backgroundColor: "#001c55" });
  // Typing: each line uncovers one character per step.
  lines.forEach((line) => {
    const n = Math.max(1, (line.textContent ?? "").length);
    tl.to(line, { clipPath: "inset(0 0% 0 0)", duration: Math.min(1.1, n * 0.034), ease: `steps(${n})` }, ">0.06");
  });
  tl.to(q(".wd-ph-el"), { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.14, ease: "back.out(1.7)" }, 1.5)
    .to(q(".wd-ok"), { autoAlpha: 1, duration: 0.3 }, ">0.2")
    .fromTo(q(".wd-status"), { backgroundColor: "#16a34a" }, { backgroundColor: "#001c55", duration: 1.4 }, "<");
  return tl;
}

function cloudScene(q: Q) {
  const tl = gsap.timeline({ paused: true });
  tl.set(q(".wd-term-row"), { autoAlpha: 0 })
    .set(q(".wd-cmd"), { clipPath: "inset(0 100% 0 0)" })
    .set(q(".wd-out"), { autoAlpha: 0, x: -8 })
    .set(q("[data-node]"), { attr: { "data-on": "0" } })
    .set(q(".wd-node:not(.wd-node--hub)"), { scale: 0.5, autoAlpha: 0.35 })
    .fromTo(q(".wd-node--hub"), { scale: 0 }, { scale: 1, duration: 0.7, ease: "back.out(2)" }, 0);
  q(".wd-term-row").forEach((row) => {
    const cmd = row.querySelector(".wd-cmd")!;
    const out = row.querySelector(".wd-out")!;
    const n = Math.max(1, (cmd.textContent ?? "").length);
    tl.set(row, { autoAlpha: 1 }, ">0.15")
      .to(cmd, { clipPath: "inset(0 0% 0 0)", duration: Math.min(1, n * 0.028), ease: `steps(${n})` })
      .to(out, { autoAlpha: 1, x: 0, duration: 0.3 }, ">0.2");
    // Each deploy lights its service on the map, with packets flowing.
    (row.dataset.nodes ?? "")
      .split(" ")
      .filter(Boolean)
      .forEach((id) => {
        tl.set(q(`[data-node="${id}"]`), { attr: { "data-on": "1" } }, "<").to(
          q(`.wd-node[data-node="${id}"]`),
          { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2.4)" },
          "<",
        );
      });
  });
  return tl;
}

function designScene(q: Q) {
  const tl = gsap.timeline({ paused: true });
  const area = q(".wd-area")[0];
  const cursor = q(".wd-cursor")[0];
  const sel = q(".wd-sel")[0];
  const label = q(".wd-sel-label")[0];
  const layers = q(".wd-layer");
  const logo = q(".wd-logo")[0];

  tl.set(q(".wd-ab-el"), { autoAlpha: 0, scale: 0.6 })
    .set(sel, { autoAlpha: 0 })
    .set(layers.slice(1), { attr: { "data-on": "0" } })
    .set(q(".wd-logo-path"), { drawSVG: "0%" })
    .set(q(".wd-anchor, .wd-swatch"), { scale: 0, transformOrigin: "50% 50%" })
    .set(q(".wd-logo-fill"), { autoAlpha: 0 })
    .set(cursor, { x: () => area.clientWidth * 0.03, y: () => area.clientHeight * 0.08 });

  // The cursor drops each block onto the artboard; the selection box follows.
  q(".wd-ab-el").forEach((el, k) => {
    tl.to(cursor, { x: () => centre(el, area).x, y: () => centre(el, area).y, duration: 0.55, ease: "power3.inOut" }, k ? ">0.12" : ">0.3")
      .set(sel, {
        autoAlpha: 1,
        x: () => centre(el, area).x - el.offsetWidth / 2,
        y: () => centre(el, area).y - el.offsetHeight / 2,
        width: () => el.offsetWidth,
        height: () => el.offsetHeight,
      })
      .set(label, { textContent: el.dataset.size ?? "" })
      .to(el, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, "<")
      .set(layers[k + 1], { attr: { "data-on": "1" } }, "<");
  });

  // Then over to the logo board: pen strokes, anchor points, fill, palette.
  tl.to(cursor, { x: () => centre(logo, area).x, y: () => centre(logo, area).y, duration: 0.7, ease: "power3.inOut" }, ">0.2")
    .set(sel, { autoAlpha: 0 }, "<")
    .to(q(".wd-logo-path"), { drawSVG: "100%", duration: 1.1, stagger: 0.35, ease: "power1.inOut" })
    .to(q(".wd-anchor"), { scale: 1, duration: 0.3, stagger: 0.06, ease: "back.out(3)" }, "<0.4")
    .to(q(".wd-logo-fill"), { autoAlpha: 1, duration: 0.5 }, ">")
    .set(layers[layers.length - 1], { attr: { "data-on": "1" } }, "<")
    .to(q(".wd-swatch"), { scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(3)" }, "<")
    // Park the cursor where its name tag stays inside the canvas.
    .to(cursor, { x: () => area.clientWidth * 0.78, y: () => area.clientHeight * 0.84, duration: 0.8, ease: "power2.inOut" }, ">0.2");
  return tl;
}

function videoScene(q: Q) {
  const tl = gsap.timeline({ paused: true });
  const tc = q(".wd-tc")[0];
  const clock = { f: 0 };
  const fmt = (f: number) => {
    const s = Math.floor(f / 25);
    return `00:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(Math.floor(f) % 25)}`;
  };
  tl.set(q(".wd-clip:not(.wd-clip--audio)"), { xPercent: 60, autoAlpha: 0 })
    .set(q(".wd-wave i"), { scaleY: 0 })
    .set(q(".wd-apps span"), { scale: 0 })
    .fromTo(q(".wd-footage"), { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut" }, 0)
    .to(q(".wd-apps span"), { scale: 1, duration: 0.45, stagger: 0.08, ease: "back.out(2.5)" }, 0.3)
    .to(q(".wd-clip:not(.wd-clip--audio)"), { xPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12, ease: "power3.out" }, 0.5)
    .to(q(".wd-wave i"), { scaleY: 1, duration: 0.5, stagger: 0.008, ease: "back.out(2)" }, 0.7)
    // Real-time 25 fps timecode while the module is live.
    .fromTo(clock, { f: 0 }, { f: 25 * 600, duration: 600, ease: "none", onUpdate: () => void (tc.textContent = fmt(clock.f)) }, 0);
  return tl;
}

const BUILDERS = [editorScene, cloudScene, designScene, videoScene];

export default function WhatIDoMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const items = Array.from(el.querySelectorAll<HTMLElement>(".wd-item"));
      const scenes = items.map((item, i) => BUILDERS[i](gsap.utils.selector(item) as Q));
      const btns = Array.from(el.querySelectorAll<HTMLButtonElement>(".wd-rail-btn"));
      const bignum = el.querySelector<HTMLElement>(".wd-bignum")!;
      const fill = el.querySelector<HTMLElement>(".wd-rail-fill")!;
      const play = (i: number) => scenes[i].invalidate().restart();
      const mark = (i: number) =>
        btns.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));

      const mm = gsap.matchMedia();
      mm.add(
        { deck: `${DESKTOP} and ${MOTION_OK}`, flow: `(max-width: 899px) and ${MOTION_OK}`, calm: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { deck, flow, calm } = ctx.conditions as Record<string, boolean>;

          // Reduced motion: every scene shown in its finished state, nothing moving.
          if (calm) {
            scenes.forEach((s) => s.invalidate().progress(1).pause());
            return;
          }

          gsap.from(el.querySelectorAll(".wd-h2 .char"), {
            yPercent: 115,
            rotate: 6,
            duration: 1.1,
            stagger: 0.04,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 75%", once: true },
          });

          // Phones: modules stack; each plays while it's on screen.
          if (flow) {
            const started = items.map(() => false);
            items.forEach((item, i) =>
              ScrollTrigger.create({
                trigger: item.querySelector(".wd-win"),
                start: "top 80%",
                end: "bottom 10%",
                onToggle(self) {
                  item.classList.toggle("is-live", self.isActive);
                  if (!self.isActive) return void scenes[i].pause();
                  if (started[i]) scenes[i].resume();
                  else {
                    started[i] = true;
                    play(i);
                  }
                },
              }),
            );
            return () => items.forEach((it) => it.classList.remove("is-live"));
          }

          if (!deck) return;

          // Desktop: one pinned stage; scroll position picks the live module.
          el.classList.add("is-deck");
          const panels = items.map((it) => it.querySelector<HTMLElement>(".wd-panel")!);
          const wins = items.map((it) => it.querySelector<HTMLElement>(".wd-win")!);
          gsap.set([...panels, ...wins], { autoAlpha: 0 });

          let current = -1;
          let swap: gsap.core.Timeline | null = null;

          const show = contextSafe!((i: number) => {
            if (i === current) return;
            const prev = current;
            current = i;
            const dir = prev < 0 || i > prev ? 1 : -1;
            swap?.progress(1).kill(); // land any half-finished switch first
            items.forEach((it, k) => it.classList.toggle("is-live", k === i));
            mark(i);
            gsap.to(bignum, { duration: 0.6, scrambleText: { text: pad(i + 1), chars: "0123456789", speed: 0.8 } });

            const inQ = gsap.utils.selector(items[i]);
            const t0 = prev < 0 ? 0 : 0.3;
            swap = gsap.timeline();
            if (prev >= 0) {
              const outQ = gsap.utils.selector(items[prev]);
              scenes[prev].pause();
              swap
                .to(outQ(".wd-name .char"), { yPercent: -115 * dir, duration: 0.35, stagger: 0.008, ease: "power2.in" }, 0)
                .to(outQ(".wd-fade, .wd-ic"), { autoAlpha: 0, y: -16 * dir, duration: 0.3, stagger: 0.012, ease: "power2.in" }, 0)
                .set(panels[prev], { autoAlpha: 0 }, 0.45)
                .set(wins[prev], { zIndex: 1 }, 0)
                .set(wins[prev], { autoAlpha: 0 }, 1.05);
            }
            swap
              .set(panels[i], { autoAlpha: 1 }, t0)
              .fromTo(inQ(".wd-name .char"), { yPercent: 115 * dir, rotate: 4 * dir }, { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.014, ease: "expo.out" }, t0)
              .fromTo(inQ(".wd-fade"), { autoAlpha: 0, y: 22 * dir }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05, ease: "power3.out" }, t0 + 0.15)
              .fromTo(inQ(".wd-ic"), { autoAlpha: 0, scale: 0.3, y: 0 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.02, ease: "back.out(2.2)" }, t0 + 0.2)
              // The new window scans in over the old one.
              .set(wins[i], { autoAlpha: 1, zIndex: 2 }, 0)
              .fromTo(wins[i], { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.inOut" }, 0)
              .fromTo(inQ(".wd-scan"), { top: "0%", autoAlpha: 1 }, { top: "100%", duration: 1, ease: "expo.inOut" }, 0)
              .set(inQ(".wd-scan"), { autoAlpha: 0 })
              .add(() => play(i), 0.45);
          });

          const st = ScrollTrigger.create({
            trigger: el,
            start: "top top",
            end: () => `+=${window.innerHeight * 3}`,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate(self) {
              fill.style.transform = `scaleX(${self.progress})`;
              show(Math.min(3, Math.floor(self.progress * 4)));
            },
          });
          // Boot the first module as the section scrolls into view.
          ScrollTrigger.create({
            trigger: el,
            start: "top 60%",
            end: "bottom top",
            onToggle: (self) => void (self.isActive && current < 0 && show(Math.min(3, Math.floor(st.progress * 4)))),
          });

          // Rail: jump to the middle of a module's scroll range.
          const onRail = (e: Event) => {
            const i = Number((e.currentTarget as HTMLElement).dataset.i);
            const y = st.start + (st.end - st.start) * ((i + 0.5) / 4);
            if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.2 });
            else window.scrollTo({ top: y, behavior: "smooth" });
          };
          btns.forEach((b) => b.addEventListener("click", onRail));
          ScrollTrigger.refresh();

          return () => {
            btns.forEach((b) => b.removeEventListener("click", onRail));
            el.classList.remove("is-deck");
            items.forEach((it) => it.classList.remove("is-live"));
            scenes.forEach((s) => s.pause());
          };
        },
        el,
      );
    },
    { scope: root },
  );

  return (
    <section className="wd" ref={root} aria-labelledby="what-i-do">
      {children}
    </section>
  );
}
