"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";
import { lyrics } from "@/lib/content";
import TrackHead from "./TrackHead";

export default function Lyrics() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const words = Array.from(el.querySelectorAll<HTMLElement>(".w"));
      const lines = Array.from(el.querySelectorAll<HTMLElement>(".lrc-line"));
      const mm = gsap.matchMedia();

      mm.add(
        { desktop: `${DESKTOP} and ${MOTION_OK}`, mobile: `(max-width: 899px) and ${MOTION_OK}` },
        (ctx) => {
          const desktop = Boolean(ctx.conditions?.desktop);
          let now = -1;

          // Word-by-word, like Blazify's synced lyrics: scroll is the playhead.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: desktop ? el : el.querySelector(".lrc"),
              start: desktop ? "top top" : "top 78%",
              end: desktop ? `+=${words.length * 30}` : "bottom 40%",
              pin: desktop,
              scrub: 0.4,
              onUpdate(self) {
                const i = Math.min(words.length - 1, Math.floor(self.progress * words.length));
                if (i === now) return;
                words[now]?.classList.remove("is-now");
                words[i].classList.add("is-now");
                now = i;
                const line = words[i].closest(".lrc-line");
                lines.forEach((l) => l.classList.toggle("is-active", l === line));
              },
            },
          });
          tl.fromTo(words, { opacity: 0.13 }, { opacity: 1, duration: 0.1, stagger: 0.1, ease: "none" });

          return () => {
            words.forEach((w) => w.classList.remove("is-now"));
            lines.forEach((l) => l.classList.remove("is-active"));
          };
        },
        el,
      );
    },
    { scope: root },
  );

  return (
    <section id="lyrics" className="track lyrics" ref={root}>
      <TrackHead id="lyrics" title="Lyrics" note="Synced · word by word" />
      <ol className="lrc">
        {lyrics.map(({ t, line }) => (
          <li className="lrc-line" key={t}>
            <span className="lrc-time">[{t}]</span>
            <p className="lrc-text">
              {line.split(" ").map((word, i) => (
                <span className="w" key={i}>
                  {word}{" "}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
