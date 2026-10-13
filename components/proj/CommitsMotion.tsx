"use client";

// The contribution calendar coming in (Commits.tsx). On wider screens the weeks
// fill in left to right as the section scrolls up, the HEAD marker riding along
// the top with the date it has reached; on phones (where the calendar scrolls
// sideways and opens on the latest weeks) it fills in once as it arrives. When
// the whole year is in, the stats count up. Hovering a square shows its day.
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

export default function CommitsMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const cal = q(".gc-cal")[0];
      const scroller = q(".gc-scroll")[0];
      const weeks = q(".gc-week");
      const headDate = q(".gc-head-date")[0];
      const tip = q(".gc-tip")[0];
      const card = q(".gc-card")[0];
      const total = weeks.length;
      const lastOf = (w: HTMLElement) => [...w.querySelectorAll<HTMLElement>("i[data-d]")].pop()?.dataset.d ?? "";
      const finalDate = headDate.textContent ?? "";
      scroller.scrollLeft = scroller.scrollWidth; // phones open on the latest weeks

      // A square's day, under the pointer.
      const over = (ev: Event) => {
        const e = ev as PointerEvent;
        const cell = (e.target as HTMLElement).closest<HTMLElement>("i[data-d]");
        if (!cell || e.pointerType !== "mouse") return void tip.classList.remove("is-on");
        const n = Number(cell.dataset.c);
        tip.textContent = `${n ? `${n} contribution${n === 1 ? "" : "s"}` : "No contributions"} on ${cell.dataset.d}`;
        const c = cell.getBoundingClientRect();
        const b = card.getBoundingClientRect();
        tip.style.setProperty("--x", `${c.left + c.width / 2 - b.left}px`);
        tip.style.setProperty("--y", `${c.top - b.top}px`);
        tip.classList.add("is-on");
      };
      const out = () => tip.classList.remove("is-on");
      cal.addEventListener("pointerover", over);
      cal.addEventListener("pointerleave", out);

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        let shown = -1;
        let counted = false;
        const countUp = () => {
          if (counted) return;
          counted = true;
          q(".gc-stats b[data-to]").forEach((b, i) =>
            gsap.fromTo(b, { textContent: 0 }, { textContent: Number(b.dataset.to), snap: { textContent: 1 }, duration: 1.1, delay: i * 0.08, ease: "power2.out" }),
          );
        };
        // Weeks up to n are in; HEAD sits on the last of them.
        const show = (n: number) => {
          n = Math.max(0, Math.min(total, n));
          if (n === shown) return;
          shown = n;
          weeks.forEach((w, i) => w.classList.toggle("is-on", i < n));
          cal.style.setProperty("--at", String(Math.max(0, n - 1)));
          cal.classList.toggle("is-end", n >= total - 3); // HEAD's label turns to stay inside the card
          headDate.textContent = n >= total ? finalDate : lastOf(weeks[Math.max(0, n - 1)]);
          if (n >= total) countUp();
        };
        cal.classList.add("is-armed");
        show(0);

        const wide = window.matchMedia("(min-width: 720px)").matches;
        if (wide) {
          ScrollTrigger.create({
            trigger: card,
            // Ends while the card's foot is still well above the bottom: this is the last
            // section, so the page can't scroll the card any higher than that.
            start: "top 90%",
            end: "bottom 85%",
            scrub: true,
            onUpdate: (self) => show(Math.round(self.progress * total)),
            onLeave: () => show(total),
          });
        } else {
          const p = { n: 0 };
          ScrollTrigger.create({
            trigger: card,
            start: "top 80%",
            once: true,
            onEnter: () => void gsap.to(p, { n: total, duration: 1.2, ease: "power1.inOut", onUpdate: () => show(Math.round(p.n)) }),
          });
        }
        return () => {
          cal.classList.remove("is-armed");
          weeks.forEach((w) => w.classList.remove("is-on"));
          headDate.textContent = finalDate;
        };
      });

      return () => {
        cal.removeEventListener("pointerover", over);
        cal.removeEventListener("pointerleave", out);
      };
    },
    { scope: root },
  );

  return (
    <section className="section gc" aria-labelledby="gc-title" ref={root}>
      {children}
    </section>
  );
}
