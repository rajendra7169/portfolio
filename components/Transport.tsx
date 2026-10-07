"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "@/lib/gsap";
import { tracks, totalSeconds } from "@/lib/content";
import { scrollToTarget, useLenis } from "./SmoothScroll";

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Fixed player bar. The page is the album: scroll position is the playhead,
 * the current section is the track, and the seek bar scrolls the page.
 */
export default function Transport() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const el = root.current!;
      const seek = el.querySelector<HTMLInputElement>(".seek")!;
      const fill = el.querySelector<HTMLElement>(".seek-fill")!;
      const elapsed = el.querySelector<HTMLElement>(".t-elapsed")!;
      const no = el.querySelector<HTMLElement>(".t-no")!;
      const label = el.querySelector<HTMLElement>(".t-label")!;
      const bars = Array.from(el.querySelectorAll<HTMLElement>(".mini-eq i"));
      const sections = tracks.map((t) => document.getElementById(t.id));
      let current = -1;

      const update = (progress: number, velocity: number) => {
        fill.style.transform = `scaleX(${progress})`;
        seek.value = String(Math.round(progress * 1000));
        const secs = progress * totalSeconds;
        elapsed.textContent = fmt(secs);
        seek.setAttribute("aria-valuetext", `${fmt(secs)} of ${fmt(totalSeconds)}`);

        const mid = window.innerHeight * 0.5;
        let idx = 0;
        sections.forEach((s, i) => {
          if (s && s.getBoundingClientRect().top <= mid) idx = i;
        });
        if (idx !== current) {
          current = idx;
          no.textContent = `TRK ${String(idx + 1).padStart(2, "0")}`;
          label.textContent = tracks[idx].label;
        }

        // The little EQ dances with scroll speed.
        if (matchMedia(MOTION_OK).matches) {
          const energy = Math.min(Math.abs(velocity) / 2500, 1);
          bars.forEach((b, i) => {
            gsap.to(b, { scaleY: 0.2 + energy * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.9 + progress * 40))), duration: 0.25, overwrite: true });
          });
        }
      };

      // Track markers on the seek bar, placed where each section starts.
      const marks = Array.from(el.querySelectorAll<HTMLElement>(".seek-mark"));
      const placeMarks = () => {
        const max = ScrollTrigger.maxScroll(window);
        if (!max) return;
        marks.forEach((m) => {
          const s = document.getElementById(m.dataset.id!);
          // A pinned section sits in a spacer; measure the spacer so pinning doesn't skew it.
          const box = s?.parentElement?.classList.contains("pin-spacer") ? s.parentElement : s;
          if (box) m.style.left = `${Math.min(100, ((box.getBoundingClientRect().top + window.scrollY) / max) * 100)}%`;
        });
      };

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => update(self.progress, self.getVelocity()),
        onRefresh: (self) => {
          placeMarks();
          update(self.progress, 0);
        },
      });
      placeMarks();
      update(st.progress, 0);
    },
    { scope: root },
  );

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollToTarget(lenis, (Number(e.target.value) / 1000) * max, true);
  };

  return (
    <div className="transport" ref={root} role="region" aria-label="Page progress">
      <div className="t-now">
        <span className="mini-eq" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="t-no">TRK 01</span>
        <span className="t-label">{tracks[0].label}</span>
      </div>
      <div className="t-seek">
        <span className="seek-track" aria-hidden="true">
          <span className="seek-fill" />
          {tracks.slice(1).map((t) => (
            <span key={t.id} className="seek-mark" data-id={t.id} />
          ))}
        </span>
        <input className="seek" type="range" min={0} max={1000} defaultValue={0} aria-label="Scroll position" onChange={onSeek} />
      </div>
      <div className="t-time">
        <span className="t-elapsed">00:00</span>
        <span className="dim"> / {fmt(totalSeconds)}</span>
      </div>
    </div>
  );
}
