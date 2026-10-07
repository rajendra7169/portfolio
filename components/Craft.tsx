"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "@/lib/gsap";
import { disciplines, languages } from "@/lib/content";
import TrackHead from "./TrackHead";

export default function Craft() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        MOTION_OK,
        () => {
          // Ticker of languages; scroll speed and direction push it along.
          const loop = gsap.to(".ticker-track", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
          const drift = ScrollTrigger.create({
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
            onUpdate(self) {
              const v = self.getVelocity();
              const dir = self.direction;
              gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 220, 7)), duration: 0.2, overwrite: true });
              gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, ease: "power2.out" });
            },
          });
          if (!drift.isActive) loop.pause();

          gsap.utils.toArray<HTMLElement>(".craft-row").forEach((row) => {
            gsap
              .timeline({ scrollTrigger: { trigger: row, start: "top 86%", once: true } })
              .from(row.querySelector(".craft-rule"), { scaleX: 0, duration: 1.1, ease: "expo.inOut" })
              .from(row.querySelector(".craft-name-in"), { yPercent: 110, duration: 1, ease: "expo.out" }, 0.25)
              .from(row.querySelectorAll(".craft-label, .craft-points li"), { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.4);
          });
        },
        root.current!,
      );
    },
    { scope: root },
  );

  const tickerItems = [...languages, ...languages];

  return (
    <section id="craft" className="track craft" ref={root}>
      <TrackHead id="craft" title="Craft" note={`${languages.length} languages · 4 disciplines`} />

      <div className="ticker" aria-label={`Languages: ${languages.join(", ")}`}>
        <div className="ticker-track" aria-hidden="true">
          {tickerItems.map((l, i) => (
            <span className="ticker-item" key={i}>
              {l}
              <span className="ticker-sep">/</span>
            </span>
          ))}
        </div>
      </div>

      <div className="craft-list">
        {disciplines.map((d) => (
          <article className="craft-row" key={d.name}>
            <span className="craft-rule" aria-hidden="true" />
            <h3 className="craft-name">
              <span className="craft-name-in">{d.name}</span>
            </h3>
            <div className="craft-body">
              <p className="craft-label">{d.full}</p>
              <ul className="craft-points">
                {d.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
