/**
 * App — ThemeProvider > scroll spine > the one canvas > eight sections.
 *
 * The canvas mounts once, after hydration, and never unmounts (CLAUDE.md §4.2).
 * It is loaded lazily so the three.js chunk stays out of first paint, and it is
 * skipped entirely when WebGL is unavailable — in which case the static ruled
 * backdrop stands in and the DOM below is untouched (CLAUDE.md §4.7).
 */
import { Suspense, lazy, useEffect, useState } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useReveal } from './hooks/useReveal';
import { useQualityTier } from './hooks/useQualityTier';
import { registerActs, measure } from './hooks/scrollStore';
import { acts } from './content';

import { Masthead } from './components/Masthead';
import { Arrival } from './sections/Arrival';
import { Origin } from './sections/Origin';
import { Pivot } from './sections/Pivot';
import { Systems } from './sections/Systems';
import { Practice } from './sections/Practice';
import { Evidence } from './sections/Evidence';
import { Documentation } from './sections/Documentation';
import { Signal } from './sections/Signal';

const GlobalCanvas = lazy(() =>
  import('./three/GlobalCanvas').then((m) => ({ default: m.GlobalCanvas })),
);

registerActs(acts.map((a) => a.id));

function Backdrop() {
  // Ruled paper, drawn in CSS. Stands in for the scene when WebGL is missing
  // so the page never renders as bare text on a flat ground.
  return <div className="no-webgl" aria-hidden="true" />;
}

export function App() {
  const [mounted, setMounted] = useState(false);
  const quality = useQualityTier();

  useScrollProgress();
  useReveal();

  useEffect(() => {
    setMounted(true);
    // One more measure once the tree is real, in case a font or an image
    // changed a section's height after the first pass.
    const id = window.setTimeout(measure, 200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <ThemeProvider>
      <a className="skip-link" href="#arrival">
        Skip to content
      </a>

      {mounted && quality.webgl ? (
        <Suspense fallback={<Backdrop />}>
          <GlobalCanvas quality={quality} />
        </Suspense>
      ) : (
        <Backdrop />
      )}

      <div className="page">
        <Masthead />
        <main id="main">
          <Arrival />
          <Origin />
          <Pivot />
          <Systems />
          <Practice />
          <Evidence />
          <Documentation />
          <Signal />
        </main>
        <footer className="footer">
          <div className="shell footer__inner figures">
            <span>Rajendra Pandey · Kathmandu · {new Date().getFullYear()}</span>
            <span>Built with React, three.js and no downloaded models.</span>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
