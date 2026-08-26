/**
 * useScrollProgress — mounts the scroll spine exactly once.
 *
 * Lenis smooths native scroll; the scrollbar stays real and every section stays
 * deep-linkable (CLAUDE.md §5). GSAP's ticker drives Lenis so the two are on one
 * clock — running Lenis on its own rAF while GSAP runs on another is the usual
 * source of scroll jitter on these pages.
 */
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { measure, update } from './scrollStore';
import { prefersReducedMotion } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress(): void {
  useEffect(() => {
    const reduced = prefersReducedMotion();

    // Reduced motion keeps native scroll. Smoothing is motion the reader asked
    // not to have, and Lenis's easing is exactly that.
    const lenis = reduced
      ? null
      : new Lenis({
          duration: 1.1,
          lerp: 0.09,
          smoothWheel: true,
          // Touch devices already have momentum scrolling that feels right.
          // Overriding it is how these pages start fighting the thumb.
          syncTouch: false,
        });

    const onScroll = (): void => {
      update();
      ScrollTrigger.update();
    };

    if (lenis) {
      lenis.on('scroll', onScroll);
      const raf = (time: number): void => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // First measure after layout has settled and fonts have had a chance.
      requestAnimationFrame(() => {
        measure();
        ScrollTrigger.refresh();
      });

      let resizeTimer: number | undefined;
      const onResize = (): void => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          measure();
          ScrollTrigger.refresh();
        }, 150);
      };
      window.addEventListener('resize', onResize, { passive: true });
      document.fonts?.ready.then(() => {
        measure();
        ScrollTrigger.refresh();
      });

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(() => {
      measure();
      ScrollTrigger.refresh();
    });

    let resizeTimer: number | undefined;
    const onResize = (): void => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measure();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });
    document.fonts?.ready.then(() => {
      measure();
      ScrollTrigger.refresh();
    });

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
