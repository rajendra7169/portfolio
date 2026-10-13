"use client";

// The education path in motion (EduPath.tsx). Every panel, card or moment, has
// a scene whose parts come in by their data-v and data-at (Scenes.tsx,
// Moments.tsx), and one pen travels the whole way: it writes each scene's
// data-pen parts as the scene builds, then lifts off and flies to the next,
// changing from pencil to pen to cursor (and once, a cap) on the way.
//
// Desktop: the viewport pins and the track travels sideways, holding at each
// panel while its scene draws; one number, `s` (scroll into the section, in
// px), drives the track, the scenes and the pen. Phones: a vertical timeline,
// where each scene draws as it passes up the screen and `s` is the page scroll.
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, DESKTOP } from "@/lib/gsap";

const WAVELENGTH = 820; // px between crests of the path
const MOVE = 0.7; // px of scroll per px the track travels
const HOLD = { card: 0.75, moment: 0.62 }; // scroll a panel holds for, in screen heights

type Tool = "pencil" | "pen" | "cursor" | "cap";
const TOOLS: Tool[] = ["pencil", "pen", "cursor", "cap"];

// How long each kind of part takes, as a share of its scene.
const DUR: Record<string, number> = { draw: 0.14, fade: 0.08, pop: 0.09, grow: 0.12, slam: 0.07, drop: 0.12, fly: 0.16, ride: 0.18, toss: 0.2, trace: 0.2, spin: 0.24 };
type Part = HTMLElement | SVGGraphicsElement;
const partDur = (p: Part) => {
  const d = Number(p.dataset.d);
  if (d) return d;
  if (p.dataset.v === "write") return Math.min(0.16, Math.max(0.03, 0.012 * (p.textContent ?? "").length));
  return DUR[p.dataset.v ?? "fade"] ?? 0.08;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
// True while GSAP is rewinding animations to their natural state (ScrollTrigger
// does that around every refresh). Scenes mustn't be moved then: moving them
// mid-rewind wipes out the starting states of parts whose time hasn't come.
const reverting = () => (gsap.core as unknown as { reverting?: () => boolean }).reverting?.() ?? false;
const smooth = (v: number) => {
  const u = clamp01(v);
  return u * u * (3 - 2 * u);
};
const inOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));

// The pen's way through one scene: a run of strokes in the scene's own units,
// each with its time and the tool that makes it.
type Seg = { t0: number; t1: number; pts: number[]; tool: Tool; write: number };
type Panel = {
  el: HTMLElement;
  card: HTMLElement | null;
  svg: SVGSVGElement;
  vb: { x: number; y: number; w: number; h: number };
  tl: gsap.core.Timeline;
  D: number;
  segs: Seg[];
  tool: Tool;
  a: number; // s at which its scene starts,
  b: number; // is done,
  c: number; // and the pen, having rested, flies on
  T: number;
  shown: boolean;
  slammed: boolean;
};
type PenAt = { x: number; y: number; lift: number; from: Tool; to: Tool; mix: number; busy: boolean };

/** Where the pen goes in a scene, read before anything in it has moved. */
function penSegs(svg: SVGSVGElement, fallback: Tool): Seg[] {
  const root = svg.getScreenCTM()!.inverse();
  const segs: Seg[] = [];
  svg.querySelectorAll<SVGGraphicsElement>("[data-pen]").forEach((el) => {
    const m = root.multiply(el.getScreenCTM()!);
    const pt = (x: number, y: number) => {
      const p = new DOMPoint(x, y).matrixTransform(m);
      return [p.x, p.y];
    };
    const v = el.dataset.v;
    let pts: number[] = [];
    if (el instanceof SVGGeometryElement && (v === "draw" || v === "trace")) {
      const L = el.getTotalLength();
      const n = Math.max(8, Math.min(90, Math.round(L / 5)));
      for (let i = 0; i <= n; i++) {
        const p = el.getPointAtLength((L * i) / n);
        pts.push(...pt(p.x, p.y));
      }
    } else {
      const b = el.getBBox();
      pts = v === "write" ? [...pt(b.x, b.y + b.height * 0.86), ...pt(b.x + b.width, b.y + b.height * 0.86)] : pt(b.x + b.width / 2, b.y + b.height / 2);
    }
    const t0 = Number(el.dataset.at) || 0;
    segs.push({ t0, t1: t0 + partDur(el), pts, tool: (el.dataset.tool ?? "") as Tool, write: v === "write" ? (el.textContent ?? "").length : 0 });
  });
  segs.sort((a, b) => a.t0 - b.t0);
  let tool = fallback;
  segs.forEach((s) => (tool = s.tool = s.tool || tool));
  return segs;
}

const along = (pts: number[], u: number): [number, number] => {
  const n = pts.length / 2 - 1;
  if (n <= 0) return [pts[0], pts[1]];
  const f = clamp01(u) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const r = f - i;
  return [pts[2 * i] + (pts[2 * i + 2] - pts[2 * i]) * r, pts[2 * i + 1] + (pts[2 * i + 3] - pts[2 * i + 1]) * r];
};

/** The pen in a scene at time T: on a stroke, between strokes, or resting. */
function penIn(segs: Seg[], T: number): PenAt | null {
  if (!segs.length) return null;
  let k = -1;
  for (let i = 0; i < segs.length && segs[i].t0 <= T; i++) k = i;
  if (k < 0) {
    const [x, y] = along(segs[0].pts, 0);
    return { x, y, lift: 18, from: segs[0].tool, to: segs[0].tool, mix: 0, busy: false };
  }
  const s = segs[k];
  if (T < s.t1) {
    const u = (T - s.t0) / (s.t1 - s.t0);
    const [x, y] = along(s.pts, u);
    // Writing goes up and down a little, letter by letter.
    return { x, y: y + (s.write ? Math.sin(u * Math.PI * s.write) * 1.6 : 0), lift: 0, from: s.tool, to: s.tool, mix: 0, busy: true };
  }
  const [ex, ey] = along(s.pts, 1);
  const nx = segs[k + 1];
  if (!nx) return { x: ex, y: ey, lift: 10, from: s.tool, to: s.tool, mix: 0, busy: false };
  const u = nx.t0 > s.t1 ? clamp01((T - s.t1) / (nx.t0 - s.t1)) : 1;
  const e = smooth(u);
  const [sx, sy] = along(nx.pts, 0);
  return { x: ex + (sx - ex) * e, y: ey + (sy - ey) * e, lift: 6 + Math.sin(Math.PI * u) * 14, from: s.tool, to: nx.tool, mix: e, busy: false };
}

let clips = 0;
const NS = "http://www.w3.org/2000/svg";

/** A panel's scene as one paused timeline, 0 to 1 (a little over, at most). */
function panelTimeline(panel: HTMLElement, svg: SVGSVGElement, pan: boolean, undo: (() => void)[]) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  panel.querySelectorAll<Part>("[data-v]").forEach((p) => {
    const at = Number(p.dataset.at) || 0;
    const d = partDur(p);
    const pen = p.hasAttribute("data-pen");
    switch (p.dataset.v) {
      case "draw":
        tl.fromTo(p, { drawSVG: "0%" }, { drawSVG: "100%", duration: d, ease: pen ? "none" : "power1.inOut" }, at);
        break;
      case "write": {
        // Revealed by a clip that widens with the pen.
        const g = p as SVGGraphicsElement;
        const b = g.getBBox();
        const cp = document.createElementNS(NS, "clipPath");
        const r = document.createElementNS(NS, "rect");
        cp.id = `ep-w${++clips}`;
        cp.setAttribute("clipPathUnits", "userSpaceOnUse");
        r.setAttribute("x", String(b.x - 4));
        r.setAttribute("y", String(b.y - 10));
        r.setAttribute("height", String(b.height + 20));
        r.setAttribute("width", "0");
        cp.append(r);
        svg.append(cp);
        g.setAttribute("clip-path", `url(#${cp.id})`);
        undo.push(() => {
          cp.remove();
          g.removeAttribute("clip-path");
        });
        tl.fromTo(r, { attr: { width: 0 } }, { attr: { width: b.width + 8 }, duration: d, ease: "none" }, at);
        break;
      }
      // (Origins set first, and both scale axes named: `scale` with an origin in the
      // from-state only reached scaleX here.)
      case "pop":
        gsap.set(p, { transformOrigin: "50% 50%" });
        tl.fromTo(p, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: d, ease: "back.out(2.4)" }, at);
        break;
      case "grow":
        gsap.set(p, { transformOrigin: "50% 100%" });
        tl.fromTo(p, { scaleY: 0 }, { scaleY: 1, duration: d }, at);
        break;
      case "slam":
        gsap.set(p, { transformOrigin: "50% 50%" });
        tl.fromTo(p, { scaleX: 2.4, scaleY: 2.4, rotation: -16, autoAlpha: 0 }, { scaleX: 1, scaleY: 1, rotation: 0, autoAlpha: 1, duration: d, ease: "power4.in" }, at);
        break;
      case "drop":
        tl.to(p, { y: 90, rotation: 30, autoAlpha: 0, duration: d, ease: "power2.in" }, at);
        break;
      case "fly":
        tl.to(p, { x: Number(p.dataset.x), y: Number(p.dataset.y), rotation: Number(p.dataset.r) || 40, autoAlpha: 0, duration: d, ease: "power1.in" }, at);
        break;
      case "toss": {
        const up = Number(p.dataset.y) || 160;
        gsap.set(p, { transformOrigin: "50% 50%" });
        tl.to(p, { keyframes: { y: [0, -up, -up * 0.7], rotation: [0, 200, 320] }, duration: d, ease: "none" }, at);
        break;
      }
      case "ride": {
        // Along the path whose data-track matches (or several, one after another),
        // turning with it unless it keeps upright.
        const legs = (p.dataset.route ?? `${p.dataset.on}@${at}:${d}`).split(" ").map((leg) => {
          const [name, when] = leg.split("@");
          const [start, length] = when.split(":").map(Number);
          return { path: svg.querySelector<SVGGeometryElement>(`[data-track="${name}"]`)!, start, length };
        });
        const upright = p.hasAttribute("data-upright");
        const was = p.getAttribute("transform");
        undo.push(() => (was ? p.setAttribute("transform", was) : p.removeAttribute("transform")));
        legs.forEach(({ path, start, length }, k) => {
          const L = path.getTotalLength();
          const o = { u: 0 };
          const place = () => {
            const l = L * o.u;
            const pt = path.getPointAtLength(l);
            let deg = 0;
            if (!upright) {
              const a = path.getPointAtLength(Math.max(0, Math.min(L - 2, l - 1)));
              const c = path.getPointAtLength(Math.max(2, Math.min(L, l + 1)));
              deg = (Math.atan2(c.y - a.y, c.x - a.x) * 180) / Math.PI;
            }
            p.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${deg.toFixed(1)})`);
          };
          if (!k) place();
          tl.to(o, { u: 1, duration: length, ease: "power1.inOut", onUpdate: place }, start);
        });
        break;
      }
      case "spin":
        gsap.set(p, { svgOrigin: p.dataset.o });
        tl.fromTo(p, { rotation: 0 }, { rotation: Number(p.dataset.r) || 360, duration: d, ease: "power1.inOut" }, at);
        break;
      case "trace":
        tl.to({}, { duration: d }, at);
        break;
      default:
        // Up to its own opacity, if it has one (a soft glow, a faint hill).
        tl.fromTo(p, { autoAlpha: 0, y: 6 }, { autoAlpha: Number(p.getAttribute("opacity") ?? 1), y: 0, duration: d }, at);
    }
  });
  // Phones: the scene is drawn wider than the screen, and the view follows the drawing across.
  if (pan) {
    const box = svg.parentElement!;
    tl.fromTo(svg, { x: 0 }, { x: () => box.clientWidth - parseFloat(getComputedStyle(svg).width), duration: 0.8, ease: "power1.inOut" }, 0.12);
  }
  return tl;
}

export default function EduPathMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const panelEls = q(".ep-panel");
      const penEl = q(".ep-pen")[0];
      const toolEls = TOOLS.map((t) => penEl.querySelector<HTMLElement>(`[data-tool="${t}"]`)!);
      const mm = gsap.matchMedia();

      // Plain functions: they only make short one-off tweens. (Inside matchMedia
      // callbacks, wrap with inContext, never useGSAP's contextSafe; see lib/gsap.)
      // A card's head builds in: logo pops, text rises, links follow.
      const reveal = (card: HTMLElement) => {
        const c = gsap.utils.selector(card);
        const links = c(".ep-links > *"); // the school has none
        const tl = gsap
          .timeline()
          .to(c(".ep-logo"), { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2.2)" })
          .to(c(".ep-when, .ep-school, .ep-degree"), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 0.1);
        if (links.length) tl.to(links, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2)" }, 0.45);
      };
      // The stamp slams down, kicks up a ring of dust and shakes the card.
      const slam = (card: HTMLElement) => {
        const c = gsap.utils.selector(card);
        gsap
          .timeline()
          .fromTo(c(".ep-stamp-in"), { scale: 2.8, rotation: -35, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.34, ease: "power4.in" })
          .fromTo(c(".ep-dust"), { scale: 0.5, autoAlpha: 0.9 }, { scale: 1.9, autoAlpha: 0, duration: 0.7, ease: "power2.out" })
          .fromTo(card, { x: 0 }, { keyframes: { x: [0, -7, 6, -4, 2, 0] }, duration: 0.4, ease: "none" }, "<");
      };
      const unslam = (card: HTMLElement) => gsap.to(card.querySelector(".ep-stamp-in"), { autoAlpha: 0, scale: 1.4, duration: 0.25 });
      const hideContent = () => {
        gsap.set(q(".ep-logo"), { scale: 0, rotation: -90 });
        gsap.set(q(".ep-when, .ep-school, .ep-degree"), { autoAlpha: 0, y: 18 });
        gsap.set(q(".ep-links > *"), { autoAlpha: 0, y: 14 });
      };

      mm.add({ rail: `${DESKTOP} and ${MOTION_OK}`, flow: `(max-width: 899px) and ${MOTION_OK}` }, (ctx) => {
        const { rail, flow } = ctx.conditions as Record<string, boolean>;
        if (!rail && !flow) return;

        gsap.from(q(".ep-h2 .char"), {
          yPercent: 115,
          rotate: 6,
          duration: 1.1,
          stagger: 0.035,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });
        hideContent();
        if (rail) el.classList.add("is-rail");
        if (flow) el.classList.add("is-pan");

        // The scenes, read (for the pen) before any of them is touched.
        const undo: (() => void)[] = [];
        const panels: Panel[] = panelEls.map((p) => {
          const svg = p.querySelector<SVGSVGElement>(".ep-scene svg")!;
          const tool = (svg.dataset.tool as Tool) || "pen";
          const segs = penSegs(svg, tool);
          const tl = panelTimeline(p, svg, flow, undo);
          const vb = svg.viewBox.baseVal;
          return { el: p, card: p.querySelector<HTMLElement>(".ep-card"), svg, vb: { x: vb.x, y: vb.y, w: vb.width, h: vb.height }, tl, D: Math.max(1, tl.duration()), segs, tool, a: 0, b: 1, c: 1, T: -1, shown: false, slammed: false };
        });

        const scrubPanel = (p: Panel, s: number, cards: boolean) => {
          const T = clamp01((s - p.a) / (p.b - p.a)) * p.D;
          if (Math.abs(T - p.T) > 1e-5) {
            p.T = T;
            p.tl.time(T);
          }
          if (!cards || !p.card) return;
          if (!p.shown && s >= p.a - innerHeight * 0.05) {
            p.shown = true;
            reveal(p.card);
          }
          // Stamped once its scene is done.
          const on = s >= p.b;
          if (on !== p.slammed) {
            p.slammed = on;
            if (on) slam(p.card);
            else unslam(p.card);
          }
        };

        // ── The pen ──
        el.classList.add("is-pen");
        const size = flow ? 0.72 : 1;
        const shown: string[] = [];
        let idle = false;
        const toScreen = (p: Panel, x: number, y: number) => {
          const r = p.svg.getBoundingClientRect();
          const k = Math.min(r.width / p.vb.w, r.height / p.vb.h);
          return [r.left + (r.width - p.vb.w * k) / 2 + (x - p.vb.x) * k, r.top + (r.height - p.vb.h * k) / 2 + (y - p.vb.y) * k];
        };
        const penOf = (p: Panel, T: number): PenAt => {
          const at = penIn(p.segs, T) ?? { x: p.vb.x + p.vb.w / 2, y: p.vb.y + p.vb.h / 2, lift: 10, from: p.tool, to: p.tool, mix: 0, busy: false };
          const [x, y] = toScreen(p, at.x, at.y);
          return { ...at, x, y };
        };
        const paint = (x: number, y: number, rot: number, scale: number, alpha: number, from: Tool, to: Tool, mix: number, still: boolean) => {
          penEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${(scale * size).toFixed(3)})`;
          penEl.style.opacity = alpha.toFixed(3);
          TOOLS.forEach((t, i) => {
            const w = (t === from ? 1 - mix : 0) + (t === to ? mix : 0);
            const v = w.toFixed(3);
            if (shown[i] === v) return;
            shown[i] = v;
            toolEls[i].style.opacity = v;
            toolEls[i].style.transform = `scale(${(0.4 + 0.6 * w).toFixed(3)})`;
          });
          if (still !== idle) {
            idle = still;
            penEl.classList.toggle("is-idle", still);
          }
        };
        const penAt = (s: number) => {
          const n = panels.length;
          let i = -1;
          for (let k = 0; k < n && s >= panels[k].a; k++) i = k;
          if (i < 0) {
            const A = penOf(panels[0], 0);
            return paint(A.x, A.y - A.lift, 0, 1, clamp01(1 - (panels[0].a - s) / 160), A.from, A.from, 0, true);
          }
          const p = panels[i];
          if (s <= p.c || i === n - 1) {
            const A = penOf(p, clamp01((s - p.a) / (p.b - p.a)) * p.D);
            return paint(A.x, A.y - A.lift, A.busy ? Math.sin(s * 0.09) * 3 : 0, 1, 1, A.from, A.to, A.mix, !A.busy);
          }
          // Flying on to the next scene, in an arc, growing as it comes towards you.
          const nx = panels[i + 1];
          const t = clamp01((s - p.c) / (nx.a - p.c));
          const e = inOut(t);
          const A = penOf(p, p.D);
          const B = penOf(nx, 0);
          const ax = A.x;
          const ay = A.y - A.lift;
          const dist = Math.hypot(B.x - ax, B.y - B.lift - ay);
          const arc = Math.sin(Math.PI * t) * Math.min(200, 50 + dist * 0.28);
          const from = A.to;
          const to = B.from;
          const mix = from === to ? 0 : smooth((t - (from === "cap" ? 0.04 : 0.38)) / 0.24);
          paint(ax + (B.x - ax) * e, ay + (B.y - B.lift - ay) * e - arc, Math.sin(Math.PI * t) * 18 * Math.sign(B.x - ax || 1), 1 + Math.sin(Math.PI * t) * 0.35, 1, from, to, mix, false);
        };

        const cleanup = () => {
          undo.forEach((f) => f());
          el.classList.remove("is-rail", "is-pan", "is-pen");
          penEl.removeAttribute("style");
          toolEls.forEach((t) => t.removeAttribute("style"));
        };

        if (flow) {
          // Phones: a vertical line fills as you read; each scene draws as it passes
          // up the screen, one after another; stamps land as each card arrives.
          gsap.fromTo(q(".ep-vfill"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: q(".ep-stops")[0], start: "top 70%", end: "bottom 60%", scrub: true } });
          const measure = () => {
            let prev = -Infinity;
            panels.forEach((p) => {
              const r = p.svg.parentElement!.getBoundingClientRect();
              const mid = r.top + scrollY + r.height / 2;
              p.a = Math.max(mid - 0.9 * innerHeight, prev + 40);
              p.b = Math.max(p.a + 160, mid - 0.36 * innerHeight);
              p.c = p.b + 0.08 * innerHeight;
              prev = p.c;
            });
          };
          const update = () => {
            if (reverting()) return;
            const s = scrollY;
            panels.forEach((p) => scrubPanel(p, s, false));
            penAt(s);
          };
          q(".ep-card").forEach((card) => {
            ScrollTrigger.create({ trigger: card, start: "top 85%", once: true, onEnter: () => reveal(card) });
            ScrollTrigger.create({ trigger: card, start: "top 45%", onEnter: () => slam(card), onLeaveBack: () => unslam(card) });
          });
          measure();
          ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onUpdate: update,
            onRefresh: () => {
              measure();
              panels.forEach((p) => (p.T = -1));
              update();
            },
          });
          update();
          return cleanup;
        }

        // ── Desktop: pin the viewport and travel sideways through the years ──
        const viewport = q(".ep-viewport")[0];
        const track = q(".ep-track")[0];
        const line = q(".ep-line")[0];
        const svg = line.querySelector("svg")!;
        const [bg, fg] = Array.from(line.querySelectorAll<SVGPathElement>(".ep-path"));
        const rider = q(".ep-rider")[0];
        const nodes = q(".ep-node");
        const yearEl = q(".ep-year")[0];
        const dated = panels.filter((p) => p.el.dataset.year);
        const years = dated.map((p) => Number(p.el.dataset.year));
        let W = 0;
        let mid = 0;
        let amp = 0;
        let yc: number[] = []; // the dated panels' centres, along the track
        const X: number[] = []; // track offset that centres each panel
        const S: number[] = []; // s where each panel's hold starts
        const H: number[] = []; // and how long it lasts
        const M: number[] = []; // scroll spent travelling to each panel
        let total = 1;
        let lastYear = -1;

        // One formula draws the path and places the rider, so they always agree.
        const wave = (x: number) => mid + amp * Math.sin((x / WAVELENGTH) * Math.PI * 2);
        const slope = (x: number) => Math.atan(((amp * 2 * Math.PI) / WAVELENGTH) * Math.cos((x / WAVELENGTH) * Math.PI * 2));

        const build = () => {
          W = track.scrollWidth;
          const lh = line.clientHeight;
          mid = lh / 2;
          amp = lh * 0.28;
          svg.setAttribute("width", String(W));
          svg.setAttribute("height", String(lh));
          svg.setAttribute("viewBox", `0 0 ${W} ${lh}`);
          let d = `M0 ${wave(0).toFixed(1)}`;
          for (let x = 16; x <= W + 16; x += 16) d += `L${x} ${wave(x).toFixed(1)}`;
          bg.setAttribute("d", d);
          fg.setAttribute("d", d);
          // Measured against the track itself (offsetLeft would be relative to the list).
          const t = track.getBoundingClientRect().left;
          const centres = panels.map((p) => p.el.getBoundingClientRect().left - t + p.el.offsetWidth / 2);
          yc = dated.map((p) => centres[panels.indexOf(p)]);
          nodes.forEach((n, i) => gsap.set(n, { x: yc[i], y: wave(yc[i]) }));
          // The schedule: hold at each panel while it draws, then travel to the next.
          const vw = innerWidth;
          const vh = innerHeight;
          const far = Math.max(0, W - vw);
          let s = 0;
          panels.forEach((p, i) => {
            X[i] = Math.max(0, Math.min(far, centres[i] - vw / 2));
            M[i] = i ? Math.max(1, Math.abs(X[i] - X[i - 1]) * MOVE) : 0;
            s += M[i];
            S[i] = s;
            H[i] = vh * (p.card ? HOLD.card : HOLD.moment);
            s += H[i];
            // A scene starts on its way in and is done most of the way through its hold
            // (the first, already in place, draws as the section arrives).
            p.a = i ? S[i] - 0.45 * M[i] : -0.7 * vh;
            p.b = S[i] + 0.8 * H[i];
            p.c = S[i] + H[i];
            p.el.dataset.hold = String(Math.round(S[i] + 0.92 * H[i])); // for the tests: in place, and done
          });
          total = s;
        };
        const xAt = (s: number) => {
          for (let i = 0; i < panels.length; i++) {
            if (s < S[i]) return X[i - 1] + (X[i] - X[i - 1]) * inOut((s - (S[i] - M[i])) / M[i]);
            if (s <= S[i] + H[i]) return X[i];
          }
          return X[X.length - 1];
        };

        // Year under the rider: interpolated between the dated panels, so the gap years tick by too.
        const yearAt = (x: number) => {
          if (x <= yc[0]) return years[0];
          for (let i = 0; i < yc.length - 1; i++) {
            if (x <= yc[i + 1]) return gsap.utils.interpolate(years[i], years[i + 1], (x - yc[i]) / (yc[i + 1] - yc[i]));
          }
          return years[years.length - 1];
        };

        const prog = { p: 0 };
        let pinStart = 0;
        const update = () => {
          if (reverting()) return;
          const sPin = prog.p * total;
          const s = sPin + Math.min(0, scrollY - pinStart);
          const xT = xAt(sPin);
          gsap.set(track, { x: -xT });
          const x = xT + innerWidth / 2;
          gsap.set(fg, { drawSVG: `0% ${Math.max(0, Math.min(100, (x / W) * 100))}%` });
          gsap.set(rider, { x, y: wave(x), rotation: (slope(x) * 180) / Math.PI });
          const y = Math.round(yearAt(x));
          if (y !== lastYear) {
            lastYear = y;
            yearEl.textContent = String(y);
          }
          nodes.forEach((n, i) => n.classList.toggle("is-passed", x >= yc[i] - 2));
          panels.forEach((p) => scrubPanel(p, s, true));
          penAt(s);
        };

        build();
        const slide = gsap.to(prog, {
          p: 1,
          ease: "none",
          onUpdate: update,
          scrollTrigger: {
            trigger: viewport,
            start: "top top",
            end: () => {
              build();
              return `+=${total}`;
            },
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              pinStart = self.start;
              panels.forEach((p) => (p.T = -1));
              update();
            },
          },
        });
        pinStart = slide.scrollTrigger!.start;
        // Before the pin (and after it) the page scroll still moves the first scene and the pen.
        ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: update });
        update();

        return cleanup;
      }, el);
    },
    { scope: root },
  );

  return (
    <section className="ep" ref={root} aria-labelledby="degrees">
      {children}
    </section>
  );
}
