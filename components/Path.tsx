"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "@/lib/gsap";
import { path, certifications } from "@/lib/content";
import TrackHead from "./TrackHead";

export default function Path() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        MOTION_OK,
        () => {
          // The rail fills as you read down the timeline; each stop lights up as it's reached.
          gsap.fromTo(
            ".stops-fill",
            { scaleY: 0 },
            { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".stops", start: "top 62%", end: "bottom 62%", scrub: true } },
          );
          gsap.utils.toArray<HTMLElement>(".stop").forEach((stop) => {
            gsap.from(stop.querySelectorAll(".stop-when, .stop-body > *"), {
              y: 22,
              autoAlpha: 0,
              duration: 0.8,
              stagger: 0.06,
              ease: "power3.out",
              scrollTrigger: { trigger: stop, start: "top 80%", once: true },
            });
            ScrollTrigger.create({ trigger: stop, start: "top 62%", end: "max", toggleClass: "is-on" });
          });
          gsap.from(".cert", {
            y: 30,
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.07,
            ease: "power3.out",
            scrollTrigger: { trigger: ".certs", start: "top 82%", once: true },
          });
        },
        root.current!,
      );
    },
    { scope: root },
  );

  return (
    <section id="path" className="track path" ref={root}>
      <TrackHead id="path" title="Path" note="2015 → now" />

      <div className="stops">
        <span className="stops-rail" aria-hidden="true">
          <span className="stops-fill" />
        </span>
        <ol className="stops-list">
        {path.map((s) => (
          <li className="stop" key={s.title}>
            <span className="stop-dot" aria-hidden="true" />
            <p className="stop-when">{s.when}</p>
            <div className="stop-body">
              <h3 className="stop-title">{s.title}</h3>
              <p className="stop-where">{s.where}</p>
              <p className="stop-note">{s.note}</p>
            </div>
          </li>
        ))}
        </ol>
      </div>

      <div className="certs">
        <h3 className="certs-title">Certifications</h3>
        <ul className="certs-grid">
          {certifications.map((c) => (
            <li className="cert" key={c.name}>
              <span className="cert-tag">Cert</span>
              <span className="cert-name">{c.name}</span>
              <span className="cert-by">{c.by}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
