"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";

const WAVELENGTH = 820; // px between crests of the path

export default function EduPathMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const stops = q(".ep-stop");
      const cards = q(".ep-card");
      const mm = gsap.matchMedia();

      // A card's content builds in: logo pops, text rises, points follow.
      const reveal = contextSafe!((card: HTMLElement) => {
        const c = gsap.utils.selector(card);
        gsap
          .timeline()
          .to(c(".ep-logo"), { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2.2)" })
          .to(c(".ep-when, .ep-school, .ep-degree"), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 0.1)
          .to(c(".ep-points li"), { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, 0.25)
          .to(c(".ep-links > *"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2)" }, 0.45);
      });
      // The stamp slams down, kicks up a ring of dust and shakes the card.
      const slam = contextSafe!((card: HTMLElement) => {
        const c = gsap.utils.selector(card);
        gsap
          .timeline()
          .fromTo(c(".ep-stamp-in"), { scale: 2.8, rotation: -35, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.34, ease: "power4.in" })
          .fromTo(c(".ep-dust"), { scale: 0.5, autoAlpha: 0.9 }, { scale: 1.9, autoAlpha: 0, duration: 0.7, ease: "power2.out" })
          .fromTo(card, { x: 0 }, { keyframes: { x: [0, -7, 6, -4, 2, 0] }, duration: 0.4, ease: "none" }, "<");
      });
      const unslam = contextSafe!((card: HTMLElement) => gsap.to(card.querySelector(".ep-stamp-in"), { autoAlpha: 0, scale: 1.4, duration: 0.25 }));
      const hideContent = () => {
        gsap.set(q(".ep-logo"), { scale: 0, rotation: -90 });
        gsap.set(q(".ep-when, .ep-school, .ep-degree"), { autoAlpha: 0, y: 18 });
        gsap.set(q(".ep-points li"), { autoAlpha: 0, x: 30 });
        gsap.set(q(".ep-links > *"), { autoAlpha: 0, y: 14 });
      };

      mm.add({ rail: `${DESKTOP} and ${MOTION_OK}`, flow: `(max-width: 899px) and ${MOTION_OK}` }, (ctx) => {
        const { rail, flow } = ctx.conditions as Record<string, boolean>;

        gsap.from(q(".ep-h2 .char"), {
          yPercent: 115,
          rotate: 6,
          duration: 1.1,
          stagger: 0.035,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });
        hideContent();

        if (flow) {
          // Phones: a vertical line fills as you read; stamps land as each card arrives.
          gsap.fromTo(q(".ep-vfill"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: q(".ep-stops")[0], start: "top 70%", end: "bottom 60%", scrub: true } });
          cards.forEach((card) => {
            ScrollTrigger.create({ trigger: card, start: "top 85%", once: true, onEnter: () => reveal(card) });
            ScrollTrigger.create({ trigger: card, start: "top 45%", onEnter: () => slam(card), onLeaveBack: () => unslam(card) });
          });
          return;
        }
        if (!rail) return;

        // Desktop: pin the viewport and travel sideways through the years.
        el.classList.add("is-rail");
        const viewport = q(".ep-viewport")[0];
        const track = q(".ep-track")[0];
        const line = q(".ep-line")[0];
        const svg = line.querySelector("svg")!;
        const [bg, fg] = Array.from(line.querySelectorAll<SVGPathElement>(".ep-path"));
        const rider = q(".ep-rider")[0];
        const nodes = q(".ep-node");
        const yearEl = q(".ep-year")[0];
        const years = stops.map((s) => Number(s.dataset.year));
        let W = 0;
        let mid = 0;
        let amp = 0;
        let centres: number[] = [];
        let lastYear = -1;

        // One formula draws the path and places the rider, so they always agree.
        const wave = (x: number) => mid + amp * Math.sin((x / WAVELENGTH) * Math.PI * 2);
        const slope = (x: number) => Math.atan(((amp * 2 * Math.PI) / WAVELENGTH) * Math.cos((x / WAVELENGTH) * Math.PI * 2));

        const build = () => {
          W = track.scrollWidth;
          const H = line.clientHeight;
          mid = H / 2;
          amp = H * 0.28;
          svg.setAttribute("width", String(W));
          svg.setAttribute("height", String(H));
          svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
          let d = `M0 ${wave(0).toFixed(1)}`;
          for (let x = 16; x <= W + 16; x += 16) d += `L${x} ${wave(x).toFixed(1)}`;
          bg.setAttribute("d", d);
          fg.setAttribute("d", d);
          // Measured against the track itself (offsetLeft would be relative to the list).
          const t = track.getBoundingClientRect().left;
          centres = stops.map((s) => s.getBoundingClientRect().left - t + s.offsetWidth / 2);
          nodes.forEach((n, i) => gsap.set(n, { x: centres[i], y: wave(centres[i]) }));
        };

        // Year under the rider: interpolated between the stops, so the gap years tick by too.
        const yearAt = (x: number) => {
          if (x <= centres[0]) return years[0];
          for (let i = 0; i < centres.length - 1; i++) {
            if (x <= centres[i + 1]) return gsap.utils.interpolate(years[i], years[i + 1], (x - centres[i]) / (centres[i + 1] - centres[i]));
          }
          return years[years.length - 1];
        };

        const update = () => {
          const x = -Number(gsap.getProperty(track, "x")) + window.innerWidth / 2;
          gsap.set(fg, { drawSVG: `0% ${Math.max(0, Math.min(100, (x / W) * 100))}%` });
          gsap.set(rider, { x, y: wave(x), rotation: (slope(x) * 180) / Math.PI });
          const y = Math.round(yearAt(x));
          if (y !== lastYear) {
            lastYear = y;
            yearEl.textContent = String(y);
          }
          nodes.forEach((n, i) => n.classList.toggle("is-passed", x >= centres[i] - 2));
        };

        build();
        const distance = () => track.scrollWidth - window.innerWidth;
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          onUpdate: update,
          scrollTrigger: {
            trigger: viewport,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onRefresh: () => {
              build();
              update();
            },
          },
        });
        update();

        cards.forEach((card, i) => {
          // The first card is on screen before the pin starts, so it reveals on arrival.
          if (i === 0) ScrollTrigger.create({ trigger: viewport, start: "top 70%", once: true, onEnter: () => reveal(card) });
          else ScrollTrigger.create({ trigger: stops[i], containerAnimation: slide, start: "left 85%", once: true, onEnter: () => reveal(card) });
          ScrollTrigger.create({
            trigger: stops[i],
            containerAnimation: slide,
            start: "center 60%",
            onEnter: () => slam(card),
            onLeaveBack: () => unslam(card),
          });
        });

        return () => el.classList.remove("is-rail");
      }, el);
    },
    { scope: root },
  );

  return (
    <section className="ep" ref={root} aria-labelledby="degrees">
      {children}
    </section>
  );
}
