"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";
import { matchStatus } from "@/components/proj/light";
import { healthLabel, healthOf, hhmm, kathmandu, seasonOf, skyAt, weatherOf, type Kind } from "./forest";

const PHASE = { night: "Night", dawn: "Dawn", day: "Day", dusk: "Dusk" };
const greet = (m: number) => (m < 300 ? "Working late?" : m < 720 ? "Good morning" : m < 1020 ? "Good afternoon" : m < 1260 ? "Good evening" : "Working late?");

export default function TallyMotion({ className, month, slots, children }: { className: string; month: Kind[]; slots: number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const html = document.documentElement;
      const motion = () => matchMedia(MOTION_OK).matches;
      const one = <T extends Element = HTMLElement>(s: string) => q(s)[0] as unknown as T;

      // ── The sky over Kathmandu ─────────────────────────────────────────
      const dial = one<HTMLInputElement>(".tl-range-input");
      const dialTime = one(".tl-dial-time");
      const dialPhase = one(".tl-dial-phase");
      const clock = one(".tl-clock");
      const greeting = one(".tl-greet");
      let shown = -1;
      const paint = (min: number) => {
        const s = skyAt(min / 60);
        const v: Record<string, string | number> = {
          "--sky-top": s.top,
          "--sky-bottom": s.bottom,
          "--sun-x": s.sun.x,
          "--sun-y": s.sun.y,
          "--sun-o": s.sun.o,
          "--moon-x": s.moon.x,
          "--moon-y": s.moon.y,
          "--moon-o": s.moon.o,
        };
        Object.entries(v).forEach(([k, x]) => el.style.setProperty(k, String(x)));
        const dark = s.moon.o > 0.5;
        el.dataset.phase = s.phase;
        el.dataset.tone = dark ? "dark" : "light";
        html.style.setProperty("--w-bg", s.top);
        html.style.setProperty("--w-fg", dark ? "#e8f1ff" : "#0d2818");
        dialTime.textContent = hhmm(min);
        dialPhase.textContent = PHASE[s.phase];
        shown = min;
      };
      let live = true;
      const now = kathmandu();
      el.dataset.season = seasonOf(now.month);
      dial.value = String(now.minutes);
      paint(now.minutes);
      const tick = () => {
        const k = kathmandu();
        clock.textContent = hhmm(k.minutes);
        greeting.textContent = greet(k.minutes);
        if (live) {
          dial.value = String(k.minutes);
          paint(k.minutes);
        }
      };
      tick();
      const timer = setInterval(tick, 20000);

      let glide: gsap.core.Tween | null = null;
      const onDial = () => {
        live = false;
        glide?.kill();
        paint(+dial.value);
      };
      const onNow = () => {
        live = true;
        const to = kathmandu().minutes;
        glide?.kill();
        if (!motion()) return void ((dial.value = String(to)), paint(to));
        const o = { m: shown };
        glide = gsap.to(o, { m: to, duration: 1.4, ease: "power2.inOut", onUpdate: () => ((dial.value = String(Math.round(o.m))), paint(o.m)) });
      };
      dial.addEventListener("input", onDial);
      const nowBtn = one(".tl-now");
      nowBtn.addEventListener("click", onNow);

      // ── Check in, check out: a sapling, then a tree ─────────────────────
      const btn = one<HTMLButtonElement>(".tl-check");
      const log = one(".tl-log");
      const geo = one(".tl-geo");
      let slot = 0;
      let inside = false;
      const grow = (node: Element, from = 0) =>
        motion()
          ? gsap.fromTo(node, { autoAlpha: 1, scale: from, transformOrigin: "50% 100%" }, { scale: 1, duration: 1.1, ease: "elastic.out(1, 0.55)" })
          : gsap.set(node, { autoAlpha: 1, scale: 1 });
      const onCheck = () => {
        const t = hhmm(kathmandu().minutes);
        const sap = q(`.tl-plant-sapling[data-slot="${slot}"]`)[0];
        const tree = q(`.tl-plant-tree[data-slot="${slot}"]`)[0];
        if (!inside) {
          inside = true;
          geo.classList.remove("is-ping");
          void geo.offsetWidth;
          geo.classList.add("is-ping");
          grow(sap);
          log.textContent = `Checked in at ${t}, 12 m from the office. A sapling is in the ground.`;
          btn.textContent = "Check out";
          return;
        }
        inside = false;
        gsap.to(sap, { autoAlpha: 0, scale: 0.6, duration: motion() ? 0.3 : 0, transformOrigin: "50% 100%" });
        grow(tree, 0.25);
        slot++;
        log.textContent = `Checked out at ${t}. Today’s tree has grown.`;
        btn.textContent = slot < slots ? "Check in" : "See you tomorrow";
        btn.disabled = slot >= slots;
      };
      btn.addEventListener("click", onCheck);

      // ── A month, tree by tree ───────────────────────────────────────────
      const monthEl = one(".tl-month");
      const cells = q(".tl-cal li");
      const scene = one(".tl-month-scene");
      const score = one(".tl-score");
      const label = one(".tl-label");
      const weather = one(".tl-weather");
      const count = one(".tl-count");
      let last = -1;
      const show = (n: number) => {
        if (n === last) return;
        last = n;
        const days = month.slice(0, n);
        cells.forEach((c, i) => {
          c.classList.toggle("is-past", i < n);
          c.classList.toggle("is-today", i === n - 1);
        });
        const s = healthOf(days);
        score.textContent = String(s);
        label.textContent = n ? healthLabel(s) : "Waiting";
        const w = weatherOf(days);
        weather.textContent = w;
        scene.dataset.weather = w.toLowerCase();
        count.textContent = String(days.filter((k) => k !== "off" && k !== "absent").length);
      };

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion: ok, desktop } = ctx.conditions as Record<string, boolean>;
        if (!ok) {
          gsap.set(q(".tl-plant"), { autoAlpha: 0 });
          return;
        }

        // The grove grows in, the title rises out of it.
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        const grove = gsap.utils.shuffle(q(".tl-grove-tree"));
        intro
          .fromTo(grove, { scale: 0, transformOrigin: "50% 100%" }, { scale: 1, duration: 1.2, ease: "back.out(1.6)", stagger: 0.025 }, 0)
          .from(q(".tl-range path"), { yPercent: 18, autoAlpha: 0, duration: 1.6, stagger: 0.15 }, 0)
          .from(q(".tl-name, .tl-tag"), { yPercent: 60, autoAlpha: 0, duration: 1.1, stagger: 0.12 }, 0.35)
          .from(q(".tl-kind, .tl-lede, .tl-links"), { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.6)
          .from(q(".tl-card"), { y: 40, autoAlpha: 0, rotation: 2, duration: 1.1 }, 0.7)
          .from(q(".tl-dial"), { y: 30, autoAlpha: 0, duration: 0.9 }, 0.9);
        afterReveal(() => intro.play());

        // The month: each working day grows its tree as the playhead passes.
        monthEl.classList.add("is-live");
        // On phones the forest is wider than the screen, so the camera pans along it with the days.
        const forest = q(".tl-month-forest")[0];
        const pan = () => (desktop ? 0 : -(forest.getBoundingClientRect().width - scene.clientWidth));
        const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" }, onUpdate: () => show(Math.max(0, Math.min(month.length, Math.floor(tl.time() - 0.2) + 1))) });
        if (!desktop) tl.fromTo(forest, { x: 0 }, { x: pan, duration: month.length + 1, ease: "none", immediateRender: true }, 0);
        month.forEach((_, i) => {
          const tree = q(`.tl-month-forest .tl-tree[data-day="${i}"]`)[0];
          if (tree) tl.fromTo(tree, { scale: 0, transformOrigin: "50% 100%" }, { scale: 1, duration: 0.8 }, i + 0.2);
        });
        tl.to({}, { duration: 1 });
        show(0);
        ScrollTrigger.create({ animation: tl, trigger: monthEl, start: "top top", end: desktop ? "+=240%" : "+=320%", pin: true, scrub: 0.6, refreshPriority: 1, invalidateOnRefresh: true });

        // The roots draw down to the four layers under every tree.
        const roots = gsap.timeline({ scrollTrigger: { trigger: q(".tl-roots-stage")[0], start: "top 80%", end: desktop ? "bottom 75%" : "top 20%", scrub: 0.6 } });
        roots
          .fromTo(q(".tl-roots-tree"), { scale: 0, transformOrigin: "50% 100%" }, { scale: 1, duration: 0.3, ease: "back.out(1.6)" }, 0)
          .fromTo(q(".tl-root"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6, stagger: 0.05, ease: "none" }, 0.15)
          .from(q(".tl-nodes li"), { autoAlpha: 0, y: 16, duration: 0.2, stagger: 0.08 }, 0.5);

        // Inside the app: the laptop and the phone turn their screens together.
        const real = q(".tl-real")[0] as HTMLElement;
        const dShots = q(".tl-tshot-d");
        const pShots = q(".tl-tshot-p");
        const caps = q(".tl-tour-caps li") as HTMLElement[];
        const dots = q(".tl-tour-dots i");
        const phoneScreen = q(".tl-dev-phone .dv-phone-screen")[0] as HTMLElement;
        real.classList.add("is-pinned");
        let at = -1;
        const turn = (i: number) => {
          if (i === at) return;
          at = i;
          const pi = +caps[i].dataset.phone!;
          dShots.forEach((x, j) => x.classList.toggle("is-on", j === i));
          pShots.forEach((x, j) => x.classList.toggle("is-on", j === pi));
          caps.forEach((x, j) => x.classList.toggle("is-on", j === i));
          dots.forEach((x, j) => x.classList.toggle("is-on", j === i));
          matchStatus(phoneScreen, (pShots[pi] as HTMLElement).dataset.top);
        };
        turn(0);
        ScrollTrigger.create({
          trigger: real,
          start: "top top",
          end: () => `+=${dShots.length * (desktop ? 55 : 60)}%`,
          pin: true,
          refreshPriority: 0,
          onUpdate: (st) => turn(Math.min(dShots.length - 1, Math.floor(st.progress * dShots.length))),
        });

        ScrollTrigger.batch(q(".tl-feat-list li"), { start: "top 88%", once: true, onEnter: (b) => gsap.from(b, { y: 30, autoAlpha: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }) });
        gsap.set(q(".tl-plant"), { autoAlpha: 0 });

        return () => {
          real.classList.remove("is-pinned");
          monthEl.classList.remove("is-live");
          last = -1;
          show(month.length);
        };
      }, el);

      return () => {
        clearInterval(timer);
        glide?.kill();
        dial.removeEventListener("input", onDial);
        nowBtn.removeEventListener("click", onNow);
        btn.removeEventListener("click", onCheck);
        ["--w-bg", "--w-fg"].forEach((v) => html.style.removeProperty(v));
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} data-world="tally" data-tone="light">
      {children}
    </div>
  );
}
