"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "@/lib/gsap";
import { profile, contact } from "@/lib/content";

function Glyphs({ word }: { word: string }) {
  return (
    <>
      {word.split("").map((c, i) => (
        <span key={i} className="glyph" aria-hidden="true">
          {c}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const name = el.querySelector<HTMLElement>(".hero-name")!;
      const glyphs = Array.from(el.querySelectorAll<HTMLElement>(".glyph"));
      const mm = gsap.matchMedia();

      mm.add(
        MOTION_OK,
        () => {
          // Intro: the type stretches from condensed to expanded while each
          // letter rises like a band on an equalizer.
          let live = false;
          const intro = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => void (live = true) });
          intro
            .set(name, { autoAlpha: 1 })
            .fromTo(name, { "--wdth": 62 }, { "--wdth": 125, duration: 1.7, ease: "expo.inOut" }, 0)
            .fromTo(glyphs, { scaleY: 0 }, { scaleY: 1, duration: 1.3, stagger: { each: 0.05, from: "random" } }, 0.1)
            .fromTo(".hero-reveal", { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.09 }, 0.85);

          // Live EQ: an idle wave runs through the letters; the pointer pumps the
          // bands nearest to it. Top row grows up, bottom row grows down.
          const centers: number[] = [];
          const scale = glyphs.map(() => 1);
          const measure = () =>
            glyphs.forEach((g, i) => {
              const r = g.getBoundingClientRect();
              centers[i] = r.left + r.width / 2;
            });
          let px = -1e4;
          let gain = 0;
          const onMove = (e: PointerEvent) => void (px = e.clientX);
          const onLeave = () => void (px = -1e4);

          const tick = (time: number) => {
            if (!live) return;
            gain = Math.min(1, gain + 0.015);
            const reach = window.innerWidth * 0.11;
            for (let i = 0; i < glyphs.length; i++) {
              const idle = 0.07 * Math.sin(time * 2.1 + i * 0.8) + 0.04 * Math.sin(time * 3.3 + i * 1.7);
              const d = (px - centers[i]) / reach;
              const pump = 0.42 * Math.exp(-d * d);
              const target = 1 + (idle + pump) * gain;
              scale[i] += (target - scale[i]) * 0.12;
              glyphs[i].style.transform = `scaleY(${scale[i].toFixed(4)})`;
            }
          };

          measure();
          window.addEventListener("resize", measure);
          el.addEventListener("pointermove", onMove);
          el.addEventListener("pointerleave", onLeave);

          // Only run the EQ while the hero is on screen.
          const watcher = ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
          });
          if (watcher.isActive) gsap.ticker.add(tick);

          // Leaving: the two lines shear apart and the copy lifts away.
          const out = { trigger: el, start: "top top", end: "bottom top", scrub: true };
          gsap.to(".hero-line--a", { xPercent: -9, ease: "none", scrollTrigger: out });
          gsap.to(".hero-line--b", { xPercent: 9, ease: "none", scrollTrigger: out });
          gsap.to(".hero-foot", { y: -80, autoAlpha: 0, ease: "none", scrollTrigger: { ...out, end: "55% top" } });

          return () => {
            gsap.ticker.remove(tick);
            window.removeEventListener("resize", measure);
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
            glyphs.forEach((g) => (g.style.transform = ""));
          };
        },
        root,
      );
    },
    { scope: root },
  );

  return (
    <section id="top" className="hero" ref={root}>
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-meta hero-reveal">
        <span>
          <span className="acid">▶</span> Now playing
        </span>
        <span>
          {profile.role} · {profile.company}
        </span>
        <span>
          {profile.city} · {profile.coords}
        </span>
      </div>

      <h1 className="hero-name" aria-label={profile.name}>
        <span className="hero-line hero-line--a">
          <Glyphs word={profile.first} />
        </span>
        <span className="hero-line hero-line--b">
          <Glyphs word={profile.last} />
        </span>
      </h1>

      <div className="hero-foot">
        <p className="hero-intro hero-reveal">{profile.intro}</p>
        <div className="hero-actions hero-reveal">
          <a className="btn btn--solid" href="#work">
            See the work
          </a>
          <a className="btn" href={contact.socials[0].href} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
        {profile.photo ? (
          <figure className="hero-photo hero-reveal">
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized by `npm run images` */}
            <img
              src={`/images/${profile.photo}-800.webp`}
              srcSet={`/images/${profile.photo}-800.webp 800w, /images/${profile.photo}-1600.webp 1600w`}
              sizes="220px"
              alt={`Portrait of ${profile.name}`}
            />
          </figure>
        ) : (
          <span className="hero-cue hero-reveal" aria-hidden="true">
            Scroll to play <span className="hero-cue-line" />
          </span>
        )}
      </div>
    </section>
  );
}
