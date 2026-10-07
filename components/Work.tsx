"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK, DESKTOP } from "@/lib/gsap";
import { blazify, projects, type Project } from "@/lib/content";
import TrackHead from "./TrackHead";

const BANDS = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];
// Resting curve for the EQ when motion is off: a gentle "smile".
const REST = [0.82, 0.7, 0.55, 0.42, 0.36, 0.4, 0.5, 0.62, 0.74, 0.66];

function Equalizer() {
  return (
    <div className="eq" aria-hidden="true">
      <div className="eq-bars">
        {BANDS.map((b, i) => (
          <div className="eq-band" key={b}>
            <span className="eq-bar" style={{ transform: `scaleY(${REST[i]})` }} />
            <span className="eq-label">{b}</span>
          </div>
        ))}
      </div>
      <div className="eq-foot">
        <span>10-band EQ</span>
        <span className="acid">● Live</span>
      </div>
    </div>
  );
}

function Art({ kind }: { kind: Project["art"] }) {
  if (kind === "term")
    return (
      <pre className="art art-term" aria-hidden="true">
        <span className="dim">PS C:\&gt;</span> nexterm{"\n"}
        <span className="acid">›</span> ssh rajendra@ktm-01{"\n"}
        <span className="acid">›</span> sftp put release.zip{"\n"}
        <span className="dim">  ████████████ 100%</span>{"\n"}
        <span className="acid">›</span> <span className="caret" />
      </pre>
    );
  if (kind === "airgap")
    return (
      <pre className="art art-term" aria-hidden="true">
        <span className="dim">internet</span> ──── <span className="acid">✕</span> ──── r-ai{"\n"}
        <span className="dim">deps    </span> 0{"\n"}
        <span className="dim">runs on </span> this machine only
      </pre>
    );
  if (kind === "forest")
    return (
      <div className="art art-forest" aria-hidden="true">
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} className={`tree${[3, 8, 11, 17, 22, 26].includes(i) ? " acid" : ""}`}>
            ▲
          </span>
        ))}
      </div>
    );
  return null;
}

export default function Work() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();

      mm.add(
        MOTION_OK,
        () => {
          // EQ bands bounce to random levels while the feature is on screen.
          const bars = gsap.utils.toArray<HTMLElement>(".eq-bar");
          const bounce = bars.map((bar) =>
            gsap.to(bar, {
              scaleY: "random(0.12, 1)",
              duration: "random(0.18, 0.42)",
              ease: "power2.inOut",
              repeat: -1,
              repeatRefresh: true,
              paused: true,
            }),
          );
          ScrollTrigger.create({
            trigger: ".feature",
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => bounce.forEach((t) => (self.isActive ? t.play() : t.pause())),
          });

          gsap
            .timeline({ scrollTrigger: { trigger: ".feature", start: "top 75%", once: true } })
            .from(".feature-name-in", { yPercent: 105, duration: 1.2, ease: "expo.out" })
            .from(".feature-copy > *", { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "power3.out" }, 0.2)
            .from(".release", { x: -30, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.35)
            .from(".eq", { clipPath: "inset(100% 0 0 0)", duration: 1.2, ease: "expo.inOut" }, 0.1);
        },
        el,
      );

      // Desktop: the other projects run sideways on a pinned rail.
      mm.add(
        `${DESKTOP} and ${MOTION_OK}`,
        () => {
          const rail = el.querySelector<HTMLElement>(".rail")!;
          // Slide until the last card's right edge meets the right gutter.
          const distance = () => {
            const gutter = parseFloat(getComputedStyle(rail.parentElement!).paddingLeft);
            return Math.max(0, rail.scrollWidth - window.innerWidth + 2 * gutter);
          };
          const slide = gsap.to(rail, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: ".rail-wrap",
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
              refreshPriority: 1,
            },
          });

          gsap.to(".rail-progress-fill", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: ".rail-wrap", start: "top top", end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true },
          });

          gsap.utils.toArray<HTMLElement>(".card").forEach((card) => {
            gsap.from(card.querySelectorAll(".tree"), {
              scaleY: 0,
              duration: 0.6,
              stagger: { each: 0.03, from: "random" },
              ease: "back.out(2)",
              scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 85%" },
            });
          });
        },
        el,
      );

      mm.add(
        `(max-width: 899px) and ${MOTION_OK}`,
        () => {
          gsap.utils.toArray<HTMLElement>(".card").forEach((card) => {
            gsap.from(card, { y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 88%", once: true } });
          });
        },
        el,
      );
    },
    { scope: root },
  );

  return (
    <section id="work" className="track work" ref={root}>
      <TrackHead id="work" title="Work" note={`${blazify.releases.length + projects.length} releases`} />

      <article className="feature">
        <h3 className="feature-name">
          <span className="feature-name-in">{blazify.name}</span>
        </h3>
        <div className="feature-copy">
          <p className="feature-tag">{blazify.tagline}</p>
          <p className="feature-blurb">{blazify.blurb}</p>
          <ul className="releases">
            {blazify.releases.map((r) => (
              <li className="release" key={r.platform}>
                <a href={r.href} target="_blank" rel="noreferrer">
                  <span className="release-platform">{r.platform}</span>
                  <span className="release-stack">{r.stack}</span>
                  <span className="release-date">{r.date}</span>
                  <span className="release-go" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="feature-links">
            <a className="btn btn--solid" href={blazify.site} target="_blank" rel="noreferrer">
              Get Blazify <span aria-hidden="true">↗</span>
            </a>
            <a className="btn" href={blazify.server.href} target="_blank" rel="noreferrer">
              {blazify.server.label} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <Equalizer />
      </article>

      <div className="rail-wrap">
        <div className="rail-head">
          <p className="rail-title">Also released</p>
          <span className="rail-progress" aria-hidden="true">
            <span className="rail-progress-fill" />
          </span>
        </div>
        <ul className="rail">
          {projects.map((p) => (
            <li className="card" key={p.name}>
              <p className="card-meta">
                <span>{p.date}</span>
                <span>{p.kind}</span>
              </p>
              <h3 className="card-name">{p.name}</h3>
              <Art kind={p.art} />
              <p className="card-blurb">{p.blurb}</p>
              <p className="card-stack">{p.stack}</p>
              <div className="card-links">
                {p.links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer" aria-label={`${p.name}: ${l.label}`}>
                    {l.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
