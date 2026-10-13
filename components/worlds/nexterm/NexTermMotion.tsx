"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";
import { syncRoot } from "@/lib/rootFlags";
import { THEMES } from "./themes";

const KEY = "nexterm-theme";
const VARS = ["bg", "fg", "dim", "acc", "ok", "err", "warn", "mag", "cyan"] as const;

export default function NexTermMotion({ className, children }: { className: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const html = document.documentElement;

      // ── nexterm theme: repaint the page, and the site's header and cursor with it.
      const apply = (id: string) => {
        const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
        VARS.forEach((v) => el.style.setProperty(`--nx-${v}`, t[v]));
        html.style.setProperty("--w-bg", t.bg);
        html.style.setProperty("--w-fg", t.fg);
        html.style.setProperty("--w-accent", t.acc);
        el.dataset.tone = t.light ? "light" : "dark";
        syncRoot();
        q(".nt-theme").forEach((b) => b.setAttribute("aria-checked", String((b as HTMLElement).dataset.theme === t.id)));
      };
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(KEY);
      } catch {}
      if (saved) apply(saved);
      const onTheme = (e: Event) => {
        const b = (e.target as Element).closest<HTMLElement>(".nt-theme");
        if (!b) return;
        apply(b.dataset.theme!);
        try {
          localStorage.setItem(KEY, b.dataset.theme!);
        } catch {}
        if (matchMedia(MOTION_OK).matches) gsap.fromTo(q(".nt-win, .nt-laptop"), { filter: "brightness(1.6)" }, { filter: "brightness(1)", duration: 0.5, ease: "power2.out", clearProps: "filter" });
      };
      el.addEventListener("click", onTheme);

      // ── The status bar shows the folder of the section on screen.
      const cwd = q(".nt-status-cwd")[0];
      q("[data-cwd]").forEach((b) =>
        ScrollTrigger.create({
          trigger: b,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (s) => s.isActive && (cwd.textContent = `~\\${(b as HTMLElement).dataset.cwd ?? "nexterm"}`),
        }),
      );

      // Type a string into a node over `d` seconds.
      const typeInto = (node: HTMLElement, text: string, d: number) => {
        const o = { n: 0 };
        return gsap.to(o, { n: text.length, duration: d, ease: "none", onUpdate: () => void (node.textContent = text.slice(0, Math.round(o.n))) });
      };

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;

        // Every block types its commands and prints its output when it comes into view.
        const play = (block: Element, tl: gsap.core.Timeline) => {
          const host = block.querySelector(":scope > .nt-body") ?? block;
          Array.from(host.children).forEach((node) => {
            if (node.classList.contains("nt-cmd")) {
              const typed = node.querySelector<HTMLElement>("[data-type]");
              tl.set(node, { autoAlpha: 1 });
              if (typed) {
                const text = typed.dataset.type!;
                const o = { n: 0 };
                tl.to(o, { n: text.length, duration: Math.min(1.1, text.length * 0.035), ease: "none", onUpdate: () => void (typed.textContent = text.slice(0, Math.round(o.n))) });
                tl.to({}, { duration: 0.18 });
              }
              return;
            }
            tl.set(node, { autoAlpha: 1 });
            const rows = node.querySelectorAll(".nt-row, .nt-log-line, .nt-tree li, .nt-trace li, .nt-info > div, .nt-theme");
            if (rows.length) tl.fromTo(rows, { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.06, ease: "none" });
            else tl.fromTo(node, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
            tl.to({}, { duration: 0.12 });
          });
        };
        const blocks = q(".nt-block");
        const typers = q("[data-type]");
        blocks.forEach((b) => gsap.set(Array.from((b.querySelector(":scope > .nt-body") ?? b).children), { autoAlpha: 0 }));

        // Boot: the about screen types itself while NexTerm powers on on the laptop.
        const boot = gsap.timeline({ paused: true });
        boot.fromTo(q(".nt-hero-laptop"), { y: 60, autoAlpha: 0, rotationX: -14, transformPerspective: 1400 }, { y: 0, autoAlpha: 1, rotationX: 0, duration: 1.2, ease: "expo.out" }, 0);
        boot.fromTo(q(".nt-hero-laptop .dv-display"), { filter: "brightness(0)" }, { filter: "brightness(1)", duration: 0.8, ease: "power2.inOut" }, 0.5);
        boot.fromTo(q(".nt-hero-laptop .nt-sshot"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "steps(20)" }, 1.1);
        const heroTl = gsap.timeline();
        play(q(".nt-hero-copy")[0], heroTl);
        boot.add(heroTl, 0.1);
        boot.fromTo(q(".nt-title pre"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "steps(30)" }, 0.9);
        boot.fromTo(q(".nt-status"), { yPercent: 120 }, { yPercent: 0, duration: 0.6, ease: "expo.out" }, 0.3);
        afterReveal(() => boot.play());

        blocks
          .filter((b) => !b.classList.contains("nt-hero-copy"))
          .forEach((b) => {
            const tl = gsap.timeline({ paused: true });
            play(b, tl);
            ScrollTrigger.create({ trigger: b, start: "top 82%", once: true, onEnter: inContext(ctx, () => tl.play()) });
          });

        // The tour: the section holds while each command types and the laptop
        // switches to its real screen, drawn in a band at a time like a terminal image.
        const tour = q(".nt-tour")[0] as HTMLElement;
        const items = q(".nt-tour-steps li");
        const shots = q(".nt-tshot");
        const count = q(".nt-tour-n")[0];
        const cmds = q(".nt-tour-cmd") as HTMLElement[];
        tour.classList.add("is-pinned");
        let cur = -1;
        let typing: gsap.core.Tween | null = null;
        const go = inContext(ctx, (i: number) => {
          if (i === cur) return;
          const back = i < cur;
          cur = i;
          items.forEach((li, j) => {
            li.classList.toggle("is-on", j === i);
            li.classList.toggle("is-past", j < i);
          });
          shots.forEach((s, j) => s.classList.toggle("is-on", j === i));
          count.textContent = String(i + 1);
          typing?.progress(1);
          const c = cmds[i];
          typing = typeInto(c, c.dataset.cmd!, back ? 0.01 : 0.45);
          if (!back) gsap.fromTo(shots[i], { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "steps(16)", overwrite: "auto" });
        });
        cmds.forEach((c, i) => i && (c.textContent = ""));
        go(0);
        ScrollTrigger.create({
          trigger: tour,
          start: "top top",
          end: () => `+=${shots.length * (desktop ? 70 : 80)}%`,
          pin: true,
          refreshPriority: 1,
          onUpdate: (s) => go(Math.min(shots.length - 1, Math.floor(s.progress * shots.length))),
        });

        // The live session plays on a loop while it is on screen.
        const live = q(".nt-live")[0] as HTMLElement;
        const lines = Array.from(live.querySelectorAll<HTMLElement>(".nt-l"));
        const lived = Array.from(live.querySelectorAll<HTMLElement>("[data-live]"));
        const session = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.6 });
        const reset = () => {
          live.classList.remove("is-ghost", "is-took", "is-asking", "is-fixed");
          lived.forEach((n) => (n.textContent = ""));
        };
        session.add(() => {
          live.classList.add("is-live");
          reset();
        }).set(lines, { autoAlpha: 0 });
        const line = (sel: string, speed = 0.045, pause = 0.35) => {
          const node = live.querySelector<HTMLElement>(sel)!;
          const typed = node.querySelector<HTMLElement>("[data-live]");
          session.set(node, { autoAlpha: 1 }, `+=${pause}`);
          if (typed) {
            const text = typed.dataset.live!;
            const o = { n: 0 };
            session.to(o, { n: text.length, duration: text.length * speed, ease: "none", onUpdate: () => void (typed.textContent = text.slice(0, Math.round(o.n))) });
          }
        };
        line(".nt-l-1");
        line(".nt-l-2", 0, 0.2);
        line(".nt-l-3");
        session.add(() => live.classList.add("is-ghost"), "+=0.2").add(() => live.classList.replace("is-ghost", "is-took"), "+=1.1");
        line(".nt-l-4", 0, 0.4);
        line(".nt-l-5", 0, 0.5);
        line(".nt-l-6", 0, 0.2);
        session.add(() => live.classList.add("is-asking"), "+=0.5");
        line(".nt-ai-q", 0.03, 0.2);
        line(".nt-ai-a", 0.012, 0.6);
        line(".nt-ai-code", 0, 0.3);
        line(".nt-ai-btns", 0, 0.2);
        session.add(() => live.classList.add("is-fixed"), "+=1");
        line(".nt-l-7", 0.04, 0.4);
        line(".nt-l-8", 0, 0.7);
        session.to({}, { duration: 3 });
        ScrollTrigger.create({
          trigger: live,
          start: "top 80%",
          end: "bottom 10%",
          onToggle: inContext(ctx, (s: ScrollTrigger) => (s.isActive ? session.play() : session.pause())),
        });

        return () => {
          typers.forEach((t) => (t.textContent = (t as HTMLElement).dataset.type!));
          cmds.forEach((c) => (c.textContent = c.dataset.cmd!));
          lived.forEach((n) => (n.textContent = n.dataset.live!));
          live.classList.remove("is-live", "is-ghost", "is-took", "is-asking", "is-fixed");
          tour.classList.remove("is-pinned");
          items.forEach((li, j) => li.classList.toggle("is-on", j === 0));
          shots.forEach((s, j) => s.classList.toggle("is-on", j === 0));
          cur = -1;
        };
      }, el);

      return () => {
        el.removeEventListener("click", onTheme);
        ["--w-bg", "--w-fg", "--w-accent"].forEach((v) => html.style.removeProperty(v));
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} data-world="nexterm" data-tone="dark">
      {children}
    </div>
  );
}
