"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";
import { DAYS, statsOn } from "./journey";

const TARGET = { kcal: 2431, p: 109, c: 362, f: 61 };
type Day = { kcal: number; p: number; c: number; f: number };
// Illustrative estimates, in the shape Fitevo's AI returns them.
const MEALS: { text: string; items: [string, number, number, number, number][] }[] = [
  { text: "2 rotis and a bowl of dal", items: [["Roti × 2", 240, 8, 44, 6], ["Dal, 1 bowl", 180, 12, 26, 4]] },
  { text: "a plate of chicken momo and a lassi", items: [["Chicken momo × 10", 420, 24, 48, 14], ["Lassi, 1 glass", 220, 8, 34, 6]] },
  { text: "a banana and 3 boiled eggs", items: [["Banana", 105, 1, 27, 0], ["Boiled eggs × 3", 216, 19, 1, 15]] },
];
const DAY_FROM = 6 * 60 + 30;
const DAY_TO = 22 * 60 + 30;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;

export default function FitevoMotion({ className, children }: { className: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const keys = ["kcal", "p", "c", "f"] as const;
      const fills = Object.fromEntries(keys.map((k) => [k, q(`.fv-r-${k} .fv-r-fill`)[0] as unknown as SVGCircleElement])) as Record<(typeof keys)[number], SVGCircleElement>;
      const left = q(".fv-left")[0];
      const macroNums = Object.fromEntries(q(".fv-macro b").map((b) => [(b as HTMLElement).dataset.k, b]));
      const paint = (d: Day) => {
        keys.forEach((k) => {
          const c = Number(fills[k].dataset.c);
          gsap.set(fills[k], { strokeDashoffset: c * (1 - Math.min(1, d[k] / TARGET[k])) });
        });
        left.textContent = String(Math.max(0, Math.round(TARGET.kcal - d.kcal)));
        (["p", "c", "f"] as const).forEach((k) => (macroNums[k].textContent = `${Math.max(0, Math.round(TARGET[k] - d[k]))} g`));
      };
      const sum = (m: (typeof MEALS)[number]) => m.items.reduce((t, [, kcal, p, c, f]) => ({ kcal: t.kcal + kcal, p: t.p + p, c: t.c + c, f: t.f + f }), { kcal: 0, p: 0, c: 0, f: 0 });
      // Without motion: the first meal, already logged.
      paint(sum(MEALS[0]));

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        const text = q(".fv-ask-text")[0];
        const out = q(".fv-ask-out")[0];
        const core = q(".fv-rings")[0];
        el.classList.add("is-live");

        // ── The ring draws itself, then the day starts eating into it.
        const day: Day = { kcal: 0, p: 0, c: 0, f: 0 };
        paint(day);
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .from(q(".fv-kicker"), { y: 16, autoAlpha: 0, duration: 0.8 }, 0.1)
          .from(q(".fv-title > span:last-child"), { yPercent: 60, autoAlpha: 0, duration: 1.3 }, 0.15)
          .from(q(".fv-tagline, .fv-ask, .fv-lede, .fv-links > *"), { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.45)
          .from(q(".fv-rings-svg"), { rotation: -90, scale: 0.8, autoAlpha: 0, duration: 1.6 }, 0.2)
          .from(q(".fv-r-track"), { drawSVG: "0%", duration: 1.4, stagger: 0.12, ease: "power3.inOut" }, 0.35)
          .from(q(".fv-left"), { textContent: 0, snap: { textContent: 1 }, duration: 1.4, ease: "power2.out" }, 0.6)
          .from(q(".fv-rings-core small, .fv-macro"), { autoAlpha: 0, y: 10, duration: 0.7, stagger: 0.06 }, 1);

        // ── Meals, typed in one sentence each, land in the ring.
        const meals = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });
        meals.add(() => {
          Object.assign(day, { kcal: 0, p: 0, c: 0, f: 0 });
          out.replaceChildren();
          paint(day);
        });
        MEALS.forEach((m) => {
          const typed = { n: 0 };
          const add = sum(m);
          meals
            .add(() => void (text.textContent = ""))
            .to(typed, { n: m.text.length, duration: m.text.length * 0.045, ease: "none", onUpdate: () => void (text.textContent = m.text.slice(0, Math.round(typed.n))) }, "+=0.4")
            .add(() => q(".fv-ask")[0].classList.add("is-sent"), "+=0.25")
            .add(
              inContext(ctx, () => {
                q(".fv-ask")[0].classList.remove("is-sent");
                const from = out.getBoundingClientRect();
                const to = core.getBoundingClientRect();
                out.replaceChildren(
                  ...m.items.map(([name, kcal]) => {
                    const li = document.createElement("li");
                    li.innerHTML = `<b>${name}</b><em>${kcal} kcal</em>`;
                    return li;
                  }),
                );
                const chips = Array.from(out.children);
                gsap.fromTo(chips, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.12, ease: "back.out(1.8)" });
                // …then fly into the ring.
                gsap.to(chips, {
                  x: to.left + to.width / 2 - from.left - 80,
                  y: to.top + to.height / 2 - from.top,
                  scale: 0.3,
                  autoAlpha: 0,
                  duration: 0.8,
                  ease: "power3.in",
                  stagger: 0.1,
                  delay: 1.1,
                });
              }),
              "+=0.5",
            )
            .to(day, {
              kcal: `+=${add.kcal}`,
              p: `+=${add.p}`,
              c: `+=${add.c}`,
              f: `+=${add.f}`,
              duration: 1.2,
              ease: "power2.out",
              onUpdate: () => paint(day),
            }, "+=1.6")
            .to({}, { duration: 1.6 });
        });
        meals.add(() => out.replaceChildren(), "+=0.4");
        afterReveal(() => {
          intro.play();
          gsap.delayedCall(2.2, inContext(ctx, () => meals.play()));
        });
        ScrollTrigger.create({
          trigger: q(".fv-hero")[0],
          start: "top top",
          end: "bottom top",
          onToggle: inContext(ctx, (s: ScrollTrigger) => (s.isActive ? meals.resume() : meals.pause())),
        });

        // ── A personal record: the number climbs and the confetti goes off.
        const burst = q(".fv-pr-burst")[0];
        const COLORS = ["#e8702c", "#e8b65a", "#6ba66b", "#b5697a", "#6b86c9", "#f4ecdd"];
        const party = inContext(ctx, () => {
          for (let i = 0; i < 70; i++) {
            const bit = document.createElement("i");
            bit.style.background = COLORS[i % COLORS.length];
            burst.appendChild(bit);
            gsap.fromTo(
              bit,
              { x: 0, y: 0, rotation: 0, autoAlpha: 1 },
              {
                physics2D: { velocity: gsap.utils.random(320, 820), angle: gsap.utils.random(200, 340), gravity: 900 },
                rotation: gsap.utils.random(-540, 540),
                autoAlpha: 0,
                duration: gsap.utils.random(1.6, 2.6),
                ease: "power1.in",
                onComplete: () => bit.remove(),
              },
            );
          }
        });
        gsap.set(q(".fv-tiers-fill"), { scaleX: 0, transformOrigin: "left center" });
        gsap.set(q(".fv-tiers-dot"), { left: "0%" });
        ScrollTrigger.create({
          trigger: q(".fv-pr")[0],
          start: "top 62%",
          once: true,
          onEnter: inContext(ctx, () => {
            gsap.fromTo(q(".fv-pr-num"), { textContent: "0.0" }, { textContent: 1.4, snap: { textContent: 0.1 }, duration: 1.4, ease: "power2.out", onUpdate: function () {
              const n = q(".fv-pr-num")[0];
              n.textContent = Number(n.textContent).toFixed(1);
            } });
            gsap.to(q(".fv-tiers-fill"), { scaleX: 0.5, duration: 1.4, ease: "power3.out" });
            gsap.to(q(".fv-tiers-dot"), { left: "50%", duration: 1.4, ease: "power3.out" });
            gsap.delayedCall(1.2, party);
            gsap.from(q(".fv-pr-big"), { scale: 0.7, autoAlpha: 0, duration: 1.2, ease: "back.out(1.6)" });
          }),
        });

        // ── The badges: a first year scrolls by, and each badge unlocks on the
        // day its rule is met. Scroll runs event to event, so quiet months fly past.
        const badges = q(".fv-badges")[0] as HTMLElement;
        const medals = q(".fv-medal") as HTMLElement[];
        const at = medals.map((m) => +m.dataset.at!);
        const keys = [0, ...Array.from(new Set(at)).sort((a, b) => a - b), DAYS - 1];
        const dayAt = (p: number) => {
          const x = p * (keys.length - 1);
          const i = Math.min(keys.length - 2, Math.floor(x));
          return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
        };
        const stat = Object.fromEntries(q("[data-stat]").map((n) => [(n as HTMLElement).dataset.stat!, n]));
        const toast = q(".fv-toast")[0];
        const fill = q(".fv-ruler-fill")[0];
        let shown = -1;
        const year = inContext(ctx, (p: number) => {
          const d = Math.round(dayAt(p));
          if (d === shown) return;
          const back = d < shown;
          shown = d;
          const s = statsOn(d);
          stat.day.textContent = String(s.day);
          stat.sessions.textContent = String(s.sessions);
          stat.streak.textContent = String(s.streak);
          stat.volume.textContent = s.volume.toLocaleString("en-US");
          stat.prs.textContent = String(s.prs);
          stat.best.textContent = String(s.best);
          gsap.set(fill, { scaleX: d / (DAYS - 1) });
          medals.forEach((m, i) => {
            const was = !m.classList.contains("is-locked");
            const now = d >= at[i];
            m.classList.toggle("is-locked", !now);
            if (now && !was && !back) {
              m.classList.remove("is-new");
              void m.offsetWidth;
              m.classList.add("is-new");
              gsap.fromTo(m.querySelector(".fv-medal-disc"), { rotationY: -180, scale: 0.7 }, { rotationY: 0, scale: 1, duration: 0.8, ease: "back.out(1.8)", overwrite: "auto" });
              toast.innerHTML = `<span class="fv-toast-in"><i>★</i><span>Badge unlocked: ${m.querySelector("b")!.textContent}<small>Day ${s.day}</small></span></span>`;
              gsap.fromTo(toast.firstElementChild, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" });
            }
          });
        });
        badges.classList.add("is-pinned");
        year(0);
        ScrollTrigger.create({
          trigger: badges,
          start: "top top",
          end: desktop ? "+=320%" : "+=360%",
          pin: true,
          scrub: true,
          refreshPriority: 0,
          onUpdate: (st) => year(st.progress),
        });
        q(".fv-check").forEach((m) => m.classList.add("is-todo"));
        ScrollTrigger.batch(q(".fv-check"), {
          start: "top 82%",
          once: true,
          onEnter: (batch: Element[]) => batch.forEach((m, i) => setTimeout(() => m.classList.remove("is-todo"), i * 160)),
        });

        // ── The heartbeat runs through the stack as you scroll past it.
        gsap.from(q(".fv-ecg path"), { drawSVG: "0%", ease: "none", scrollTrigger: { trigger: q(".fv-pulse-row")[0], start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
        gsap.from(q(".fv-nodes li"), { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: q(".fv-pulse-row")[0], start: "top 75%", once: true } });

        // ── A day: the clock runs from morning to night through the real screens.
        {
          const items = q(".fv-day-item");
          const shots = q(".fv-shot");
          const clock = q(".fv-clock")[0];
          const bar = q(".fv-day-track i")[0];
          const section = q(".fv-day")[0] as HTMLElement;
          const stamps = q(".fv-day-item time").map((t) => {
            const [h, m] = (t.textContent ?? "06:30").split(":").map(Number);
            return h * 60 + m;
          });
          const screen = q(".fv-day-phone .dv-phone-screen")[0] as HTMLElement;
          section.classList.add("is-pinned");
          gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
          let cur = 0;
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: desktop ? "+=240%" : "+=300%",
            pin: true,
            refreshPriority: 1,
            onUpdate: inContext(ctx, (s: ScrollTrigger) => {
              const t = s.progress;
              // Each screen holds an equal stretch of scroll; the clock runs from
              // its time to the next one's, so it always matches the screen.
              const seg = t * items.length;
              const i = Math.min(items.length - 1, Math.floor(seg));
              const from = stamps[i];
              const to = stamps[i + 1] ?? DAY_TO;
              const now = from + (to - from) * Math.min(1, seg - i);
              const dayT = (now - DAY_FROM) / (DAY_TO - DAY_FROM);
              section.style.setProperty("--t", dayT.toFixed(3));
              clock.textContent = hhmm(now);
              gsap.set(bar, { scaleX: dayT });
              if (i === cur) return;
              items.forEach((it, j) => it.classList.toggle("is-on", j === i));
              gsap.to(shots[cur], { autoAlpha: 0, duration: 0.35, overwrite: "auto" });
              gsap.fromTo(shots[i], { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "expo.out", overwrite: "auto" });
              screen.style.setProperty("--top", (shots[i] as HTMLElement).dataset.top ?? "#12100e");
              cur = i;
            }),
          });
          return () => {
            section.classList.remove("is-pinned");
            badges.classList.remove("is-pinned");
            medals.forEach((m) => m.classList.remove("is-locked", "is-new"));
            el.classList.remove("is-live");
            out.replaceChildren();
          };
        }
      }, el);
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} data-world="fitevo" data-tone="dark">
      {children}
    </div>
  );
}
