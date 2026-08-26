/**
 * fetch-repos.mjs — build-time GitHub fetch, ported from the old site's
 * git_data_fetcher.mjs.
 *
 *   node scripts/fetch-repos.mjs
 *
 * Writes src/data/repos.ts, a typed snapshot that is committed. That matters
 * for three reasons: the build type-checks offline, a GitHub outage cannot fail
 * a deploy, and the diff of a rebuild is readable in review.
 *
 * GITHUB_TOKEN in .env is optional — it lifts the rate limit from 60/hr to
 * 5000/hr. Never commit it (the brief §7).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const OUT = resolve(root, 'src/data/repos.ts');

/* -- .env, without a dependency ------------------------------------------- */

function loadEnv() {
  const file = resolve(root, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const USER = process.env.GITHUB_USERNAME || 'rajendra7169';
const TOKEN = process.env.GITHUB_TOKEN || '';

/**
 * Linguist colours for the languages that actually appear, baked in rather than
 * fetched. The upstream languages.yml is ~700 KB and the answer for these
 * eighteen entries has not changed in years.
 */
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#663399',
  SCSS: '#c6538c',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Jupyter: '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
};

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': `${USER}-portfolio-build`,
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json();
}

/**
 * GitHub descriptions carry emoji; the page does not (DESIGN.md §9). A stray
 * tree in a project blurb is the exact "generated page" tell the whole design
 * is trying to avoid, so it is stripped at the source rather than hidden in CSS.
 */
function stripEmoji(s) {
  return String(s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

function emit(repos, fetchedAt) {
  const body = repos
    .map(
      (r) => `  {
    name: '${esc(r.name)}',
    url: '${esc(r.url)}',
    description: ${r.description ? `'${esc(r.description)}'` : 'undefined'},
    language: ${r.language ? `'${esc(r.language)}'` : 'undefined'},
    languageColor: ${r.languageColor ? `'${r.languageColor}'` : 'undefined'},
    stars: ${r.stars},
    forks: ${r.forks},
    topics: [${r.topics.map((t) => `'${esc(t)}'`).join(', ')}],
    homepage: ${r.homepage ? `'${esc(r.homepage)}'` : 'undefined'},
    createdAt: '${r.createdAt}',
    pushedAt: '${r.pushedAt}',
  },`,
    )
    .join('\n');

  return `/**
 * repos.ts — GENERATED. Do not hand-edit.
 *
 * Written by scripts/fetch-repos.mjs from the public GitHub API.
 * Snapshot taken ${fetchedAt}. Re-run \`npm run prefetch\` to refresh.
 */

export interface Repo {
  name: string;
  url: string;
  description?: string;
  language?: string;
  /** Linguist colour for the primary language. Drives the panel tint. */
  languageColor?: string;
  stars: number;
  forks: number;
  topics: string[];
  homepage?: string;
  createdAt: string;
  pushedAt: string;
}

/** Public, non-fork repositories, most recently pushed first. */
export const repos: Repo[] = [
${body}
];

export const reposFetchedAt = '${fetchedAt}';
`;
}

async function main() {
  const raw = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await api(`/users/${USER}/repos?per_page=100&page=${page}&sort=pushed`);
    raw.push(...batch);
    if (batch.length < 100) break;
  }

  const repos = raw
    .filter((r) => !r.fork && !r.archived && !r.private)
    .map((r) => ({
      name: r.name,
      url: r.html_url,
      description: stripEmoji(r.description || ''),
      language: r.language || '',
      languageColor: r.language ? LANGUAGE_COLORS[r.language] || '' : '',
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      topics: Array.isArray(r.topics) ? r.topics : [],
      homepage: r.homepage || '',
      createdAt: (r.created_at || '').slice(0, 10),
      pushedAt: (r.pushed_at || '').slice(0, 10),
    }))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));

  const fetchedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(OUT, emit(repos, fetchedAt));
  console.log(`fetch-repos: wrote ${repos.length} repositories to src/data/repos.ts`);

  const missing = repos.filter((r) => r.language && !r.languageColor).map((r) => r.language);
  if (missing.length) {
    console.warn(
      `fetch-repos: no linguist colour for ${[...new Set(missing)].join(', ')} — ` +
        'add it to LANGUAGE_COLORS or the panel falls back to --surface',
    );
  }
}

main().catch((err) => {
  // A GitHub outage or a rate limit must never fail a deploy. The committed
  // snapshot is still there and the build continues with it.
  console.warn(`fetch-repos: ${err.message}`);
  if (existsSync(OUT)) {
    console.warn('fetch-repos: keeping the committed snapshot in src/data/repos.ts');
    process.exit(0);
  }
  console.error('fetch-repos: no snapshot on disk to fall back to');
  process.exit(1);
});
