"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";

const motionOk = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;

// Entrance animations queue here while the curtain is closed and run as it opens.
let holding = typeof window !== "undefined" && motionOk();
const queue: (() => void)[] = [];
export function afterReveal(fn: () => void) {
  if (holding) queue.push(fn);
  else fn();
}
function release() {
  holding = false;
  queue.splice(0).forEach((fn) => fn());
}

const NavigateContext = createContext<(href: string) => void>(() => {});

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const covered = useRef(true); // the curtain starts closed for the intro
  const busy = useRef(false);

  const parts = () => {
    const el = root.current!;
    return { layers: el.querySelectorAll<HTMLElement>(".curtain-layer"), sig: el.querySelector<HTMLElement>(".curtain-sig")! };
  };

  const open = (delay = 0) => {
    const { layers, sig } = parts();
    gsap.delayedCall(delay + 0.4, release);
    gsap
      .timeline({ delay, onComplete: () => void ((covered.current = false), (busy.current = false)) })
      .to(sig, { autoAlpha: 0, y: -16, duration: 0.3, ease: "power2.in" })
      .to([...layers].reverse(), { yPercent: -100, duration: 0.75, ease: "expo.inOut", stagger: 0.09 }, 0.1)
      .set(root.current, { pointerEvents: "none" });
  };

  // First visit: write the signature, then lift the curtain.
  useEffect(() => {
    root.current!.classList.add("is-live");
    if (!motionOk()) {
      covered.current = false;
      release();
      return;
    }
    const { sig } = parts();
    gsap.fromTo(sig, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power2.inOut", delay: 0.1 });
    open(0.95);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // New route rendered under the closed curtain: reset scroll, re-measure, open.
  useEffect(() => {
    if (!covered.current || !busy.current) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      open(0.1);
    });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (href: string) => {
    if (href === pathname) {
      lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!motionOk()) return router.push(href);
    if (busy.current) return;
    busy.current = true;
    const { layers, sig } = parts();
    holding = true; // the next page's entrance animations wait for the curtain
    gsap
      .timeline()
      .set(root.current, { pointerEvents: "auto" })
      .set(layers, { yPercent: 100 })
      .set(sig, { autoAlpha: 1, y: 0, clipPath: "inset(0 100% 0 0)" })
      .to(layers, { yPercent: 0, duration: 0.65, ease: "expo.inOut", stagger: 0.09 })
      .to(sig, { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "power2.inOut" }, "-=0.25")
      .add(() => {
        covered.current = true;
        router.push(href, { scroll: false });
      });
  };

  return (
    <NavigateContext.Provider value={navigate}>
      {children}
      <div className="curtain" ref={root} aria-hidden="true">
        <div className="curtain-layer curtain-layer--sky" />
        <div className="curtain-layer curtain-layer--navy">
          <span className="curtain-sig">Rajendra Pandey</span>
        </div>
      </div>
    </NavigateContext.Provider>
  );
}

/** Internal link that plays the curtain transition. Modifier-clicks still open new tabs. */
export function TransitionLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const navigate = useContext(NavigateContext);
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href);
  };
  return <Link href={href} onClick={handle} {...rest} />;
}
