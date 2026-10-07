"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * A navy dot with a trailing ring. The ring swells over anything clickable and
 * shows a label from data-cursor="…". Mouse-only; the native cursor stays.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
        const el = root.current!;
        const dot = el.querySelector<HTMLElement>(".cursor-dot")!;
        const ring = el.querySelector<HTMLElement>(".cursor-ring")!;
        const label = el.querySelector<HTMLElement>(".cursor-label")!;
        gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
        const dx = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
        const dy = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
        const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

        const move = (e: PointerEvent) => {
          dx(e.clientX);
          dy(e.clientY);
          rx(e.clientX);
          ry(e.clientY);
          el.classList.add("is-on");
        };
        const over = (e: PointerEvent) => {
          const target = (e.target as Element).closest<HTMLElement>("a, button, [data-cursor], input, label");
          el.classList.toggle("is-hover", !!target);
          const text = target?.dataset.cursor ?? "";
          label.textContent = text;
          el.classList.toggle("has-label", !!text);
        };
        const leave = () => el.classList.remove("is-on");
        const down = () => el.classList.add("is-down");
        const up = () => el.classList.remove("is-down");

        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("pointerover", over, { passive: true });
        document.addEventListener("pointerleave", leave);
        window.addEventListener("pointerdown", down);
        window.addEventListener("pointerup", up);
        return () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerover", over);
          document.removeEventListener("pointerleave", leave);
          window.removeEventListener("pointerdown", down);
          window.removeEventListener("pointerup", up);
        };
      });
    },
    { scope: root },
  );

  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <span className="cursor-ring">
        <span className="cursor-ring-in">
          <span className="cursor-label" />
        </span>
      </span>
      <span className="cursor-dot" />
    </div>
  );
}
