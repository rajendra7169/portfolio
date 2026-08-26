/**
 * entry-server.tsx — used only by scripts/prerender.mjs at build time.
 *
 * The site is a single page with no server, so this exists for one reason: the
 * page must read correctly with JavaScript disabled (DESIGN.md §10). Rendering
 * the DOM into index.html at build time satisfies that, and gives crawlers the
 * full text without adding a framework.
 */
import { renderToString } from 'react-dom/server';
import { App } from './App';

export function render(): string {
  return renderToString(<App />);
}
