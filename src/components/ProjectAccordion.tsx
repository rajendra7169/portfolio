/**
 * ProjectAccordion — DESIGN.md §5.6. DOM and CSS, deliberately not WebGL: the
 * texture-memory failure mode simply does not exist here, and the ledger ridge
 * keeps drifting behind the panels in the global canvas regardless.
 *
 * Two controllers drive the same index and must never fight. Scroll owns the
 * state on desktop — the section pins and progress maps to an index — and a
 * click scrolls to that index rather than setting state on its own. Below the
 * breakpoint, and under reduced motion, there is no pin and clicking sets the
 * index directly.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FeaturedProject } from '../content';
import type { Repo } from '../data/repos';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export interface PanelData {
  project: FeaturedProject;
  repo: Repo;
}

interface ProjectAccordionProps {
  panels: PanelData[];
}

const DESKTOP = '(min-width: 64rem)';

export function ProjectAccordion({ panels }: ProjectAccordionProps) {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const baseId = useId();

  // Reduced motion opens every panel and stacks them. No pin, no flex tween.
  // Resolved after mount, not during render: the page is prerendered, and
  // reading a media query during render makes the two passes disagree.
  const [allOpen, setAllOpen] = useState(false);
  useEffect(() => {
    setAllOpen(prefersReducedMotion());
  }, []);

  useLayoutEffect(() => {
    if (allOpen || panels.length < 2) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      setPinned(true);
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: 'center center',
        // One viewport-height of scroll per panel after the first. Enough room
        // that each panel is readable before the next takes over.
        end: () => `+=${(panels.length - 1) * window.innerHeight * 0.7}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(
            panels.length - 1,
            Math.max(0, Math.round(self.progress * (panels.length - 1))),
          );
          setActive(i);
        },
      });
      triggerRef.current = st;

      return () => {
        triggerRef.current = null;
        setPinned(false);
      };
    });

    return () => mm.revert();
  }, [panels.length, allOpen]);

  /**
   * Click and scroll stay in sync because the click does not set state. It
   * scrolls, and the scroll handler sets the state — one source of truth.
   */
  const select = useCallback(
    (i: number) => {
      const st = triggerRef.current;
      if (!st) {
        setActive(i);
        return;
      }
      const span = st.end - st.start;
      const target = st.start + (span * i) / Math.max(1, panels.length - 1);
      window.scrollTo({ top: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [panels.length],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const delta =
        e.key === 'ArrowRight' || e.key === 'ArrowDown'
          ? 1
          : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
            ? -1
            : e.key === 'Home'
              ? -panels.length
              : e.key === 'End'
                ? panels.length
                : 0;
      if (delta === 0) return;
      e.preventDefault();
      const next = Math.min(panels.length - 1, Math.max(0, active + delta));
      select(next);
      // Move focus with the selection so a keyboard reader stays oriented.
      requestAnimationFrame(() => {
        document.getElementById(`${baseId}-tab-${next}`)?.focus();
      });
    },
    [active, panels.length, select, baseId],
  );

  useEffect(() => {
    return () => {
      // Kill anything this component created so a route change or hot reload
      // cannot leave a pin spacer behind. the brief §5.
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, []);

  if (panels.length === 0) return null;

  return (
    <div className="accordion-wrap" ref={wrapRef}>
      <div
        className="accordion"
        {...(allOpen
          ? {}
          : {
              role: 'tablist',
              'aria-label': 'Selected projects',
              // Below the desktop breakpoint the panels stack, and a tablist
              // that claims to be horizontal while rendering vertically is
              // worse than no orientation hint at all.
              'aria-orientation': pinned ? ('horizontal' as const) : ('vertical' as const),
              onKeyDown,
            })}
        data-pinned={pinned ? 'true' : undefined}
      >
        {panels.map(({ project, repo }, i) => {
          const expanded = allOpen || i === active;
          const lang = repo.languageColor;
          return (
            <article
              className="panel"
              key={project.repo}
              data-expanded={expanded ? 'true' : 'false'}
              // The language colour survives only as the 2px edge. As a panel
              // wash it turned six projects into lavender, mint and baby blue —
              // a rainbow of pastels, which is what "reads as a family" was
              // supposed to prevent.
              style={lang ? ({ ['--panel-accent' as string]: lang }) : undefined}
            >
              {expanded ? <span className="panel__indicator" aria-hidden="true" /> : null}

              {allOpen ? (
                <div className="panel__sliver panel__sliver--static">
                  <span className="panel__index figures">{String(i + 1).padStart(2, '0')}</span>
                  <span className="panel__name">{project.title}</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="panel__sliver"
                  id={`${baseId}-tab-${i}`}
                  role="tab"
                  aria-selected={expanded}
                  aria-expanded={expanded}
                  aria-controls={`${baseId}-panel-${i}`}
                  tabIndex={expanded ? 0 : -1}
                  onClick={() => select(i)}
                >
                  <span className="panel__index figures">{String(i + 1).padStart(2, '0')}</span>
                  <span className="panel__name panel__name--vertical">{project.title}</span>
                </button>
              )}

              {/*
                No `hidden` attribute here on purpose. The page is prerendered,
                and hiding five of six panels in the static markup would take
                five project descriptions away from a reader with JavaScript
                disabled. The collapse is a CSS rule scoped to `.js`, so it only
                exists once something can expand it again.
              */}
              <div
                className="panel__body"
                id={`${baseId}-panel-${i}`}
                {...(allOpen
                  ? {}
                  : { role: 'tabpanel', 'aria-labelledby': `${baseId}-tab-${i}` })}
              >
                <p className="panel__meta figures">
                  <span>{repo.createdAt.slice(0, 4)}</span>
                  {repo.language ? <span>{repo.language}</span> : null}
                  {repo.stars > 0 ? (
                    <span>
                      {repo.stars} star{repo.stars === 1 ? '' : 's'}
                    </span>
                  ) : null}
                  <span>updated {repo.pushedAt}</span>
                </p>

                <h3 className="panel__title">{project.title}</h3>
                <p className="panel__subtitle">{project.subtitle}</p>

                {repo.description ? <p className="panel__desc">{repo.description}</p> : null}

                {repo.topics.length > 0 ? (
                  <ul className="marks marks--quiet" aria-label={`${project.title} topics`}>
                    {repo.topics.slice(0, 8).map((topic) => (
                      <li className="mark mark--plain" key={topic}>
                        {topic}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <p className="panel__links">
                  <a className="link" href={repo.url} target="_blank" rel="noopener noreferrer">
                    Source ↗
                  </a>
                  {repo.homepage ? (
                    <a
                      className="link"
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live ↗
                    </a>
                  ) : null}
                </p>
              </div>

            </article>
          );
        })}
      </div>
    </div>
  );
}
