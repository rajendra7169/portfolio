"use client";

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";

const RING = 2 * Math.PI * 22;

/** Thin reading-progress bar at the top, and a back-to-top button whose ring fills as you scroll. */
export default function ScrollUI() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const el = root.current!;
      const bar = el.querySelector<HTMLElement>(".progress-bar")!;
      const btn = el.querySelector<HTMLElement>(".to-top")!;
      const ring = el.querySelector<SVGCircleElement>(".to-top-ring")!;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate(self) {
          bar.style.transform = `scaleX(${self.progress})`;
          ring.style.strokeDashoffset = String(RING * (1 - self.progress));
          btn.classList.toggle("is-shown", self.scroll() > 500);
        },
      });
    },
    { scope: root },
  );

  const toTop = () => (lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" }));

  return (
    <div ref={root}>
      <div className="progress" aria-hidden="true">
        <span className="progress-bar" />
      </div>
      <button type="button" className="to-top" onClick={toTop} aria-label="Back to top">
        <svg viewBox="0 0 50 50" aria-hidden="true">
          <circle cx="25" cy="25" r="22" className="to-top-track" />
          <circle cx="25" cy="25" r="22" className="to-top-ring" strokeDasharray={RING} strokeDashoffset={RING} />
        </svg>
        <span className="to-top-arrow" aria-hidden="true">↑</span>
      </button>
    </div>
  );
}
