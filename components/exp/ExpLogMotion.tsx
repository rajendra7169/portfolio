"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";

// Lane x positions in px — must match --lx in globals.css (.xg-commit--*).
const LX = { main: 18, side: 52, blazify: 86 } as const;
type Lane = keyof typeof LX;

export default function ExpLogMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const graph = q(".xg-graph")[0];
      const svg = graph.querySelector("svg")!;
      const ptr = q(".xg-ptr")[0];
      const rows = q(".xg-commit");
      const shows = q(".xg-show");
      const lanes = rows.map((r) => (Object.keys(LX) as Lane[]).find((l) => r.classList.contains(`xg-commit--${l}`))!);
      const path = (lane: Lane) => svg.querySelector<SVGPathElement>(`.xg-lane--${lane}`)!;

      // Draw the branch lines through the actual dot positions, so forks and
      // merges land on the commits at any width.
      const build = () => {
        const g = graph.getBoundingClientRect();
        const H = graph.offsetHeight;
        svg.setAttribute("width", "120");
        svg.setAttribute("height", String(H));
        svg.setAttribute("viewBox", `0 0 120 ${H}`);
        const ys = rows.map((r) => {
          const d = r.querySelector(".xg-dot")!.getBoundingClientRect();
          return d.top - g.top + d.height / 2;
        });
        const curve = (x1: number, y1: number, x2: number, y2: number) => {
          const k = (y2 - y1) / 2;
          return `C${x1} ${y1 + k} ${x2} ${y2 - k} ${x2} ${y2}`;
        };
        const side = lanes.map((l, i) => (l === "side" ? i : -1)).filter((i) => i >= 0);
        const blz = lanes.map((l, i) => (l === "blazify" ? i : -1)).filter((i) => i >= 0);

        path("main").setAttribute("d", `M${LX.main} ${ys[0]} L${LX.main} ${H}`);
        if (side.length) {
          const s0 = side[0];
          const sN = side[side.length - 1];
          const fork = (ys[s0 - 1] + ys[s0]) / 2;
          const merge = ys[sN] + (ys[sN + 1] - ys[sN]) * 0.4;
          path("side").setAttribute(
            "d",
            `M${LX.main} ${fork} ${curve(LX.main, fork, LX.side, ys[s0])} L${LX.side} ${ys[sN]} ${curve(LX.side, ys[sN], LX.main, merge)}`,
          );
        }
        if (blz.length) {
          const b0 = blz[0];
          const fork = ys[b0 - 1] + (ys[b0] - ys[b0 - 1]) * 0.45;
          // Blazify is ongoing: its branch runs on to the bottom of the log.
          path("blazify").setAttribute("d", `M${LX.main} ${fork} ${curve(LX.main, fork, LX.blazify, ys[b0])} L${LX.blazify} ${H}`);
        }
      };
      build();
      const ro = new ResizeObserver(build);
      ro.observe(graph);

      // Terminal: `git show` for the commit in view, typed line by line.
      let active = -1;
      const setActive = (i: number) => {
        if (i === active) return;
        active = i;
        shows.forEach((s, k) => s.classList.toggle("is-on", k === i));
        rows.forEach((r, k) => r.classList.toggle("is-current", k === i));
        if (!matchMedia(MOTION_OK).matches) return;
        const lines = Array.from(shows[i].querySelectorAll<HTMLElement>(".xg-line:not(.xg-line--body)"));
        const body = shows[i].querySelector(".xg-line--body");
        gsap.killTweensOf([...lines, body]);
        gsap.fromTo(lines, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.32, ease: "steps(18)", stagger: 0.08 });
        gsap.fromTo(body, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: lines.length * 0.08, ease: "power2.out" });
      };

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: `${DESKTOP} and ${MOTION_OK}`, calm: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { motion, desktop, calm } = ctx.conditions as Record<string, boolean>;

        if (calm) {
          // Still: the whole graph drawn, HEAD at the bottom, the terminal on HEAD.
          gsap.set(ptr, { y: graph.offsetHeight });
          setActive(rows.length - 1);
          return;
        }
        if (!motion) return;

        q(".xg-h2").forEach((h) =>
          gsap.from(h.querySelectorAll(".char"), {
            yPercent: 115,
            rotate: 6,
            duration: 1.1,
            stagger: 0.035,
            ease: "expo.out",
            scrollTrigger: { trigger: h, start: "top 85%", once: true },
          }),
        );

        // Branch cards rise in; each branch name decodes.
        gsap.from(q(".xg-branch"), {
          y: 60,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: q(".xg-branches")[0], start: "top 80%", once: true },
          onStart() {
            q(".xg-branch-ref b").forEach((b, i) =>
              gsap.to(b, { scrambleText: { text: b.textContent ?? "", chars: "abcdefghijklmnopqrstuvwxyz-", speed: 0.6 }, duration: 0.9, delay: i * 0.15 }),
            );
          },
        });

        // The graph draws itself as you scroll, with HEAD riding the edge.
        // clamp(): the last commits sit near the page bottom and could never reach these
        // lines otherwise; clamping keeps every trigger within the scrollable range.
        const draw = { trigger: graph, start: "top 62%", end: "clamp(bottom 62%)", scrub: 0.4, invalidateOnRefresh: true };
        gsap.fromTo(svg, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: draw });
        gsap.fromTo(ptr, { y: 0 }, { y: () => graph.offsetHeight, ease: "none", scrollTrigger: draw });

        // Each commit lands as the drawing reaches it.
        gsap.set(q(".xg-dot"), { scale: 0 });
        gsap.set(q(".xg-c-body > *"), { autoAlpha: 0, x: 24 });
        rows.forEach((row) => {
          ScrollTrigger.create({
            trigger: row,
            start: "clamp(top 66%)",
            once: true,
            onEnter: () => {
              row.classList.add("is-in");
              gsap.to(row.querySelector(".xg-dot"), { scale: 1, duration: 0.6, ease: "back.out(3)" });
              gsap.to(row.querySelectorAll(".xg-c-body > *"), { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" });
            },
          });
        });

        // Desktop: the sticky terminal follows the commit in the middle of the screen.
        if (desktop) {
          // One tracker instead of a trigger per row: the commit nearest the reading
          // line wins, and HEAD wins once the page can't scroll any further (the last
          // rows can never reach the line, and per-row triggers would overlap there).
          const pick = () => {
            if (ScrollTrigger.maxScroll(window) - window.scrollY < 4) return setActive(rows.length - 1);
            const line = window.innerHeight * 0.58;
            let best = 0;
            let bestD = Infinity;
            rows.forEach((r, i) => {
              const b = r.getBoundingClientRect();
              const d = Math.abs(b.top + b.height / 2 - line);
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            });
            setActive(best);
          };
          ScrollTrigger.create({ trigger: graph, start: "top bottom", end: "bottom top", onUpdate: pick, onToggle: pick, onRefresh: pick });
        }
      }, el);

      return () => ro.disconnect();
    },
    { scope: root },
  );

  return (
    <div className="xg" ref={root}>
      {children}
    </div>
  );
}
