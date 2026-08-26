/**
 * prerender.mjs — renders the DOM into dist/index.html at build time.
 *
 * The site is one page with no server, so this is not SSR in the framework
 * sense. It exists for one requirement in DESIGN.md §10: the page must read
 * correctly with JavaScript disabled. A Vite SPA ships an empty <div id="root">
 * and fails that outright.
 *
 * Runs after `vite build`. The client bundle then hydrates the markup instead
 * of mounting into an empty container — see src/main.tsx.
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(root, 'dist/index.html');
const serverEntry = resolve(root, 'dist/.ssr/entry-server.js');

if (!existsSync(htmlPath)) {
  console.error('prerender: dist/index.html not found — run vite build first');
  process.exit(1);
}
if (!existsSync(serverEntry)) {
  console.error('prerender: dist/.ssr/entry-server.js not found — run the ssr build first');
  process.exit(1);
}

const { render } = await import(pathToFileURL(serverEntry).href);
const appHtml = render();

const html = readFileSync(htmlPath, 'utf8');
if (!html.includes('<!--app-html-->')) {
  console.error('prerender: no <!--app-html--> placeholder in dist/index.html');
  process.exit(1);
}

writeFileSync(htmlPath, html.replace('<!--app-html-->', appHtml));

// The SSR bundle is a build artefact, not something to deploy.
rmSync(resolve(root, 'dist/.ssr'), { recursive: true, force: true });

const kb = (Buffer.byteLength(appHtml) / 1024).toFixed(1);
console.log(`prerender: inlined ${kb} KB of markup into dist/index.html`);
