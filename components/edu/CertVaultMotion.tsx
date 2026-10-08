"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

export default function CertVaultMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const cards = q(".cv-card");
      const grid = q(".cv-grid")[0];

      // Flip works everywhere, motion or not: a real toggle button.
      const flips = q(".cv-flip").map((btn) => {
        const card = btn.closest(".cv-card")!;
        const onClick = () => {
          const on = card.classList.toggle("is-flipped");
          btn.setAttribute("aria-pressed", String(on));
        };
        btn.addEventListener("click", onClick);
        return () => btn.removeEventListener("click", onClick);
      });

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, fine: `${MOTION_OK} and (hover: hover) and (pointer: fine)` }, (ctx) => {
        const { motion, fine } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;

        gsap.from(q(".cv-h2 .char"), {
          yPercent: 115,
          rotate: 6,
          duration: 1.1,
          stagger: 0.035,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });

        // Deal: every card starts in one shuffled stack at the centre of the grid,
        // then flies to its slot. Measured at deal time, so it survives resizes.
        gsap.set(cards, { autoAlpha: 0 });
        const deal = contextSafe!(() => {
          const g = grid.getBoundingClientRect();
          const cx = g.left + g.width / 2;
          const cy = g.top + g.height / 2;
          gsap.fromTo(
            cards,
            {
              autoAlpha: 1,
              x: (_i: number, c: HTMLElement) => cx - (c.getBoundingClientRect().left + c.offsetWidth / 2),
              y: (_i: number, c: HTMLElement) => cy - (c.getBoundingClientRect().top + c.offsetHeight / 2),
              rotation: () => gsap.utils.random(-18, 18),
              scale: 0.75,
            },
            { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.1, ease: "expo.out", stagger: { each: 0.09, from: "end" } },
          );
          // A foil glint sweeps each card as it lands.
          gsap.fromTo(q(".cv-front .cv-foil"), { "--fx": "0%", opacity: 0.9 }, { "--fx": "100%", opacity: 0, duration: 1.2, stagger: 0.09, delay: 0.6, ease: "power2.inOut", clearProps: "all" }); // hand --fx back to the cursor
        });
        ScrollTrigger.create({ trigger: grid, start: "top 78%", once: true, onEnter: deal });

        if (!fine) return;

        // Tilt + foil that follows the cursor, per card.
        const off = cards.map((card) => {
          const tilt = card.querySelector<HTMLElement>(".cv-tilt")!;
          gsap.set(tilt, { transformPerspective: 900 });
          const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.5, ease: "power3.out" });
          const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.5, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = tilt.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width;
            const ny = (e.clientY - r.top) / r.height;
            ry((nx - 0.5) * 22);
            rx(-(ny - 0.5) * 18);
            card.style.setProperty("--mx", `${nx * 100}%`);
            card.style.setProperty("--my", `${ny * 100}%`);
            card.style.setProperty("--fx", `${20 + nx * 60}%`);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          tilt.addEventListener("pointermove", move);
          tilt.addEventListener("pointerleave", leave);
          return () => {
            tilt.removeEventListener("pointermove", move);
            tilt.removeEventListener("pointerleave", leave);
          };
        });
        return () => off.forEach((fn) => fn());
      }, el);

      return () => flips.forEach((fn) => fn());
    },
    { scope: root },
  );

  return (
    <section className="cv section" ref={root} aria-labelledby="certifications">
      {children}
    </section>
  );
}
