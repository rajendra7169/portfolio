"use client";

// Pauses the looping animations of the page's sections that are off screen, and
// lets them carry on from where they were when they come back. Unseen, they
// still kept the browser restyling and re-compositing every frame. Paused
// through the animations themselves (not a CSS rule on the section, which
// restyled every element in it each time it came or went), and SVG's own
// animations (<animateMotion> and friends) through their svg.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const WATCH = "section, footer";

export default function Offscreen() {
  const path = usePathname();
  useEffect(() => {
    const held = new WeakMap<Element, Animation[]>();
    const smil = (el: Element, off: boolean) =>
      el.querySelectorAll("svg").forEach((svg) => {
        if (svg.querySelector("animate, animateMotion, animateTransform, set")) (off ? svg.pauseAnimations() : svg.unpauseAnimations());
      });
    const toggle = (el: Element, off: boolean) => {
      if (off) {
        const running = el.getAnimations({ subtree: true }).filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity);
        running.forEach((a) => a.pause());
        held.set(el, running);
      } else {
        held.get(el)?.forEach((a) => a.playState === "paused" && a.play());
        held.delete(el);
      }
      smil(el, off);
    };
    // Exactly the screen: a section just below it (What I Do, under the home hero)
    // still counts as off screen, and its loops wait until it scrolls in.
    const io = new IntersectionObserver((entries) => entries.forEach((e) => toggle(e.target, !e.isIntersecting)), { rootMargin: "0px" });
    const seen = new WeakSet<Element>();
    const watch = () =>
      document.querySelectorAll(WATCH).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    // Run again for each page (this sits in the layout, under every page): its
    // sections now, and any that arrive a moment later. (Not a MutationObserver
    // over the page: with text typing itself every frame, watching every change
    // cost more than it saved while scrolling.)
    watch();
    const late = window.setTimeout(watch, 1500);
    return () => {
      clearTimeout(late);
      io.disconnect();
      document.querySelectorAll(WATCH).forEach((el) => held.has(el) && toggle(el, false));
    };
  }, [path]);
  return null;
}
