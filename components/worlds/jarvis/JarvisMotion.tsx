"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#*";
const ACKS = ["Yes sir.", "Listening, sir.", "Go ahead, sir."];
const TILT = 58;

export default function JarvisMotion({ className, children }: { className: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const state = q(".jv-frame-state")[0];
      const reply = q(".jv-voice")[0];
      const reactor = q(".jv-reactor")[0] as HTMLButtonElement;

      // ── Press the core: it wakes and answers, the way the wake word does.
      let n = 0;
      let wake: gsap.core.Timeline | null = null;
      const onWake = () => {
        const text = ACKS[n++ % ACKS.length];
        wake?.kill();
        reactor.classList.add("is-awake");
        if (!matchMedia(MOTION_OK).matches) {
          reply.textContent = text;
          return;
        }
        state.textContent = "SPEAKING";
        const o = { n: 0 };
        wake = gsap
          .timeline({ onComplete: () => void (reactor.classList.remove("is-awake"), (state.textContent = "LISTENING")) })
          .fromTo(q(".jv-heart"), { scale: 1 }, { scale: 1.35, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" })
          .to(o, { n: text.length, duration: text.length * 0.05, ease: "none", onUpdate: () => void (reply.textContent = text.slice(0, Math.round(o.n))) }, 0.1)
          .to(reply, { autoAlpha: 0, duration: 0.5 }, "+=1.6")
          .set(reply, { textContent: "", autoAlpha: 1 });
      };
      reactor.addEventListener("click", onWake);

      // ── The frame's state follows the section on screen.
      const STATES: [string, string][] = [
        [".jv-hero", "LISTENING"],
        [".jv-explode", "EXPLODED"],
        [".jv-run", "THINKING"],
        [".jv-screens", "SPEAKING"],
        [".jv-skills", "ROUTING"],
        [".jv-gate-world", "ASKING"],
      ];
      STATES.forEach(([sel, s]) =>
        ScrollTrigger.create({ trigger: q(sel)[0], start: "top 50%", end: "bottom 50%", onToggle: (t) => t.isActive && (state.textContent = s) }),
      );

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;

        // Cold start: the windows probe in one by one, the core assembles, the name decodes.
        const word = q(".jv-word span[aria-hidden]")[0];
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .from(q(".jv-frame i"), { scale: 0, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0)
          .from(q(".jv-frame span"), { autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.3)
          .from(q(".jv-arc"), { scale: 0.2, rotation: -120, autoAlpha: 0, duration: 1.6, stagger: 0.09 }, 0.2)
          .from(q(".jv-heart"), { scale: 0, duration: 1, ease: "back.out(2)" }, 0.8)
          .from(word, { autoAlpha: 0, duration: 0.3 }, 0.7)
          .to(word, { scrambleText: { text: "JARVIS", chars: GLYPHS, revealDelay: 0.4, speed: 0.6 }, duration: 1.4, ease: "none" }, 0.7)
          .from(q(".jv-tag"), { autoAlpha: 0, y: 12, duration: 0.8 }, 1.3)
          .from(q(".jv-tele > div"), { autoAlpha: 0, x: 16, duration: 0.6, stagger: 0.07 }, 1.1);
        q(".jv-boot-line").forEach((line, i) => {
          intro
            .from(line, { autoAlpha: 0, x: -14, duration: 0.4 }, 0.3 + i * 0.18)
            .from(line.querySelector("b"), { scaleX: 0, transformOrigin: "left center", duration: 0.5, ease: "power2.inOut" }, 0.4 + i * 0.18)
            .from(line.querySelector("em"), { autoAlpha: 0, duration: 0.2 }, 0.85 + i * 0.18);
        });
        afterReveal(() => intro.play());

        // Skill families fill in as they arrive.
        gsap.from(q(".jv-fams b"), { scaleX: 0, transformOrigin: "left center", duration: 1, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: q(".jv-fams")[0], start: "top 80%", once: true } });

        // Reactor, explode: the core tips back and its rings lift apart into a
        // tower of pipeline stages, then each stage lights in order. The labels
        // stay flat, pinned beside each ring's projected edge.
        const section = q(".jv-explode")[0] as HTMLElement;
        const wrap = q(".jv-stack-wrap")[0];
        const stack = q(".jv-stack")[0];
        const layers = q(".jv-layer");
        const rings = q(".jv-layer-ring");
        const tags = q(".jv-legend li");
        section.classList.add("is-3d");
        const gap = () => Math.min(72, (innerHeight * 0.5) / layers.length);
        const lift = () => ((layers.length - 1) * gap() * Math.sin((TILT * Math.PI) / 180)) / 2;
        const place = () => {
          const w = wrap.getBoundingClientRect();
          rings.forEach((r, i) => {
            const b = r.getBoundingClientRect();
            const t = tags[i] as HTMLElement;
            t.style.left = `${b.right - w.left + 26}px`;
            t.style.top = `${b.top + b.height / 2 - w.top}px`;
            // On phones the labels get whatever width is left beside the tower.
            t.style.maxWidth = desktop ? "" : `${Math.max(120, w.right - b.right - 34)}px`;
          });
        };
        const light = (p: number) => {
          const k = (p - 0.5) / 0.5;
          const on = k < 0 ? -1 : Math.min(layers.length - 1, Math.floor(k * layers.length));
          layers.forEach((l, i) => l.classList.toggle("is-on", i === on));
          tags.forEach((l, i) => l.classList.toggle("is-on", i === on));
        };
        gsap.set(stack, { transformPerspective: 1600 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: inContext(ctx, () => (place(), light(tl.progress()))),
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 0.8,
            refreshPriority: 2,
            invalidateOnRefresh: true,
            onRefresh: inContext(ctx, () => place()),
          },
        });
        tl.to(stack, { rotationX: TILT, rotationZ: -14, y: lift, duration: 0.5 }, 0)
          .to(layers, { z: (i) => i * gap(), duration: 0.5 }, 0)
          .fromTo(tags, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.2, stagger: 0.03 }, 0.3)
          .to({}, { duration: 0.5 });
        place();

        // The HUD, for real: the main screen up close with callouts on what each
        // part does, through three screens, then the camera steps back to the wall.
        const screensSec = q(".jv-screens")[0] as HTMLElement;
        const wallEl = q(".jv-wall")[0] as HTMLElement;
        const main = q(".jv-mon--main")[0];
        const shots = q(".jv-mshot");
        const calls = q(".jv-call") as HTMLElement[];
        const steps = q(".jv-wall-steps li");
        const readout = q(".jv-readout")[0];
        screensSec.classList.add("is-pinned");
        wallEl.classList.add("is-live");
        const perScreen = [0, 1, 2].map((si) => calls.filter((c) => c.dataset.screen === String(si)));
        let lastKey = "";
        const showWall = (t: number) => {
          const si = Math.min(3, Math.floor(t));
          const local = t - si;
          const n = si < 3 ? Math.min(perScreen[si].length, Math.floor(local * (perScreen[si].length + 0.6)) + 1) : 0;
          const key = `${si}:${n}`;
          if (key === lastKey) return;
          lastKey = key;
          shots.forEach((sh, i) => sh.classList.toggle("is-on", i === (si === 3 ? 0 : si)));
          steps.forEach((st, i) => st.classList.toggle("is-on", i === si));
          calls.forEach((c) => c.classList.remove("is-on", "is-past"));
          if (si < 3)
            perScreen[si].forEach((c, i) => {
              if (i < n - 1) c.classList.add("is-past");
              else if (i === n - 1) c.classList.add("is-on");
            });
          readout.textContent = si < 3 && n ? `${n}. ${perScreen[si][n - 1].querySelector("span")!.textContent}` : "";
        };
        const sides = q(".jv-mon--side");
        const wall = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => showWall(wall.time()),
          scrollTrigger: { trigger: screensSec, start: "top top", end: desktop ? "+=420%" : "+=380%", pin: true, scrub: 0.6, refreshPriority: 1 },
        });
        wall
          .to({}, { duration: 3 })
          .to(main, { scale: 0.44, transformOrigin: "50% 58%", duration: 0.7, ease: "power2.inOut" }, 3)
          .fromTo(q(".jv-mon--left"), { autoAlpha: 0, x: -80, rotationY: 50, transformPerspective: 1200 }, { autoAlpha: 1, x: 0, rotationY: 18, duration: 0.6, ease: "power2.out" }, 3.15)
          .fromTo(q(".jv-mon--portrait"), { autoAlpha: 0, x: 80, rotationY: -50, transformPerspective: 1200 }, { autoAlpha: 1, x: 0, rotationY: -18, duration: 0.6, ease: "power2.out" }, 3.2)
          .to({}, { duration: 0.6 });
        gsap.set(sides, { autoAlpha: 0 });
        showWall(0);

        return () => {
          section.classList.remove("is-3d");
          tags.forEach((t) => ((t as HTMLElement).style.left = (t as HTMLElement).style.top = (t as HTMLElement).style.maxWidth = ""));
          screensSec.classList.remove("is-pinned");
          wallEl.classList.remove("is-live");
          calls.forEach((c) => c.classList.remove("is-on", "is-past"));
          lastKey = "";
        };
      }, el);

      return () => reactor.removeEventListener("click", onWake);
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} data-world="jarvis" data-tone="dark">
      {children}
    </div>
  );
}
