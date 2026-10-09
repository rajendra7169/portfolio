# Dust engine — how sections use it

One fixed canvas (`DustProvider`) draws N particles that morph between shapes.
`state.t` is the shape index plus morph fraction; sections drive it with GSAP.

```ts
import { useDust } from "@/components/home/dust/DustProvider";
import { SHAPES } from "@/components/home/dust/layout";
const { engine, phone, motion } = useDust(); // engine is null until mounted, and null when motion is reduced
engine.state.t                                // -1 scatter · 0 portrait · 1 nepal · 2 phone · 3 window · 4 globe · 5 pinch · 6-9 cells · 10 tiles · 11 kurta
gsap.to(engine.state, { t: SHAPES.PHONE, ease: "none", scrollTrigger: {...} })
engine.state.{eqAmpLyric, eqAmpPlay}          // EQ amplitude multipliers (phone/window)
engine.state.{theta, dragVel, arcs}           // globe
engine.state.tileScale[k]                     // tiles hover scale
engine.state.{tHover, hoverMix}               // blend toward another shape (chip hover)
engine.state.wander                           // idle wander amplitude (kurta breathes at 2)
engine.state.link = { x2, y2, p, stageY }     // Kathmandu connector (canvas-drawn)
engine.state.burst = { x, y, t0: performance.now() }
engine.state.zeroG
engine.layout.rect(SHAPES.X, aspect) / tiles() / rail() / globe()   // px rects, recomputed on resize
engine.kathmandu()                            // px position of the orange pin on the Nepal shape
engine.whenReady(SHAPES.X)                    // promise; shapes build lazily in scroll order
engine.has(SHAPES.X)
engine.PIN, engine.ORANGE                     // particle ids of the orange pin + cluster
engine.pos(i), engine.settled(), engine.eqHeights(), engine.arcCount()
window.__dust = { engine, state, layout }     // for tests
```

Rules
- GSAP owns `transform` on anything it animates; CSS hover lifts go on an inner child with `translate`.
- Inside `gsap.matchMedia` callbacks, wrap event handlers that create tweens with `inContext(ctx, fn)` (lib/gsap.ts), never `contextSafe`.
- Entrances that must wait for the page curtain: `afterReveal(fn)` (components/PageTransition.tsx).
- Split headlines: `<Chars text="…" />` (components/Motion.tsx) → animate `.char`.
- Pinned sections set `refreshPriority` (hero 10, Blazify 8, globe 7, cells 6).
- Reduced motion: `engine` is null → render `<StillShape shape="…" label="…" />` in the right column and create no triggers.
- Icons: `components/Icon.tsx` is a server component; use it only from server-rendered markup files, never from `"use client"` files.
