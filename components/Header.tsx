"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { nav, profile } from "@/lib/content";
import { TransitionLink } from "./PageTransition";

export default function Header() {
  const pathname = usePathname();
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  const { contextSafe } = useGSAP(
    () => {
      const el = root.current!;
      // Hide on scroll down, return on scroll up; frost once the page moves.
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate(self) {
          el.classList.toggle("is-scrolled", self.scroll() > 12);
          el.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 160);
        },
      });
    },
    { scope: root },
  );

  // The underline slides to whichever link is active or hovered.
  const moveTo = contextSafe((link: Element | null | undefined, instant = false) => {
    const bar = root.current?.querySelector<HTMLElement>(".nav-indicator");
    const list = root.current?.querySelector<HTMLElement>(".nav-list");
    if (!bar || !list) return;
    if (!link) return void gsap.to(bar, { autoAlpha: 0, duration: 0.2 });
    const l = link.getBoundingClientRect();
    const p = list.getBoundingClientRect();
    gsap.to(bar, { x: l.left - p.left, width: l.width, autoAlpha: 1, duration: instant ? 0 : 0.55, ease: "expo.out" });
  });
  const activeLink = () => root.current?.querySelector(".nav-list a[aria-current='page']");

  useGSAP(() => moveTo(activeLink(), true), { scope: root, dependencies: [pathname] });

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={`header${open ? " is-open" : ""}`} ref={root}>
      <div className="header-inner">
        <TransitionLink href="/" className="logo" aria-label={`${profile.name}, home`} onClick={() => setOpen(false)}>
          <span className="logo-bracket">&lt;</span>
          <span className="logo-sig">{profile.name}</span>
          <span className="logo-bracket">/&gt;</span>
        </TransitionLink>

        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="site-nav" aria-label="Main">
          <ul className="nav-list" onPointerLeave={() => moveTo(activeLink())}>
            {nav.map((item, i) => (
              <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noreferrer" onPointerEnter={(e) => moveTo(e.currentTarget)}>
                    {item.label}
                  </a>
                ) : (
                  <TransitionLink
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onPointerEnter={(e) => moveTo(e.currentTarget)}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </TransitionLink>
                )}
              </li>
            ))}
            <span className="nav-indicator" aria-hidden="true" />
          </ul>
        </nav>
      </div>
    </header>
  );
}
