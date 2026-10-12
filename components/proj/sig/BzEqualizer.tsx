"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

const BANDS = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];
const RANGE = 12; // ± dB
// Blazify's own presets (app/.../eq/data/EqPresets.kt), in its order.
const PRESETS: [string, number[]][] = [
  ["Flat", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  ["Bass boost", [7, 6, 4, 2, 0, 0, 0, 0, 0, 0]],
  ["Treble boost", [0, 0, 0, 0, 0, 1, 3, 5, 6, 7]],
  ["Vocal", [-2, -1, 0, 2, 4, 4, 3, 2, 0, -1]],
  ["Rock", [5, 4, 3, 1, -1, -1, 2, 3, 4, 4]],
  ["Pop", [-1, 0, 2, 4, 4, 2, 0, -1, -1, -1]],
  ["Hip-hop", [6, 5, 2, 3, -1, -1, 1, 2, 3, 4]],
  ["Electronic", [5, 4, 1, 0, -2, 2, 1, 1, 4, 5]],
  ["Jazz", [4, 3, 1, 2, -1, -1, 0, 1, 3, 4]],
  ["Classical", [5, 4, 3, 2, -1, -1, 0, 2, 3, 4]],
  ["Acoustic", [4, 3, 2, 1, 1, 1, 2, 3, 3, 2]],
  ["Loudness", [6, 4, 1, 0, -1, 0, 1, 3, 5, 6]],
  ["Podcast", [-4, -3, -1, 2, 4, 4, 3, 1, -1, -3]],
];
const DEMO = ["Rock", "Vocal", "Bass boost", "Electronic", "Podcast", "Jazz"];

const W = 1000;
const H = 220;
const toY = (g: number) => H / 2 - (g / RANGE) * (H / 2 - 14);

/** A smooth curve through the band points (Catmull-Rom as cubic Béziers). */
function curve(gains: number[]) {
  const pts = gains.map((g, i) => [(i / (gains.length - 1)) * W, toY(g)]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const fmt = (g: number) => `${g > 0 ? "+" : ""}${g.toFixed(1)} dB`;
// GSAP reads an array as a list of targets, so the live gains tween as b0…b9 on one object.
const toObj = (g: number[]) => Object.fromEntries(g.map((v, i) => [`b${i}`, v])) as Record<string, number>;
const fromObj = (o: Record<string, number>) => BANDS.map((_, i) => o[`b${i}`]);

/** Blazify's 10-band equalizer, playable: drag the bands or pick a preset. */
export default function BzEqualizer() {
  const root = useRef<HTMLDivElement>(null);
  const [gains, setGains] = useState<number[]>(PRESETS[4][1]);
  const [preset, setPreset] = useState<string | null>("Rock");
  const [on, setOn] = useState(true);
  const live = useRef(toObj(PRESETS[4][1]));
  const touched = useRef(false);

  const { contextSafe } = useGSAP({ scope: root });

  const apply = contextSafe((name: string, byUser = true) => {
    if (byUser) touched.current = true;
    const target = PRESETS.find(([n]) => n === name)![1];
    setPreset(name);
    gsap.killTweensOf(live.current);
    if (!matchMedia(MOTION_OK).matches) {
      Object.assign(live.current, toObj(target));
      return setGains([...target]);
    }
    gsap.to(live.current, { ...toObj(target), duration: 0.7, ease: "expo.out", onUpdate: () => setGains(fromObj(live.current)) });
  });

  const drag = (i: number, v: number) => {
    touched.current = true;
    gsap.killTweensOf(live.current);
    live.current[`b${i}`] = v;
    const next = fromObj(live.current);
    setGains(next);
    setPreset(PRESETS.find(([, g]) => g.every((x, j) => Math.abs(x - next[j]) < 0.01))?.[0] ?? null);
  };

  const applyRef = useRef(apply);
  applyRef.current = apply;

  // Plays through a few presets on its own once it's on screen, until you touch it.
  useEffect(() => {
    if (!matchMedia(MOTION_OK).matches) return;
    let n = 0;
    let id: ReturnType<typeof setInterval> | undefined;
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top 75%",
      end: "bottom 15%",
      onToggle: (self) => {
        clearInterval(id);
        if (self.isActive)
          id = setInterval(() => {
            if (touched.current) return clearInterval(id);
            applyRef.current(DEMO[n++ % DEMO.length], false);
          }, 2200);
      },
    });
    return () => {
      clearInterval(id);
      st.kill();
    };
  }, []);

  const shown = on ? gains : gains.map(() => 0);
  const path = curve(shown);

  return (
    <div className={`bz-eq${on ? "" : " is-off"}`} ref={root}>
      <div className="bz-eq-head">
        <b>Equalizer</b>
        <span className="bz-eq-preset" aria-live="polite">
          {on ? (preset ?? "Custom") : "Off"}
        </span>
        <button type="button" className="bz-eq-switch" role="switch" aria-checked={on} aria-label="Equalizer on" onClick={() => setOn((v) => !v)}>
          <i />
        </button>
      </div>

      <div className="bz-eq-chips" role="group" aria-label="Presets">
        {PRESETS.map(([name]) => (
          <button key={name} type="button" className="bz-eq-chip" aria-pressed={preset === name} onClick={() => apply(name)} disabled={!on}>
            {name}
          </button>
        ))}
      </div>

      <svg className="bz-eq-graph" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="bz-eq-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--eq-acc)" }} stopOpacity="0.45" />
            <stop offset="1" style={{ stopColor: "var(--bz-ember, #ff7043)" }} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[-6, 0, 6].map((g) => (
          <line key={g} x1="0" x2={W} y1={toY(g)} y2={toY(g)} className={g === 0 ? "bz-eq-zero" : "bz-eq-grid"} />
        ))}
        <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#bz-eq-fill)" />
        <path d={path} className="bz-eq-line" />
        {shown.map((g, i) => (
          <circle key={i} cx={(i / 9) * W} cy={toY(g)} r="7" className="bz-eq-pt" />
        ))}
      </svg>

      <div className="bz-eq-bands">
        {BANDS.map((b, i) => (
          <label className="bz-eq-band" key={b}>
            <span className="bz-eq-db">{gains[i] > 0 ? "+" : ""}{Math.round(gains[i])}</span>
            <input
              type="range"
              min={-RANGE}
              max={RANGE}
              step={0.5}
              value={gains[i]}
              disabled={!on}
              onChange={(e) => drag(i, Number(e.target.value))}
              aria-label={`${b}Hz`}
              aria-valuetext={fmt(gains[i])}
            />
            <span className="bz-eq-hz">{b}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
