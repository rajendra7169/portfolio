/**
 * check-contrast.mjs — proves the DESIGN.md §10 contrast checkbox rather than
 * asserting it. Parses the literal hex values out of src/styles/tokens.css and
 * reports every text/background pair the site actually uses, both themes.
 *
 *   node scripts/check-contrast.mjs
 *
 * Exits non-zero if any pair falls below 4.5:1.
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

function block(selector) {
  const i = css.indexOf(selector);
  const open = css.indexOf('{', i);
  const end = css.indexOf('\n}', open);
  const out = {};
  for (const [, k, v] of css.slice(open, end).matchAll(/(--[a-z-]+):\s*(#[0-9a-f]{6})/gi)) out[k] = v;
  return out;
}

const dark = block(':root {');
const light = { ...dark, ...block(":root[data-theme='light']") };
// --ledger-ink resolves to --ledger in light mode.
light['--ledger-ink'] = light['--ledger'];

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const PAIRS = [
  ['--ink', '--ground', 'body text'],
  ['--ink', '--surface', 'body text on a card'],
  ['--ink-dim', '--ground', 'captions, metadata'],
  ['--ink-dim', '--surface', 'captions on a card'],
  ['--ledger-ink', '--ground', 'links'],
  ['--ledger-ink', '--surface', 'links on a card'],
  ['--brass', '--ground', 'entry labels, Devanagari'],
  ['--brass', '--surface', 'entry labels on a card'],
];

let failed = 0;
for (const [name, tokens] of [['dark  (engine)', dark], ['light (paper)', light]]) {
  console.log(`\n${name}`);
  for (const [fg, bg, use] of PAIRS) {
    const r = ratio(tokens[fg], tokens[bg]);
    const ok = r >= 4.5;
    if (!ok) failed++;
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1  ${fg} on ${bg}  — ${use}`,
    );
  }
}
// --rule draws hairlines and decorative grid, so WCAG 1.4.11 does not bind it.
// Reported for information. Focus rings and interactive borders use --ledger-ink
// or --ink precisely because --rule is too quiet to carry that job.
for (const [name, tokens] of [['dark  (engine)', dark], ['light (paper)', light]]) {
  const r = ratio(tokens['--rule'], tokens['--ground']);
  console.log(`\n${name}  rule on ground (decorative hairline): ${r.toFixed(2)}:1`);
}
console.log(failed ? `\n${failed} pair(s) below 4.5:1` : '\nAll text pairs pass 4.5:1');
process.exit(failed ? 1 : 0);
