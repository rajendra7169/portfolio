/**
 * useReveal — 16px rise plus opacity, 0.5s, once (DESIGN.md §6).
 *
 * Registered once for the whole document rather than per section: one batched
 * ScrollTrigger costs less than thirty individual ones, and it guarantees the
 * "fires once, never replays on scroll-up" rule holds everywhere instead of
 * depending on each component remembering to pass `once`.
 *
 * The stagger is capped by total duration, not per item. A fourteen-bullet
 * skills list at 0.05s each would take 700ms to finish arriving, which reads as
 * lag rather than choreography.
 */
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export function useReveal(deps: readonly unknown[] = []): void {
  useEffect(() => {
    const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]:not(.is-revealed)');
    if (targets.length === 0) return;

    if (prefersReducedMotion()) {
      // Instant opacity. No transform, no trigger, no scroll dependency.
      for (const el of targets) el.classList.add('is-revealed');
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(targets, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power1.out',
            stagger: { each: 0.05, amount: 0.25 },
            onStart: () => {
              for (const el of batch) (el as HTMLElement).classList.add('is-revealed');
            },
            // Clear the inline transform so nothing is left on the compositor.
            clearProps: 'transform,willChange',
          });
        },
      });
    });

    // Anything already above the fold when the batch registers should not wait
    // for a scroll event that may never come on a short viewport.
    ScrollTrigger.refresh();

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
