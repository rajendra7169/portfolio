"use client";

// Pauses the looping animations of the page's sections that are off screen, and
// lets them carry on from where they were when they come back. Unseen, they
// still kept the browser restyling and re-compositing every frame. Paused
// through the animations themselves (not a CSS rule on the section, which
// restyled every element in it each time it came or went), and SVG's own
// animations (<animateMotion> and friends) through their svg. A CSS animation
// is held at playback rate 0 rather than paused: once a script has paused or
// played one, the browser stops listening to its animation-play-state, and
// some pages pause their loops through CSS (What I Do, for the modules not
// in view).
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const WATCH = "section, footer";

export default function Offscreen() {
  const path = usePathname();
  useEffect(() => {
    type Held = { anims: { a: Animation; rate: number }[]; svgs: SVGSVGElement[] };
    const held = new WeakMap<Element, Held>();
    const toggle = (el: Element, off: boolean) => {
      if (off) {
        if (held.has(el)) return;
        const anims = el
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === "running" && a.playbackRate !== 0 && a.effect?.getComputedTiming().iterations === Infinity)
          .map((a) => ({ a, rate: a.playbackRate }));
        anims.forEach(({ a }) => (a instanceof CSSAnimation ? a.updatePlaybackRate(0) : a.pause()));
        // Only the svgs running now: one already paused is someone else's to resume.
        const svgs = [...el.querySelectorAll("svg")].filter((svg) => !svg.animationsPaused() && svg.querySelector("animate, animateMotion, animateTransform, set"));
        svgs.forEach((svg) => svg.pauseAnimations());
        held.set(el, { anims, svgs });
      } else {
        const h = held.get(el);
        if (!h) return;
        held.delete(el);
        h.anims.forEach(({ a, rate }) => (a instanceof CSSAnimation ? a.updatePlaybackRate(rate) : a.playState === "paused" && a.play()));
        h.svgs.forEach((svg) => svg.unpauseAnimations());
      }
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
