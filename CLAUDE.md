# CLAUDE.md — portfolio-v2

Operating manual for this repository. Read `DESIGN.md` before writing any
component that renders something visible.

---

## 1. What this is

A single-page 3D portfolio for **Rajendra Pandey**, replacing the multi-page site
currently at https://rajendrapandey.info.np.

The old site is a fork of the MasterPortfolio template (React 16, CRA 3,
`react-scripts@3.2.0`). It is **not** being upgraded — this is a clean rebuild.
The content data and the GitHub repo fetcher carry over; nothing else does.

### The two failure modes, ranked

This project fails in one of two directions. Both are real. The first is worse.

**Failure 1 — the empty showpiece.** A giant name, a floating shape, three vague
sentences, endless whitespace, done. This is what a generated portfolio looks
like, and it is what most 3D portfolios actually are. It tells a reader nothing
and it reads as a template with the serial numbers filed off.

**Failure 2 — the broken showpiece.** Text overlapping geometry, sections
collapsing on a narrow phone, a canvas that eats scroll, layout shift on font
load, something that only works at 1440px in Chrome.

**The defence against both is the same: put all the real content in, and make the
layout hold it under stress.** Density is not the enemy of good 3D design — it is
what proves a human with an actual history built the page. A reader should be
able to scroll this site for two full minutes and keep learning specific, dated,
verifiable facts.

If a design decision would remove information, reject it.

### The job of the page

Convince a technical reader, in one scroll, that the person who built this can do
real-time graphics work *and* has a documented track record. The site is
simultaneously the portfolio piece and the portfolio.

### Who the subject actually is

Use these facts. Never invent credentials. Never write filler.

| | |
|---|---|
| Name | Rajendra Pandey (राजेन्द्र पाण्डे) |
| Location | Mulpani, Somtirtha Chok, Kathmandu, Bagmati 44600, Nepal |
| Phone | +977 9813566214 |
| Email | rajendrapandey199971@gmail.com |
| Education | BSc Information Technology, Sunway International Business School, 2021–2024 |
| Earlier | +2 Business Studies, St. Lawrence College, 2015–2017 |
| Work | Account Handler, Nawakantipur Saving & Credit Co-operative, 2021–2022 |
| Earlier work | Marketing Personnel, 2017–2018 |
| Internship | **Game Developer, Yarsa Games, May–Aug 2024** |
| Project | Laundry Recommendation System (Node, Express, MongoDB), Dec 2024 |
| GitHub | https://github.com/rajendra7169 |
| LinkedIn | https://www.linkedin.com/in/rajendrapaandey/ |

**The narrative spine is the pivot: accounting → game development.** Balance
sheets, tax compliance and revenue forecasting, then game work at a Kathmandu
studio. Every design and copy decision serves that arc. It is the one thing on
this site no other portfolio has.

---

## 2. Content completeness — non-negotiable

Every block below ships. A section may be redesigned; it may not be dropped
because it is "too much content."

| # | Block | Source in `content.ts` | Minimum on the page |
|---|---|---|---|
| 1 | Identity | `greeting` | Name, Devanagari mark, thesis line, résumé link |
| 2 | Social | `socialMediaLinks` | All 7, each labelled and linked |
| 3 | Education | `degrees` | Both institutions, dates, all 3 description bullets each, website links |
| 4 | Experience | `experience` | All three roles, dated, with full descriptions and company links |
| 5 | Skills | `skills.data` | All 4 categories, all 14 bullets, all 17 technology marks |
| 6 | Competitive | `competitiveSites` | All 5 profiles, linked |
| 7 | Projects | build-time GitHub fetch | Repo cards with language, stars, description |
| 8 | Documentation | `publications` | The Laundry Recommendation System paper |
| 9 | Contact | `contactPageData` | Address, map link, phone, email |

Two content corrections, and only two:

- **`certifications` is entirely template placeholder data** — Andrew Ng, IBM,
  Microsoft, Big Data, all with `certificate_link: "#"`. Remove the block unless
  Rajendra supplies real certificates with working URLs. Fake credentials do more
  damage than a missing section.
- **`publications` contains two empty objects** with `createdAt: "Not published
  yet"`. Remove the empties, keep the real entry.

Everything else stays. `greeting.subTitle` gets rewritten (see `DESIGN.md §8`),
not deleted.

There is a visible gap between Dec 2024 and now. If anything happened in that
window, it belongs on the page — ask rather than leaving it silent.

---

## 3. Stack

Pinned deliberately. Do not add dependencies without asking.

```
react            ^19
react-dom        ^19
three            latest stable
@react-three/fiber          ^9    # requires React 19
@react-three/drei           ^10
@react-three/postprocessing latest
gsap             ^3    # all plugins free since the Webflow acquisition
lenis            latest
tailwindcss      ^4
vite             ^6
typescript       ^5
```

Vite, not Next.js — single page, no server needs. If SEO becomes a concern, add
prerendering rather than migrating frameworks.

Package manager `npm`, Node 20+.

```bash
npm run dev        # localhost:5173
npm run build
npm run preview
npm run typecheck
```

---

## 4. Hard rules

Violating any of these means the work gets reverted.

1. **No `.glb`, `.gltf`, `.fbx`, or `.obj` files. Ever.**
   Every 3D object is generated procedurally. No downloaded spaceships, robots,
   astronauts or floating laptops. Keeps the bundle small, keeps the site
   un-copyable, and lets every object recolour instantly between themes.

2. **Exactly one `<Canvas>` in the entire application.** Mounts once at the app
   root, `position: fixed`, never unmounts. If you are adding a second one, the
   architecture is wrong.

3. **The 3D never occupies a text region.** See `DESIGN.md §4` for the safe-zone
   geometry. This is the single most common way these sites break.

4. **All content text is DOM.** Selectable, indexable, screen-reader accessible.
   drei's `<Text>` is allowed only for ambient scene labels carrying no
   information.

5. **Performance budget:**
   - ≤ 400 KB gzipped JS for first paint (3D chunk lazy-loads after)
   - ≤ 1.5 MB total transfer
   - 60 fps desktop, ≥ 30 fps mid-range Android
   - ≤ 12 draw calls at any scroll position
   - Lighthouse mobile performance ≥ 85, accessibility 100

6. **`prefers-reduced-motion` is respected.** Camera cuts instead of flying,
   ambient drift stops, page stays fully usable.

7. **The site works without WebGL.** Feature-detect on mount; on failure render a
   static backdrop and the complete DOM content. Never a blank screen.

8. **`localStorage` only for theme preference.**

---

## 5. Breakless — robustness rules

"It looked fine on my laptop" is not done. These are the specific failure points
for a scroll-driven 3D page.

### Layout

- **Never `height: 100vh`.** Use `min-height: 100svh` so a section grows with its
  content and mobile browser chrome doesn't clip it. Any section may exceed one
  viewport — that is expected, not a bug.
- **No absolute positioning for content.** Everything in normal flow. Absolute
  positioning is for the canvas and for decorative rules only.
- **Text substrate.** Any text that could visually cross the scene sits on a
  scrim: `background: color-mix(in srgb, var(--ground) 82%, transparent)` with
  `backdrop-filter: none`. Legibility beats purity every time.
- **Cards grow, never truncate.** No `line-clamp` on descriptions. The education
  bullets are long; let them be long.

### Data resilience

Every component must survive the data changing shape. Build them to handle:

- 0, 1, or 12 items in any list — no layout that assumes exactly N
- A repo with no description, no language, no stars
- A skill category with 1 icon or 20
- A missing `website_link` or `certificate_link` — render as plain text, not a
  dead `#` anchor
- Very long strings — the longest education bullet is over 300 characters

Type `content.ts` strictly and make optional fields genuinely optional. No
`undefined` reaching JSX.

### Scroll and canvas

- Canvas is `pointer-events: none` except where a component explicitly opts in.
  A canvas that swallows clicks is the classic break.
- Scroll progress must be clamped `0–1` and guarded against a zero-height
  document during hydration.
- On resize, recompute progress and call `ScrollTrigger.refresh()` — debounced
  at 150ms. Mobile address-bar show/hide fires resize constantly.
- Never disable native scrolling. Lenis smooths it; the scrollbar stays real and
  every section stays deep-linkable with an `id`.
- Kill all GSAP tweens and dispose geometries on unmount. Check for GPU memory
  growth on repeated theme toggles.

### Fonts and shift

- Self-host via `@fontsource`. No hotlinking — the extra DNS round trip hurts on
  slow connections.
- `font-display: swap` plus a `size-adjust` fallback so swapping causes no
  layout shift. Target CLS < 0.05.

### Test matrix — all must pass before any phase is called done

| | |
|---|---|
| Widths | 320, 375, 414, 768, 1024, 1440, 2560 |
| Real device | A mid-range Android on a real Nepali mobile network |
| Browsers | Chrome, Firefox, Safari (iOS Safari specifically) |
| Conditions | JS disabled · WebGL disabled · reduced-motion on · 200% browser zoom · keyboard only |
| Content stress | Duplicate every list to 3× length and confirm nothing overlaps |

---

## 6. Quality tiers

Selected once on mount, never changed mid-session.

| | Desktop | Mobile | Reduced / fallback |
|---|---|---|---|
| DPR cap | 2 | 1.5 | — |
| Point field | 8,000 | 2,500 | 0 |
| Ridge segments | 128 × 128 | 48 × 48 | 0 |
| Postprocessing | Bloom | none | none |
| Skill lattice | on | off (DOM chips instead) | off |
| Camera | full path | shortened path | cuts only |

---

## 7. Architecture

```
src/
  main.tsx
  App.tsx                  # ThemeProvider > Lenis > GlobalCanvas > Sections
  content.ts               # ported from old portfolio.js — source of truth
  three/
    GlobalCanvas.tsx       # the one and only <Canvas>
    Scene.tsx              # reads scroll progress, orchestrates acts
    objects/
      PointField.tsx
      LedgerRidge.tsx      # signature object — DESIGN.md §5.3
      Core.tsx
      SkillLattice.tsx
    Effects.tsx            # bloom, desktop only
  hooks/
    useScrollProgress.ts   # normalized 0-1, drives everything
    useTheme.ts
    useQualityTier.ts
  sections/
    Arrival.tsx  Origin.tsx  Pivot.tsx  Systems.tsx
    Practice.tsx  Evidence.tsx  Documentation.tsx  Signal.tsx
  components/              # Card, TechMark, TimelineEntry, ThemeToggle, ...
  styles/tokens.css
scripts/
  fetch-repos.mjs          # ported from git_data_fetcher.mjs
```

**Data flow in one sentence:** Lenis drives native scroll → `useScrollProgress`
normalizes to a single `0→1` float → `Scene.tsx` maps it onto camera position,
object state and material uniforms → DOM sections scroll independently on top.

Never read `window.scrollY` in a component. Always go through the hook.

Port `portfolio.js` → `content.ts` with types. It is a good file — 499 lines, one
export per section — and it is the most valuable thing carried across. Keep its
shape. Port `git_data_fetcher.mjs` too; it needs `GITHUB_TOKEN` in `.env`, never
committed.

**Do not port** `src/assets/font-awesome` — 1,745 files, ~30 MB of vendored icon
library. Use `lucide-react` for UI icons and inline SVG for the 17 technology
marks.

---

## 8. Build order

Each phase independently deployable and verified on a real phone before the next.

1. **Scaffold.** Vite + React 19 + TS + Tailwind 4. Port `content.ts` with full
   types. Tokens from `DESIGN.md §2`. Theme toggle with no flash on load.
2. **Full DOM site — all 8 sections, all content, final typography, no 3D.**
   This is the most important phase in the project. If the page is not genuinely
   good to read at this point, 3D will be decoration hiding a weak site. Run the
   entire test matrix here. Ship it.
3. **Scroll rig.** Lenis + `useScrollProgress` + `GlobalCanvas` with one test
   cube. Verify: no jank, no layout shift, DOM stays clickable, canvas never
   unmounts, safe zones respected.
4. **Point field.**
5. **Core** (Arrival and Signal).
6. **Ledger ridge** — the signature element, hardest piece, `DESIGN.md §5.3`.
7. **Skill lattice** with two-way DOM hover linking.
8. **Polish.** Bloom on desktop, hover states, focus rings, loading sequence.
9. **Ship.** Cloudflare Pages, repoint the `rajendrapandey.info.np` CNAME.

---

## 9. Accessibility floor

Not a later phase.

- Every interactive element keyboard-reachable with a visible focus ring
- Contrast ≥ 4.5:1 in **both** themes — check dark mode specifically
- `<canvas>` gets `aria-hidden="true"`
- Semantic landmarks, one `<h1>`, headings in document order
- Each section has an `id` and is deep-linkable
- `prefers-reduced-motion` per §4.6

---

## 10. Deployment

Cloudflare Pages on `main`. Build `npm run build`, output `dist`. Not GitHub
Pages — Cloudflare's edge is meaningfully faster for South Asian visitors, the
primary audience.

Keep the old site live until the new one is verifiably better on a real phone.
Only then repoint DNS.

---

## 11. Things not to do

- **Do not make it sparse.** No section reduced to a headline and one sentence.
  See §1 and §2.
- Do not suggest downloading a model. See §4.1.
- Do not add a second animation library. GSAP is the scroll spine.
- Do not add glassmorphism, HUD corner brackets, targeting reticles, scanning
  text, matrix rain, or lens flares. See `DESIGN.md §9`.
- Do not use a second neon accent colour.
- Do not scroll-jack, snap-scroll, or add "swipe to continue".
- Do not build a percentage loading screen. With no model files nothing is slow.
- Do not truncate content to make a layout fit. Change the layout.
- Do not write a sentence that would be equally true of ten thousand other
  developers.
- Do not generate placeholder content. If a fact is missing, ask.
