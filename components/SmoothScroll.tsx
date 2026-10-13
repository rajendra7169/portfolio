"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Scroll to a y position or element, through Lenis when it's running. */
export function scrollToTarget(lenis: Lenis | null, target: number | HTMLElement, immediate = false) {
  if (lenis) lenis.scrollTo(target, { immediate, duration: 1.4 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "instant" : "smooth" });
  else target.scrollIntoView({ behavior: immediate ? "instant" : "smooth" });
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Fonts change line lengths, which moves every trigger below the fold.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ autoRaf: false, lerp: 0.1, anchors: true });
    // One clock: Lenis is driven by GSAP's ticker and reports back to ScrollTrigger.
    // But only while it's gliding: on the ticker for good, it asked for a frame on
    // every screen refresh even with nothing moving, and each of those frames
    // restyled every animated thing on the page. Every smooth scroll, from the
    // wheel, an anchor or code, goes through scrollTo, so that wakes it; it comes
    // off once the glide is done (and GSAP's ticker can then sleep).
    instance.on("scroll", ScrollTrigger.update);
    let awake = false;
    let fresh = false;
    const raf = (time: number) => {
      // The first frame back moves one frame's worth, not the time asleep (a jump)
      // nor nothing (a stall).
      if (fresh) {
        fresh = false;
        instance.time = time * 1000 - 1000 / 60;
      }
      instance.raf(time * 1000);
      if (instance.isScrolling !== "smooth") {
        gsap.ticker.remove(raf);
        awake = false;
      }
    };
    const scrollTo = instance.scrollTo.bind(instance);
    instance.scrollTo = (...args: Parameters<Lenis["scrollTo"]>) => {
      if (!awake) {
        awake = true;
        fresh = true;
        gsap.ticker.add(raf);
      }
      return scrollTo(...args);
    };
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
