# portfolio-v2

Single-page 3D portfolio for Rajendra Pandey. Replaces the multi-page site at
https://rajendrapandey.info.np.

Read `DESIGN.md` for the art direction — colour, type, the scroll choreography
and the 3D scene. It is binding. This file only covers how to run the thing.

## Requirements

Node 20+, npm.

## Commands

```bash
npm install
npm run dev          # localhost:5173
npm run build        # refetch repos, typecheck, bundle, prerender
npm run build:offline# same without the GitHub fetch
npm run preview      # serve dist
npm run typecheck
npm run contrast     # verify every text/background pair in both themes
npm run prefetch     # refresh src/data/repos.ts from the GitHub API
```

## How the page is put together

Lenis drives native scroll → `useScrollProgress` normalises it to a single 0→1
float in `hooks/scrollStore.ts` → `three/Scene.tsx` maps that onto camera
position, object presence and shader uniforms. DOM sections scroll independently
on top. Nothing reads `window.scrollY` directly.

There is exactly one `<Canvas>`, in `three/GlobalCanvas.tsx`. It mounts once
after hydration and never unmounts. Every 3D object is generated in code — there
are no `.glb`, `.gltf`, `.fbx` or `.obj` files in this repository and there
should never be.

### Prerendering

`npm run build` renders the whole DOM into `dist/index.html` before shipping it,
then the client bundle hydrates. That is what makes the page readable with
JavaScript disabled and gives crawlers the full text. It is a build step, not a
framework — see `scripts/prerender.mjs`.

## Regenerating data

**Repositories.** `npm run prefetch` rewrites `src/data/repos.ts` from the
public GitHub API. The file is committed on purpose: the build type-checks
offline, a GitHub outage cannot fail a deploy, and a refresh shows up as a
readable diff. `GITHUB_TOKEN` in `.env` is optional and only raises the rate
limit; copy `.env.example` and never commit the real thing.

Which projects appear in the accordion is a hand-curated list in
`content.ts` → `featuredProjects`, keyed by repo name. A curated entry whose
repo is missing from the snapshot is skipped rather than rendered empty.

**Brand marks.** `src/data/brandmarks.ts` holds 29 inline SVG paths from Simple
Icons (CC0-1.0). It is generated; do not hand-edit the path strings. To add a
mark, pull the path out of
`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/<slug>.svg` and add it to
the map. The old site vendored 1,745 font-awesome files for this; that is what
this file exists to avoid.

**Project screenshots.** Optional. Drop a 1280×800 WebP in `public/shots/` and
point `featuredProjects[].shot` at it. Capture standard: 1440×900 viewport, DPR
2, no OS chrome, no cursor, no scrollbar, identical crop. With no screenshot the
frame renders with an empty screen and the repo name — never a broken image.

## Deployment

Cloudflare Pages on `main`:

| | |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 |
| Environment | `GITHUB_TOKEN` (optional) |

`public/_headers` sets immutable caching on hashed assets and a strict CSP —
the site loads no third-party resource of any kind, so it can afford one.

Keep the old site live until this one is verifiably better on a real phone on a
real Nepali network, then repoint the `rajendrapandey.info.np` CNAME.

## Verifying a change

`npm run contrast` proves the colour side. The rest of the matrix, in the order
that catches real breakage most often:

- 320px width — the narrowest thing that has to work
- content tripled — clone every list item ×3 and confirm nothing overlaps
- JavaScript disabled — all eight sections, all links, no dead `#` anchors
- WebGL unavailable — static ruled backdrop, complete DOM, never a blank screen
- `prefers-reduced-motion` — camera cuts, panels all open, no pinning
- keyboard only — every stop reachable with a visible ring
