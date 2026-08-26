/**
 * Masthead — monogram, section nav, theme toggle, and the scroll progress rule.
 *
 * The progress bar is written straight to the element's transform on every
 * scroll frame. Routing it through React state would re-render the nav sixty
 * times a second to move a 2px line.
 */
import { useEffect, useRef, useState } from 'react';
import { acts } from '../content';
import { greeting } from '../content';
import { scroll, subscribeAct, subscribeScroll } from '../hooks/scrollStore';
import { ThemeToggle } from './ThemeToggle';

export function Masthead() {
  const barRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const unsubFrame = subscribeScroll((s) => {
      const bar = barRef.current;
      if (bar) bar.style.transform = `scaleX(${s.progress})`;
      const head = headRef.current;
      if (head) head.dataset.scrolled = String(s.y > 8);
    });
    const unsubAct = subscribeAct((s) => setActive(s.activeAct));
    setActive(scroll.activeAct);
    return () => {
      unsubFrame();
      unsubAct();
    };
  }, []);

  return (
    <header className="masthead" ref={headRef} data-scrolled="false">
      <a className="masthead__mark" href="#arrival">
        {greeting.initials}
        <span className="sr-only"> — back to the top</span>
      </a>

      <nav className="masthead__nav" aria-label="Sections">
        {acts.map((act) => (
          <a
            key={act.id}
            href={`#${act.id}`}
            aria-current={active === act.id ? 'true' : undefined}
          >
            {act.title}
          </a>
        ))}
      </nav>

      <ThemeToggle />

      <div className="masthead__progress" ref={barRef} aria-hidden="true" />
    </header>
  );
}
