"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { useLenis } from "@/components/SmoothScroll";
import { useDust } from "./dust/DustProvider";
import { CHAPTERS } from "./chapters";

const pad = (n: number) => String(n).padStart(2, "0");

export default function HudMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const { engine } = useDust();
  const engineRef = useRef(engine);
  engineRef.current = engine;

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const ticks = q(".dn-tick") as HTMLButtonElement[];
      const slate = q(".dn-slate")[0];
      const slateM = q(".dn-slate-m")[0];
      const here = q(".dn-here")[0];
      const tag = q(".dn-tag")[0];
      const play = q(".dn-play")[0] as HTMLButtonElement;
      const zero = q(".dn-zero")[0] as HTMLButtonElement;
      const sections = () => CHAPTERS.map((c) => document.querySelector<HTMLElement>(`.${c.id}`));
      // Document top of a chapter (its pin spacer when pinned).
      const chapterTop = (i: number) => {
        const s = sections()[i];
        if (!s) return 0;
        const box = s.parentElement?.classList.contains("pin-spacer") ? s.parentElement : s;
        return box.getBoundingClientRect().top + window.scrollY;
      };
      const go = (y: number, duration = 1.6) => {
        const l = lenisRef.current;
        if (l) l.scrollTo(y, { duration, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
        else window.scrollTo({ top: y, behavior: "smooth" });
      };

      // Chapter jumps work with or without motion.
      const onTick = (e: Event) => go(chapterTop(Number((e.currentTarget as HTMLElement).dataset.i)));
      ticks.forEach((t) => t.addEventListener("click", onTick));
      const onTag = () => go(0);
      tag.addEventListener("click", onTag);
      let current = 0;
      const onKey = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.key !== "]" && e.key !== "[") return;
        // The chapter we're in: the last one whose top is at or above the viewport top.
        let here = 0;
        CHAPTERS.forEach((_, i) => void (chapterTop(i) <= window.scrollY + 8 && (here = i)));
        go(chapterTop(e.key === "]" ? Math.min(CHAPTERS.length - 1, here + 1) : Math.max(0, here - 1)));
      };
      window.addEventListener("keydown", onKey);

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) {
          el.classList.add("is-still");
          return;
        }

        // The rail line fills as the page is read.
        gsap.fromTo(q(".dn-line"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } });

        // Which chapter is on the reading line.
        const setChapter = inContext(ctx, (i: number) => {
          if (i === current) return;
          current = i;
          ticks.forEach((t, k) => (k === i ? t.setAttribute("aria-current", "step") : t.removeAttribute("aria-current")));
          const text = `${pad(i + 1)} / ${pad(CHAPTERS.length)} · ${CHAPTERS[i].label}`;
          if (desktop) {
            gsap.to(here, { y: ticks[i].offsetTop + ticks[i].offsetHeight / 2, duration: 0.6, ease: "expo.out" });
            gsap.to(slate, { duration: 0.6, scrambleText: { text, chars: "0123456789/·", speed: 0.8 } });
          } else {
            slateM.textContent = text;
          }
        });
        gsap.set(here, { y: ticks[0].offsetTop + ticks[0].offsetHeight / 2 });
        ticks[0].setAttribute("aria-current", "step");
        // Chapter bounds are measured after every refresh (pins are in place by then),
        // so pinned sections count their whole pin as theirs.
        let bounds: number[] = [];
        const measure = () => {
          bounds = CHAPTERS.map((_, i) => chapterTop(i));
          pick();
        };
        const pick = () => {
          const line = window.scrollY + window.innerHeight * 0.55;
          let i = 0;
          for (let k = 0; k < bounds.length; k++) if (line >= bounds[k]) i = k;
          setChapter(i);
        };
        ScrollTrigger.addEventListener("refresh", measure);
        ScrollTrigger.create({ start: 0, end: "max", onUpdate: pick });
        measure();

        // The tag docks into the "— made in Kathmandu" line: at max scroll it sits in .dy-foot-slot.
        if (desktop) {
          const slot = document.querySelector<HTMLElement>(".dy-foot-slot");
          if (slot) {
            const tagBase = () => {
              const r = tag.getBoundingClientRect();
              return { left: r.left - (gsap.getProperty(tag, "x") as number), top: r.top - (gsap.getProperty(tag, "y") as number) };
            };
            const slotDoc = () => {
              const r = slot.getBoundingClientRect();
              return { left: r.left, top: r.top + window.scrollY };
            };
            gsap.to(tag, {
              x: () => slotDoc().left - tagBase().left,
              y: () => slotDoc().top - ScrollTrigger.maxScroll(window) - tagBase().top,
              ease: "none",
              scrollTrigger: { trigger: slot, start: "top bottom", end: "max", scrub: 0.5, invalidateOnRefresh: true },
            });
          }
        }

        // Phones: the name bar appears once the hero is left behind.
        if (!desktop) {
          ScrollTrigger.create({ trigger: ".dk", start: "top 80%", onEnter: () => gsap.to(q(".dn-bar"), { autoAlpha: 1, duration: 0.5 }), onLeaveBack: () => gsap.to(q(".dn-bar"), { autoAlpha: 0, duration: 0.3 }) });
        }

        // Autoplay: scroll the whole page slowly; any input cancels; Replay at the end.
        let playing = false;
        const setPlay = (state: "play" | "pause" | "replay") => {
          play.dataset.state = state;
          play.setAttribute("aria-label", state === "play" ? "Play the page" : state === "pause" ? "Pause" : "Replay the page");
          q(".dn-play-icon")[0].textContent = state === "play" ? "▶" : state === "pause" ? "❚❚" : "↻";
        };
        const stopPlay = () => {
          if (!playing) return;
          playing = false;
          const l = lenisRef.current;
          if (l) l.scrollTo(l.animatedScroll, { immediate: true, force: true });
          setPlay(window.scrollY >= ScrollTrigger.maxScroll(window) - 4 ? "replay" : "play");
        };
        const startPlay = () => {
          const l = lenisRef.current;
          const max = ScrollTrigger.maxScroll(window);
          const start = () => {
            playing = true;
            setPlay("pause");
            const dist = max - window.scrollY;
            if (l) l.scrollTo(max, { duration: Math.max(4, 75 * (dist / max)), easing: (t: number) => t, onComplete: () => void (playing && (playing = false), setPlay("replay")) });
            else window.scrollTo({ top: max, behavior: "smooth" });
          };
          if (window.scrollY >= max - 4) {
            // replay: back to the top first
            if (l) l.scrollTo(0, { duration: 1.2, onComplete: start });
            else {
              window.scrollTo({ top: 0 });
              start();
            }
          } else start();
        };
        const onPlay = () => (playing ? stopPlay() : startPlay());
        play.addEventListener("click", onPlay);
        const cancel = () => playing && stopPlay();
        window.addEventListener("wheel", cancel, { passive: true });
        window.addEventListener("touchstart", cancel, { passive: true });
        const cancelKey = (e: KeyboardEvent) => e.target === document.body && cancel();
        window.addEventListener("keydown", cancelKey);
        ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => !playing && play.dataset.state === "replay" && self.progress < 0.98 && setPlay("play") });

        // 0g: the dust drifts; a second press, a scroll or 12s brings it home.
        let zeroTimer = 0;
        const zeroOff = inContext(ctx, () => {
          const e = engineRef.current;
          if (!e || e.state.zeroG === 0) return;
          e.state.zeroG = 0;
          zero.setAttribute("aria-pressed", "false");
          window.clearTimeout(zeroTimer);
        });
        const onZero = inContext(ctx, () => {
          const e = engineRef.current;
          if (!e) return;
          if (e.state.zeroG > 0) return zeroOff();
          e.state.zeroG = 1;
          e.kick(0.6);
          zero.setAttribute("aria-pressed", "true");
          zeroTimer = window.setTimeout(zeroOff, 12000);
        });
        zero.addEventListener("click", onZero);
        ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => Math.abs(self.getVelocity()) > 50 && zeroOff() });

        return () => {
          ScrollTrigger.removeEventListener("refresh", measure);
          play.removeEventListener("click", onPlay);
          window.removeEventListener("wheel", cancel);
          window.removeEventListener("touchstart", cancel);
          window.removeEventListener("keydown", cancelKey);
          zero.removeEventListener("click", onZero);
          window.clearTimeout(zeroTimer);
          el.classList.remove("is-still");
        };
      });

      return () => {
        ticks.forEach((t) => t.removeEventListener("click", onTick));
        tag.removeEventListener("click", onTag);
        window.removeEventListener("keydown", onKey);
      };
    },
    { scope: root },
  );

  return (
    <div className="dn" ref={root}>
      {children}
    </div>
  );
}
