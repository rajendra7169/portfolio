"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { gsap, ScrollTrigger, holdSetups, runSetups } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";
import { leavePage, type Leaving } from "./pageLeave";
import { startWelcome, warmStoriesFonts, type Welcoming } from "./stories/welcome";

const motionOk = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;

// Entrance animations queue here while a page is on its way in, and run the
// moment it is in place (inside the view transition, so they play live).
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

/**
 * How to leave for the next page. Without `via`, it's a view transition: the
 * header stays put, the old page lifts away, the page title glides to where the
 * new one sits, and the new page plays its own entrance. With `via`, the page
 * goes through a portal: a rectangle (`from`, usually an app's screen) grows to
 * fill the window in `color`, with `icon` in the middle, and the next page
 * reveals out of it.
 */
export type Via = { from: DOMRect; color: string; icon?: string };
type Navigate = (href: string, via?: Via) => void;
const NavigateContext = createContext<Navigate>(() => {});

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const busy = useRef(false);
  const portal = useRef<HTMLDivElement>(null);
  const viaPortal = useRef(false);
  const arriving = useRef(false);
  const leaving = useRef<Leaving | null>(null);
  const welcoming = useRef<Welcoming | null>(null);

  const toTop = () => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  };

  // First visit: the page's own entrance plays straight away.
  useEffect(() => {
    release();
  }, []);

  // Pointing at a way into Stories starts the fonts its welcome writes with.
  useEffect(() => {
    const warm = (e: Event) => (e.target as Element | null)?.closest?.('a[href^="/stories"]') && warmStoriesFonts();
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("focusin", warm);
    return () => {
      document.removeEventListener("pointerover", warm);
      document.removeEventListener("focusin", warm);
    };
  }, []);

  // A page change, as the new page commits underneath the cover. Back to the top,
  // and once the new page has painted, start clearing the cover (on the
  // compositor). A frame later, with that already moving, the new page's
  // animation set-ups and entrance run; the cover keeps fading smoothly while
  // they do. (The heroes and scroll reveals are hidden by CSS until then.)
  useLayoutEffect(() => {
    if (!arriving.current) return;
    arriving.current = false;
    document.documentElement.classList.remove("is-leaving");
    toTop();
    requestAnimationFrame(() => {
      const started = leaving.current?.arrive() ?? Promise.resolve();
      leaving.current = null;
      started.then(() => {
        release(); // entrances play as soon as their own set-up runs
        runSetups(() => {
          // One last measure of everything, when the browser has a moment.
          const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
          idle(() => ScrollTrigger.refresh(), { timeout: 1200 });
          window.setTimeout(() => void (busy.current = false), 300);
        });
      });
    });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Into Stories: the welcome hands over to the page once it's in.
  useLayoutEffect(() => {
    const w = welcoming.current;
    if (!w) return;
    welcoming.current = null;
    toTop();
    w.arrive().then(() => void (busy.current = false));
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // The new route has rendered.
  useEffect(() => {
    // Through the portal: reset, re-measure, and open it.
    if (!viaPortal.current || !busy.current) return;
    toTop();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      viaPortal.current = false;
      runSetups(); // under the portal, so the world is ready when it opens
      gsap.delayedCall(0.25, release);
      gsap
        .timeline({ delay: 0.1, onComplete: () => void (busy.current = false) })
        .to(portal.current!.querySelector(".portal-icon"), { scale: 0.6, autoAlpha: 0, duration: 0.35, ease: "power2.in" })
        .to(portal.current, { autoAlpha: 0, duration: 0.7, ease: "power2.out" }, 0.15)
        .set(portal.current, { display: "none" });
    });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate: Navigate = (href, via) => {
    if (href === pathname) {
      lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (busy.current) return;
    if (!motionOk()) return router.push(href);
    // Crossing into Stories, the other side of the site, gets its own welcome.
    if (href.startsWith("/stories") && !pathname.startsWith("/stories")) {
      busy.current = true;
      const w = startWelcome();
      welcoming.current = w;
      w.covered.then(() => router.push(href, { scroll: false }));
      window.setTimeout(() => {
        // If Stories never arrives (a failed load), put everything back.
        if (welcoming.current !== w) return;
        welcoming.current = null;
        busy.current = false;
        w.cancel();
      }, 9000);
      return;
    }
    if (via) {
      busy.current = true;
      holding = true; // the next page's entrance waits for the portal to open
      const el = portal.current!;
      const img = el.querySelector<HTMLElement>(".portal-icon")!;
      const r = via.from;
      const inset = (t: number, rt: number, b: number, l: number, round: number) => `inset(${t}px ${rt}px ${b}px ${l}px round ${round}px)`;
      img.style.backgroundImage = via.icon ? `url("${via.icon}")` : "none";
      gsap
        .timeline()
        .set(el, { display: "grid", autoAlpha: 1, background: via.color, clipPath: inset(r.top, innerWidth - r.right, innerHeight - r.bottom, r.left, 28) })
        .set(img, { autoAlpha: via.icon ? 1 : 0, scale: 0.5 })
        .to(el, { clipPath: inset(0, 0, 0, 0, 0), duration: 0.75, ease: "expo.inOut" })
        .to(img, { scale: 1, duration: 0.6, ease: "back.out(1.8)" }, 0.25)
        .add(() => {
          viaPortal.current = true;
          holdSetups();
          router.push(href, { scroll: false });
        });
      return;
    }
    // The click answers at once: a copy of this page lifts away (pageLeave.ts),
    // a loading bar runs if the next page takes a moment, and the new page is
    // put together underneath.
    busy.current = true;
    holding = true;
    arriving.current = true;
    const html = document.documentElement;
    html.classList.add("is-leaving");
    // Out of Stories, back to the portfolio: its page turns back over the sky.
    const sky = getComputedStyle(html).getPropertyValue("--color-sky").trim() || "#edf9fe";
    leaving.current = leavePage(pathname.startsWith("/stories") && !href.startsWith("/stories") ? { turn: true, background: sky } : {});
    holdSetups();
    // Swap only once the lift is running on its own (see pageLeave.ts).
    const go = () => router.push(href, { scroll: false });
    if (leaving.current) leaving.current.ready.then(go, go);
    else go();
    window.setTimeout(() => {
      // If the route never arrives (a failed load), put everything back.
      if (!arriving.current) return;
      arriving.current = false;
      busy.current = false;
      html.classList.remove("is-leaving");
      leaving.current?.cancel();
      leaving.current = null;
      release();
      runSetups();
    }, 8000);
  };

  return (
    <NavigateContext.Provider value={navigate}>
      {children}
      <div className="nav-loading" aria-hidden="true" />
      <div className="portal" ref={portal} aria-hidden="true">
        {/* the app's icon, set when a portal opens (a span, so no empty <img> sits on every page) */}
        <span className="portal-icon" />
      </div>
    </NavigateContext.Provider>
  );
}

/** The page navigation itself, for code that plays its own exit first (the app launcher). */
export const useNavigate = () => useContext(NavigateContext);

/** Internal link that plays the page transition. Modifier-clicks still open new tabs. */
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
