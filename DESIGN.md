# DESIGN.md — portfolio-v2

Art direction and scroll choreography. Read alongside `CLAUDE.md`.
Every colour and type decision on the site derives from this document.

---

## 1. Thesis

**Ledger paper becomes terrain.**

Rajendra spent 2021–2022 preparing balance sheets at a savings co-operative in
Kathmandu, then spent mid-2024 building games at Yarsa. The site makes that
transition literal: ruled accounting lines lie flat near the top of the page and,
as you scroll, displace upward into a wireframe ridgeline — accounting paper
turning into Himalayan geometry, spreadsheet turning into mesh.

The two theme modes carry real meaning rather than being a checkbox:

- **Light mode is paper.** Greenbar accounting stock, ink rules, printed figures.
- **Dark mode is the viewport.** The same rules, now emissive wireframe in an
  engine's dark scene view.

The toggle reads **paper / engine**, not sun / moon.

### Density is the direction

The brief asked for sci-fi, but not much — and explicitly for a page that holds
all the information rather than being a name with a shape behind it. Those two
requirements agree with each other.

This is an **editorial** design with a 3D atmosphere, not a 3D demo with captions.
The reference points are a well-set annual report, a museum wall text, an
engineering drawing set — documents that are dense, dated, gridded, and confident
enough not to shout. Sci-fi enters through *structure*: hairline rules, tabular
figures, monospace metadata, wireframe geometry at the horizon. Never through
neon, never through chrome.

There is no cyan-on-black anywhere in this document, because cyan-on-black is
what every other portfolio in this genre already did.

**The load-bearing rule:** the 3D lives at the edges and the horizon. The centre
of the page belongs to content. A reader who never looks at the geometry should
still come away knowing Rajendra's full history.

---

## 2. Colour

Six values per mode. Nothing outside this palette ships.

### Dark — "engine"

| Token | Hex | Use |
|---|---|---|
| `--ground` | `#0B1114` | Page background. Desaturated blue-green, not pure black — black kills the wireframe glow. |
| `--surface` | `#141C20` | Cards, elevated panels |
| `--rule` | `#2A363B` | Hairlines, grid, table rules, borders |
| `--ink` | `#E4E8E4` | Body text |
| `--ink-dim` | `#8C9994` | Secondary text, captions, metadata |
| `--ledger` | `#C1352B` | **Accent.** Accounting ink red. Links, active states, ridge crest emission |
| `--brass` | `#B08D4F` | **Secondary, sparingly.** Newar metalwork. Entry numbers, the Devanagari mark |

### Light — "paper"

| Token | Hex | Use |
|---|---|---|
| `--ground` | `#DCE4D6` | Greenbar accounting stock |
| `--surface` | `#EAEFE6` | Cards, raised paper |
| `--rule` | `#B4C0AC` | Printed rules and grid |
| `--ink` | `#1A211C` | Body text |
| `--ink-dim` | `#5C665C` | Secondary |
| `--ledger` | `#A82B22` | Accent, darker for contrast on paper |
| `--brass` | `#8A6C34` | Secondary |

**Rules of use**

- Red is the only accent used in quantity. Brass is a garnish — entry numbers and
  the Devanagari mark, nothing else.
- Never place brass and red adjacent at the same size; they fight.
- The **17 technology marks keep their real brand colours** at small size. This
  is deliberate: brand marks are recognisable data, and a wall of them in correct
  colour is a density signal no generated page produces. They are the one
  permitted exception to the palette.
- The 3D scene reads these same tokens. A scene that ignores the theme toggle
  makes the whole site feel broken.
- Verify contrast in **dark mode first** — `--ink-dim` on `--ground` is the pair
  most likely to fail.

---

## 3. Typography

Three roles plus one. All free, self-hosted via `@fontsource`.

| Role | Face | Why |
|---|---|---|
| Display | **Archivo** (variable, width axis) | Headings at width 112–125. Wide grotesques read as structural signage, not startup landing page. Not Inter, not Neue Montreal. |
| Body | **Public Sans** | Neutral, excellent tabular figures, designed for government records — quietly correct for a ledger theme. |
| Utility | **Martian Mono** | Wide technical mono. Entry labels, dates, coordinates, figures. Small sizes only. |
| Devanagari | **Noto Sans Devanagari** | One use only — §5.5. |

### Scale

Fluid via `clamp()`. Ratio 1.333 desktop, compressing to 1.2 mobile.

```
--step--1  clamp(0.79rem, 0.77rem + 0.10vw, 0.84rem)   captions, mono labels
--step-0   clamp(1.00rem, 0.96rem + 0.20vw, 1.13rem)   body
--step-1   clamp(1.33rem, 1.25rem + 0.40vw, 1.50rem)   lead paragraph
--step-2   clamp(1.78rem, 1.62rem + 0.78vw, 2.25rem)   section headings
--step-3   clamp(2.37rem, 2.09rem + 1.39vw, 3.38rem)   act titles
--step-4   clamp(3.16rem, 2.68rem + 2.40vw, 5.06rem)   the name, hero only
```

`--step-4` appears **exactly once**, in the hero. Oversized type repeated down a
page is the loudest generated-design tell there is. Everything below the hero
tops out at `--step-2`.

Weights 400 body, 500 headings, 700 nowhere. Line height 1.6 body, 1.1 display.
Measure capped at 66 characters.

### Entry labels

Structural numbering is justified here because the content genuinely is a
chronological sequence. Martian Mono at `--step--1`, letterspacing `0.08em`,
colour `--brass`:

```
ENTRY 04 · 2021–2024 · SYSTEMS
```

The year carries the information. Never `01 / 02 / 03` alone.

---

## 4. Layout and safe zones

12-column grid, 72rem max width, gutters 1.5rem mobile / 2.5rem desktop.
Strict 8px vertical baseline.

### The safe-zone contract

This is the rule that keeps the page from breaking. The viewport is divided, and
**the two regions never overlap**.

```
DESKTOP ≥ 1024px                      MOBILE < 768px
┌─────────────┬──────────────┐        ┌────────────────────┐
│             │              │        │  content, full     │
│  CONTENT    │  SCENE       │        │  width, opaque     │
│  cols 1–7   │  cols 8–12   │        │                    │
│  (alternates│  3D may      │        ├────────────────────┤
│   sides per │  occupy      │        │  SCENE BAND        │
│   section)  │  freely      │        │  bottom 30svh only │
│             │              │        │  opacity 0.5       │
└─────────────┴──────────────┘        └────────────────────┘
```

- Desktop: content alternates between columns 1–7 and 6–12 so the scene is
  visible through the opposite side. The scene may never render above 40% opacity
  underneath a content column.
- Tablet 768–1023px: content full width, scene reduced to the bottom 40svh band.
- Mobile: scene is a horizon band in the bottom 30svh, opacity 0.5. Content sits
  entirely above it, fully opaque. **Never** a card over the ridge crest.

Any text that could still cross the scene gets a scrim — see `CLAUDE.md §5`.

### Wireframe — Arrival

```
┌──────────────────────────────────────────────────────────┐
│  RP                                     paper ⟋ engine   │
│                                                          │
│   ENTRY 01 · KATHMANDU                     ╱╲            │
│                                           ╱  ╲  ← core   │
│   RAJENDRA PANDEY                        ╱    ╲          │
│   राजेन्द्र पाण्डे                              ·  ·  ·        │
│                                                          │
│   I balanced books for two years,                        │
│   then went and built games.                             │
│                                                          │
│   ○ GitHub  ○ LinkedIn  ○ YouTube  ○ X                    │
│   ○ Instagram  ○ Facebook  ○ Email      ← all 7, labelled│
│                                                          │
│   [ Résumé ↗ ]                                           │
│   ────────────────────────────────────────────────────   │
│   ↓ scroll                       Mulpani · 27.7°N 85.3°E │
└──────────────────────────────────────────────────────────┘
```

### Wireframe — Systems (the densest section)

```
┌──────────────────────────────────────────────────────────┐
│  ENTRY 05 · SYSTEMS                                      │
│  ────────────────────────────────────────────────────────│
│                                                          │
│  FULL STACK DEVELOPMENT                    ╱╲   lattice  │
│  · Python, Java, HTML, CSS, JS, C, C++, Dart   ╲         │
│  · Dynamic and responsive web applications  ▫ ▫ ▫        │
│  · Flutter, React Native, solo Kotlin apps   ▫  ▫        │
│  · Backend in Node, Express and Flask                    │
│  ⬡ HTML5  ⬡ CSS3  ⬡ JS  ⬡ React  ⬡ Node  ⬡ Flutter      │
│  ────────────────────────────────────────────────────────│
│  CLOUD INFRA-ARCHITECTURE                                │
│  · Multiple cloud platforms                              │
│  · Hosting and DB integration on VM instances            │
│  · Deep learning models deployed to mobile               │
│  · Streaming jobs on GCP and AWS                         │
│  ⬡ Firebase  ⬡ PostgreSQL  ⬡ MongoDB                     │
│  ────────────────────────────────────────────────────────│
│  UI/UX DESIGN            ⬡ XD ⬡ Figma ⬡ Ai ⬡ Inkscape    │
│  ────────────────────────────────────────────────────────│
│  VIDEO / PHOTOGRAPHY     ⬡ Ps ⬡ Resolve ⬡ Lr ⬡ Pr        │
└──────────────────────────────────────────────────────────┘
```

Four categories, fourteen bullets, seventeen marks, hairline rules between. This
section alone is longer than one viewport and that is correct.

---

## 5. The 3D scene

One canvas, four objects, zero asset files. All of it lives in the safe zone.

### 5.1 PointField — ambient, always present

`<Points>` with randomised positions in a 40×40×60 box. Size 0.015,
`sizeAttenuation` on, colour `--ink-dim` at 0.35 opacity.

Constant Y drift 0.02 units/sec, wrapping. Parallax from scroll (0.3× camera
delta) and cursor (0.05× normalized, `lerp` factor 0.02 — never direct
assignment).

### 5.2 Core — hero and closing object

`icosahedronGeometry(1.4, 12)` with drei's `MeshDistortMaterial`: `distort` 0.35,
`speed` 1.2, `roughness` 0.4, colour `--rule`, emissive `--ledger` low intensity.

Present in Arrival and returns in Signal, so the page closes where it opened.
Between those, fade `material.opacity` rather than unmounting — the geometry
should never re-upload to the GPU.

### 5.3 LedgerRidge — the signature element

The one thing the site is remembered by. Everything else stays quiet so this can
land.

`planeGeometry(60, 30, SEG, SEG)` rotated flat, rendered **wireframe** in
`--rule`, with a custom vertex shader holding one uniform `uMorph` (0→1) driven
by scroll across the Pivot act:

- **`uMorph = 0`** — vertices displaced on one axis only: perfectly straight,
  evenly spaced parallel rules. Unmistakably ledger paper in perspective.
- **`uMorph = 1`** — 3-octave simplex noise on Y, amplitude ~4 units, ridged
  (`1 - abs(noise)`) so peaks come to sharp crests rather than rolling hills.
  Reads as a mountain ridgeline.

Interpolate with `smoothstep`, not linear — it should feel like something lifting
off a surface, fastest through the middle.

Fragment shader mixes line colour toward `--ledger` as a function of vertex
height, so crests catch red and valleys stay neutral. This is where the accent
earns its place.

A second plane at `y = -0.01`, same geometry, 0.08 opacity, gives a faint sense
of the page the lines lifted off. Cheap, and it sells the metaphor.

The ridge lives at the horizon for the whole middle of the page. It is
atmosphere, not a subject — it must never rise into a text column.

### 5.4 SkillLattice — Systems act

One `<Instances>` mesh, one `boxGeometry(0.3, 0.3, 0.3)` instance per entry in
`content.skills.data[].softwareSkills`. Seventeen cubes, one draw call.

Loose 3D grid with per-instance random offset so it reads as a lattice, not a
spreadsheet. Group rotation 0.08 rad/sec.

**On hover the instance scales to 1.4 and emits `--ledger`, and the corresponding
DOM technology name highlights simultaneously — and the reverse.** This two-way
link between scene and content is the one real interactive moment on the page. It
demonstrates the geometry is wired to the information rather than being wallpaper.

Desktop only. Mobile renders the skill marks as DOM chips and skips the lattice.

### 5.5 The Devanagari mark

`राजेन्द्र पाण्डे` in Noto Sans Devanagari, `--brass`, `--step-0`, directly beneath
the Latin name. Static DOM text, not 3D.

One use, one place. A signature, not a motif — never in the footer, loader, or as
a watermark.

### 5.6 ProjectGallery — horizontal expanding accordion

Projects shown as a row of coloured panels collapsed to slivers, one expanded at
a time into a full detail panel. Reference pattern: a product showcase where
each item holds a sliver with a rotated label and expands to title, subtitle,
body copy and CTA.

**This is DOM, not WebGL.** Flex-grow animated with GSAP; the device frame is a
CSS `perspective()` transform. No canvas, no textures, no VRAM ceiling — the
texture-memory failure mode does not exist here. The ledger ridge continues to
drift behind the panels in the global canvas; the accordion sits above it as
ordinary DOM. This is the most robust part of the site and should stay that way.

**Panel geometry (desktop ≥ 1024px)**

| | |
|---|---|
| Collapsed sliver | 56px wide, `flex: 0 0 56px` |
| Expanded panel | `flex: 1`, minimum 420px |
| Gap | 6px |
| Height | 70svh, min 420px |
| Transition | `flex-basis` + `flex-grow`, 0.55s `power2.inOut` |

Sliver contents: entry number in Martian Mono at the top, project name rotated
with `writing-mode: vertical-rl` and `letter-spacing: 0.06em`.

**Colour is derived from data, never chosen.** Each panel takes the tint of its
repo's primary language colour, which the build-time GitHub fetch already
returns. Desaturate ~40% toward `--ground` so five panels read as a family
rather than a rainbow, and use the undesaturated value only for the 2px active
indicator. A panel with no detected language falls back to `--surface`.

**The tilted frame is the subject.** A screenshot lying flat on a colour block
reads as nothing — in the reference pattern the product has a silhouette and
bleeds past the panel edge, and that is what creates depth. Reproduce it:

```css
transform: perspective(760px) rotateY(-19deg) rotateX(5deg);
```

Frame = rounded rect, `--surface`, 0.5px `--rule` border, a 16px title bar with
three 5px dots. The frame must **bleed 8–12% past the panel's right edge** with
`overflow: visible` on the panel. Without the bleed the whole effect collapses.

**Screenshots**

- WebP, `srcset` at 1×/2×, `loading="lazy"`, explicit `width`/`height` to
  prevent CLS
- 1280 × 800 source, displayed ~420px wide
- Same capture standard as before: 1440 × 900 viewport, DPR 2, no OS chrome, no
  cursor, no scrollbar, identical crop
- No screenshot → frame renders with a `--surface` screen and the repo name in
  Martian Mono. Never a broken image.

**Interaction**

- Sliver is a real `<button aria-expanded>` inside a `role="tablist"`; panel is
  `role="tabpanel"`. Left/right arrows move between panels, Enter expands, focus
  ring visible on the sliver.
- Scroll also drives it: pin the section, map progress to active index. Click and
  scroll must stay in sync — clicking a sliver scrolls to that index rather than
  setting state independently, or the two controllers fight.
- Expanded panel content: entry label with year and language, title, one-line
  subtitle, description, technology marks, repo link, live link.

**Mobile < 768px: rotate the axis.** Vertical rotated text is illegible at 375px
and five slivers would be 75px each. Becomes a vertical accordion — full-width
bars expanding downward, no `writing-mode`, no pin. Same component, `flex-direction`
swapped at the breakpoint.

**Reduced motion:** no pin, no flex animation. All panels open, stacked.

**Do not copy from the reference:** the audio player widget. It is motivated for
a music brand and unmotivated here, and unmotivated decoration is the clearest
generated-design tell on a page.

**Curation still applies.** 4–6 projects in the accordion, chosen for having a
real interface. Remaining repos list as plain DOM cards below it.

---

## 6. Motion

| | |
|---|---|
| Easing | `power2.inOut` camera, `power1.out` DOM reveals |
| Ambient rotation | 0.08–0.15 rad/sec. Faster reads as cheap. |
| DOM reveal | 16px rise + opacity, 0.5s, 0.05s stagger, **once** |
| Lenis | `duration: 1.1`, `lerp: 0.09` |
| Camera lerp | 0.05 toward the scroll-derived target |

**Everything drifts. Nothing snaps.** Sci-fi reads as expensive when slow and
sparse, cheap when fast and busy.

The camera lerp factor does more for perceived smoothness than any other number
in the project. Tune it before adding anything else.

**Reveal animations fire once and never replay on scroll-up.** Re-animating
content the reader has already seen is irritating and is a generated-design tell.
Dense sections get a short stagger only — a 14-bullet list animating in sequence
is a delay, not an effect.

### Reduced motion

Camera cuts between act positions. Ridge morph becomes a two-state toggle at the
act boundary. Point field static. Reveals become instant opacity.

---

## 7. Scroll choreography

Eight sections. `p` is normalized scroll progress 0→1. Camera positions
`[x, y, z]`, `lookAt` origin unless noted.

Ranges are approximate: **sections size to their content**, so `p` boundaries are
computed from measured section offsets at runtime, not hard-coded. The table
gives intent and ordering.

| p | Section | Camera | Scene | Content |
|---|---|---|---|---|
| 0.00–0.12 | **Arrival** | `[0, 0.5, 6]` | Core centred, points dense, ridge below frame | Name, Devanagari, thesis line, all 7 social links, résumé |
| 0.12–0.26 | **Origin** | `[2, 1.5, 9]` back and right | Core recedes and fades. Ridge edge enters, **flat**. | Both degrees, dates, all 3 bullets each, institution links |
| 0.26–0.42 | **Pivot** | `[0, 3, 7]` descends toward plane | **`uMorph` 0 → 1.** Rules lift into ridge, crests catch red. | Marketing 2017–18 → Account Handler 2021–22 → Yarsa Games 2024. Full descriptions, dated, company links. The emotional centre. |
| 0.42–0.58 | **Systems** | `[-3, 2, 6]` orbits left | Ridge holds, drifts back. Lattice fades in. | 4 skill categories, 14 bullets, 17 marks. Longest section. |
| 0.58–0.68 | **Practice** | `[-2, 2.5, 7]` continues left | Lattice recedes | 5 competitive profiles with usernames and links |
| 0.68–0.82 | **Evidence** | `[0, 1, 5]` moves close, then holds while pinned | Ridge drifts behind the panels, unobscured only in the gaps. **Accordion is DOM above the canvas — §5.6.** | 4–6 curated projects as expanding panels: screenshot in a tilted frame, title, description, tech marks, repo and live links. Remaining repos as DOM cards below. |
| 0.82–0.92 | **Documentation** | `[1, 1, 5.5]` slight drift | Ridge steady | Laundry Recommendation System paper, dated, linked |
| 0.92–1.00 | **Signal** | `[0, 0.5, 6]` returns to origin | Core fades back in. Ridge settles toward flat (`uMorph → 0.2`). | Address with map link, phone, email, socials repeated |

**Why it returns to the opening position:** the page closes its loop, and the
ridge settling back toward flat says the ledger is still part of him. Better than
flying off into space.

Adjacent sections overlap by ~0.02 of progress so nothing pops.

---

## 8. Copy

The old site's copy is template filler and is the fastest thing to fix.

**Voice:** first person, past tense for history, plain verbs, no adjective doing
work a fact should do.

Replace this:
> A passionate individual who always thrives to work on end to end products which
> develop sustainable and scalable social and technical systems to create impact.

With something like:
> I balanced books for two years, then went and built games.

**But keep the detail below it.** The hero line is short; the sections are not.
The existing skill bullets and education descriptions are specific and real —
lightly edit them for voice, do not shorten them into slogans. A reader who wants
depth must find depth.

Rules:

- No "passionate", "thrives", "cutting-edge", "leverage", "solutions", "impact"
- Numbers over claims — "May–Aug 2024 at Yarsa Games" beats "experienced in game
  development"
- Every entry carries a date. Undated experience reads as invented.
- Buttons say what happens: "Email Rajendra", not "Get in touch"
- Drop the ⚡ prefix from every skill bullet — use a hairline rule or a hanging
  indent instead
- If a sentence would be equally true of ten thousand other developers, cut it

---

## 9. Do not

- **No sparse sections.** No heading with one sentence under it. See §1.
- `--step-4` type appears once. Never a second giant word further down.
- No cyan. No acid green. No second neon.
- No glassmorphism, backdrop blur panels, frosted cards.
- No HUD chrome: corner brackets, targeting reticles, scanning text, fake
  terminal output, matrix rain.
- No lens flares, no god rays, no chromatic aberration beyond a barely-there
  0.0005 offset, and none on mobile.
- No scroll-jacking, snap-scroll, or "swipe to continue".
- No downloaded 3D models. See `CLAUDE.md §4.1`.
- No emoji in the interface. The old site used ⚡ on every skill line; drop it.
- No entry numbers without a year attached.
- No loading screen unless something genuinely loads slowly.
- No text over the ridge crest at any breakpoint.

---

## 10. Done means

- [ ] Every one of the 9 content blocks in `CLAUDE.md §2` is present and complete
- [ ] Reads well with JavaScript disabled — content present, structure intact
- [ ] Reads well with WebGL unavailable — no blank screen
- [ ] Full test matrix in `CLAUDE.md §5` passes
- [ ] Content stress test: every list tripled, nothing overlaps or clips
- [ ] 60 fps desktop, ≥ 30 fps real mid-range Android on a real network
- [ ] Lighthouse mobile performance ≥ 85, accessibility 100, CLS < 0.05
- [ ] Contrast ≥ 4.5:1 both themes, verified in dark mode specifically
- [ ] Full keyboard traverse with visible focus at every stop
- [ ] `prefers-reduced-motion` produces a calm, usable, complete page
- [ ] Theme toggle changes the 3D scene, not just the DOM
- [ ] No placeholder content, no dead links, no `#` hrefs
- [ ] Every sentence is specific to Rajendra
- [ ] A reader can scroll for two minutes and keep learning dated, verifiable facts
