"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, inContext } from "@/lib/gsap";
import { Draggable } from "@/lib/gsap-drag";
import { afterReveal } from "@/components/PageTransition";

const OUT = 150; // how far the stick sits from the port when unplugged, px

export default function RAiMotion({ className, children }: { className: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const one = <T extends Element = HTMLElement>(s: string) => q(s)[0] as unknown as T;
      const motion = () => matchMedia(MOTION_OK).matches;
      const offs: (() => void)[] = [];
      const on = (node: Element, type: string, fn: EventListener) => {
        node.addEventListener(type, fn);
        offs.push(() => node.removeEventListener(type, fn));
      };

      // ── The drive: plugged in, the folder opens; pulled out, it goes dark ──
      const hero = one(".ra-hero");
      const stick = one<HTMLButtonElement>(".ra-stick");
      const toast = one(".ra-toast");
      const rows = q(".ra-tree > li");
      let plugged = true;
      const setDrive = (inn: boolean, animate = motion()) => {
        plugged = inn;
        hero.dataset.drive = inn ? "in" : "out";
        stick.setAttribute("aria-label", inn ? "Unplug the drive" : "Plug the drive in");
        const d = animate ? 1 : 0;
        gsap.to(stick, { x: inn ? 0 : -OUT, duration: 0.55 * d, ease: inn ? "back.out(1.4)" : "power3.out", overwrite: "auto" });
        if (inn) {
          gsap.fromTo(toast, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.5 * d, delay: 0.35 * d, ease: "expo.out", overwrite: "auto" });
          gsap.fromTo(rows, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.4 * d, stagger: 0.07 * d, delay: 0.5 * d, ease: "expo.out", overwrite: "auto" });
        } else gsap.to(toast, { autoAlpha: 0, y: -14, duration: 0.3 * d, overwrite: "auto" });
      };
      gsap.set(toast, { autoAlpha: 1 });

      // ── Pull the plug: the switch, and the answer streaming in ───────────
      const sw = one(".ra-switch");
      const netState = one(".ra-net-state b");
      const chat = one(".ra-chat");
      on(sw, "click", () => {
        const off = sw.getAttribute("aria-checked") === "true";
        sw.setAttribute("aria-checked", String(!off));
        netState.textContent = off ? "off" : "on";
        chat.classList.toggle("is-offline", off);
        if (off) stream();
      });
      const answer = one(".ra-answer");
      const think = one(".ra-think");
      const text = answer.dataset.stream!;
      let streamer: gsap.core.Timeline | null = null;
      const stream = () => {
        if (!motion()) return;
        streamer?.kill();
        const words = text.split(" ");
        const o = { n: 0 };
        answer.textContent = "";
        streamer = gsap
          .timeline()
          .fromTo(think, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
          .to(o, { n: words.length, duration: words.length * 0.06, ease: "none", onUpdate: () => void (answer.textContent = words.slice(0, Math.round(o.n)).join(" ")) }, "+=0.7");
      };
      on(one(".ra-ask"), "click", stream);

      // ── Pack the drive ───────────────────────────────────────────────────
      const models = q(".ra-model") as HTMLButtonElement[];
      const caps = q(".ra-cap");
      const fill = one(".ra-bar-fill");
      const used = one(".ra-used");
      const total = one(".ra-total");
      const note = one(".ra-pack-note");
      const winCap = one(".ra-win-cap");
      let cap = 32;
      const size = (b: Element) => +(b as HTMLElement).dataset.gb!;
      const sum = () => models.filter((m) => m.getAttribute("aria-pressed") === "true").reduce((a, m) => a + size(m), 0);
      const drawBar = () => {
        const u = sum();
        used.textContent = u.toFixed(1);
        total.textContent = String(cap);
        winCap.textContent = `${cap} GB`;
        gsap.to(fill, { scaleX: Math.min(1, u / cap), duration: motion() ? 0.6 : 0, ease: "power2.out", transformOrigin: "left center" });
        fill.classList.toggle("is-full", u / cap > 0.85);
      };
      drawBar();
      on(el, "click", (e) => {
        const c = (e.target as Element).closest<HTMLElement>(".ra-cap");
        if (!c) return;
        const next = +c.dataset.cap!;
        if (sum() > next) {
          note.textContent = `Those models need ${sum().toFixed(1)} GB. Remove some first.`;
          return;
        }
        cap = next;
        caps.forEach((b) => b.setAttribute("aria-checked", String(b === c)));
        note.textContent = "";
        drawBar();
      });
      models.forEach((m) =>
        on(m, "click", () => {
          if (m.classList.contains("is-busy")) return;
          const label = m.querySelector(".ra-model-gb")!;
          const gb = size(m);
          const name = m.querySelector("b")!.textContent;
          if (m.getAttribute("aria-pressed") === "true") {
            m.setAttribute("aria-pressed", "false");
            gsap.set(m.querySelector(".ra-dl b"), { scaleX: 0 });
            note.textContent = `${name} deleted from Shared/models.`;
            return drawBar();
          }
          if (sum() + gb > cap) {
            note.textContent = `${name} needs ${gb} GB and only ${(cap - sum()).toFixed(1)} GB is free on a ${cap} GB drive.`;
            if (motion()) gsap.fromTo(m, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
            return;
          }
          const done = () => {
            m.classList.remove("is-busy");
            m.setAttribute("aria-pressed", "true");
            label.textContent = `${gb} GB`;
            note.textContent = `${name} is on the drive. Every system on it can use it now.`;
            drawBar();
          };
          if (!motion()) return done();
          m.classList.add("is-busy");
          const o = { p: 0 };
          gsap.fromTo(m.querySelector(".ra-dl b"), { scaleX: 0 }, { scaleX: 1, duration: 0.9 + gb * 0.22, ease: "power1.inOut", transformOrigin: "left center", onUpdate: function () {
            o.p = this.progress();
            label.textContent = `${Math.round(o.p * 100)}%`;
          }, onComplete: done });
        }),
      );

      // ── The interface: Chat and Image tabs ───────────────────────────────
      const tabs = q(".ra-tab");
      const shots = q(".ra-shot");
      const notes = q(".ra-note");
      tabs.forEach((t, i) =>
        on(t, "click", () => {
          tabs.forEach((b, j) => b.setAttribute("aria-selected", String(i === j)));
          shots.forEach((s, j) => s.classList.toggle("is-on", i === j));
          notes.forEach((s, j) => s.classList.toggle("is-on", i === j));
        }),
      );

      // ── Taking turns on memory ───────────────────────────────────────────
      const bar = one(".ra-mem-bar");
      const modes = q(".ra-mode");
      modes.forEach((b) =>
        on(b, "click", () => {
          modes.forEach((x) => x.setAttribute("aria-checked", String(x === b)));
          bar.dataset.mode = (b as HTMLElement).dataset.mode!;
          q(".ra-procs li").forEach((li) => li.classList.toggle("is-idle", (li as HTMLElement).dataset.proc === (bar.dataset.mode === "chat" ? "3" : "2")));
        }),
      );
      q('.ra-procs li[data-proc="3"]').forEach((li) => li.classList.add("is-idle"));

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (ctx) => {
        // Cold open: the drive slides in from the left and clicks home.
        gsap.set(stick, { x: -OUT });
        gsap.set(toast, { autoAlpha: 0 });
        gsap.set(rows, { autoAlpha: 0 });
        hero.dataset.drive = "out";
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .from(q(".ra-name, .ra-tag"), { yPercent: 50, autoAlpha: 0, duration: 1.1, stagger: 0.12 }, 0)
          .from(q(".ra-kind, .ra-lede, .ra-links"), { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.25)
          .fromTo(q(".ra-explorer"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.3)
          .from(q(".ra-rig"), { y: 40, autoAlpha: 0, duration: 0.9 }, 0.4)
          .add(inContext(ctx, () => setDrive(true)), 1.1);
        afterReveal(() => intro.play());

        // Drag it out, drag it back.
        // (inContext hands the context to the callback as `this`, so the
        // Draggable is read from the closure.)
        const [drag] = Draggable.create(stick, {
          type: "x",
          bounds: { minX: -OUT, maxX: 0 },
          minimumMovement: 6,
          onRelease: inContext(ctx, () => setDrive(drag.x > -OUT / 2)),
          onClick: inContext(ctx, () => setDrive(!plugged)),
        });

        ScrollTrigger.create({ trigger: chat, start: "top 70%", once: true, onEnter: inContext(ctx, () => stream()) });
        q(".ra-head").forEach((h) => gsap.from(h.children, { y: 26, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: h, start: "top 85%", once: true } }));
        ScrollTrigger.batch(q(".ra-models li"), { start: "top 90%", once: true, onEnter: (b) => gsap.from(b, { y: 24, autoAlpha: 0, duration: 0.7, ease: "expo.out", stagger: 0.05 }) });

        return () => {
          drag.kill();
          streamer?.kill();
          answer.textContent = text;
          setDrive(true, false);
        };
      }, el);
      // Without motion, a click still plugs and unplugs.
      on(stick, "click", () => {
        if (!motion()) setDrive(!plugged, false);
      });

      return () => offs.forEach((f) => f());
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} data-world="r-ai" data-tone="dark">
      {children}
    </div>
  );
}
