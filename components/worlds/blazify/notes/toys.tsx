"use client";

// The liner notes' eight tracks, each a small working piece of the app. They
// play themselves while `demo` is on, and stop the moment someone takes over.
// Numbers and names come from Blazify's source where it has them: the buffer
// sizes (playback/BufferAhead.kt), the lyrics providers, the Listen Together
// message types (listentogether/), the accent palette (ThemeScreen.kt).

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { BLAZE, PALETTE, loadLook, paint, saveLook, tones, type Look } from "./paint";
import { QR_PATH, QR_SIZE } from "./qr";

export type ToyIcons = { spotify: ReactNode; ytm: ReactNode; google: ReactNode };
export type ToyProps = { demo: boolean; icons: ToyIcons };

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const css = (v: Record<string, string | number>) => v as CSSProperties;
const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Timed steps, run in order while `on`, then again: [wait in ms, what to do]. */
function useScript(on: boolean, steps: [number, () => void][]) {
  const ref = useRef(steps);
  useEffect(() => {
    ref.current = steps;
  });
  useEffect(() => {
    if (!on) return;
    let i = 0;
    let id = 0;
    const run = () => {
      const [ms, fn] = ref.current[i++ % ref.current.length];
      id = window.setTimeout(() => {
        fn();
        run();
      }, ms);
    };
    run();
    return () => clearTimeout(id);
  }, [on]);
}

function useEvery(ms: number, fn: () => void) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

const I = {
  search: "M10.5 4a6.5 6.5 0 0 1 5.2 10.4l4.4 4.4-1.4 1.4-4.4-4.4A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z",
  song: "M12 3v10.6A4 4 0 1 0 14 17V7h4V3h-6Z",
  album: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm0-5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z",
  artist: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5Z",
  playlist: "M3 6h12v2H3V6Zm0 5h12v2H3v-2Zm0 5h8v2H3v-2Zm14-5v6.3A3 3 0 1 0 19 20v-7h3v-2h-5Z",
  podcast: "M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2Z",
  local: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 3v13h10V5H7Z",
  wifi: "M12 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 13c2 0 3.8.8 5.1 2.1l-1.4 1.4A5.2 5.2 0 0 0 12 15c-1.4 0-2.8.6-3.7 1.5l-1.4-1.4A7.2 7.2 0 0 1 12 13Zm0-4.5c3.2 0 6.1 1.3 8.3 3.4l-1.4 1.4A9.7 9.7 0 0 0 12 10.5c-2.7 0-5.1 1.1-6.9 2.8l-1.4-1.4A11.7 11.7 0 0 1 12 8.5ZM12 4c4.4 0 8.4 1.8 11.3 4.7l-1.4 1.4A13.9 13.9 0 0 0 12 6 13.9 13.9 0 0 0 2.1 10.1L.7 8.7A15.9 15.9 0 0 1 12 4Z",
  data: "M3 20h3v-4H3v4Zm5 0h3v-8H8v8Zm5 0h3V8h-3v12Zm5-16v16h3V4h-3Z",
  off: "m3.3 2 18.7 18.7-1.4 1.4-3.4-3.4V20h-3v-4.3l-2-2V20H9v-8.3l-2-2V20H4v-2l2-2.7L1.9 3.4 3.3 2ZM20 4v12.2l-3-3V8h3V4Zm-5 4v2.2l-3-3V8h3Z",
  play: "M8 5v14l11-7z",
  pause: "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z",
  next: "M6 6v12l8.5-6L6 6Zm9 0v12h2V6h-2Z",
  check: "M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6 11-11-1.4-1.4z",
  share: "M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7c0 .3 0 .5.1.8L8.4 11.2a3 3 0 1 0 0 3.6l6.7 3.4A3 3 0 1 0 18 16Z",
};
const Svg = ({ d, className }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

// ─── 1 · Millions of songs: search for anything ──────────────────────────────
const TRY = ["Narayan Gopal", "lofi to study to", "rain on a tin roof", "tech podcasts"];
const KINDS = [
  ["all", "All"],
  ["song", "Songs"],
  ["album", "Albums"],
  ["artist", "Artists"],
  ["playlist", "Playlists"],
  ["podcast", "Podcasts"],
  ["local", "On this phone"],
] as const;
type Kind = (typeof KINDS)[number][0];

function results(q: string) {
  const t = q.trim().replace(/\s+/g, " ").replace(/(^|\s)(\p{L})/gu, (_, s, c) => s + c.toUpperCase());
  const file = t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "track";
  return [
    { kind: "song", title: t, sub: "Song" },
    { kind: "artist", title: t, sub: "Artist" },
    { kind: "album", title: t, sub: "Album" },
    { kind: "playlist", title: `${t} mix`, sub: "Community playlist" },
    { kind: "podcast", title: `On ${t}`, sub: "Podcast episode" },
    { kind: "local", title: `${file}.mp3`, sub: "On this phone" },
  ] as { kind: Exclude<Kind, "all">; title: string; sub: string }[];
}

export function Search({ demo }: ToyProps) {
  const [q, setQ] = useState("");
  const [shown, setShown] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const word = useRef(0);
  useEffect(() => {
    const id = setTimeout(() => setShown(q), 240);
    return () => clearTimeout(id);
  }, [q]);
  // Typed by itself: a query, a pause on the results, then back to empty.
  useEffect(() => {
    if (!demo) return;
    let id = 0;
    let n = 0;
    let dir = 1;
    let w = TRY[word.current++ % TRY.length];
    const tick = () => {
      n += dir;
      setQ(w.slice(0, n));
      if (dir === 1 && n === w.length) return void ((dir = -1), (id = window.setTimeout(tick, 2200)));
      if (dir === -1 && n === 0) return void ((dir = 1), (w = TRY[word.current++ % TRY.length]), (id = window.setTimeout(tick, 420)));
      id = window.setTimeout(tick, dir === 1 ? 80 : 24);
    };
    id = window.setTimeout(tick, 500);
    return () => clearTimeout(id);
  }, [demo]);

  const list = shown.trim() ? results(shown).filter((r) => kind === "all" || r.kind === kind) : [];
  return (
    <div className="ln-search">
      <label className="ln-search-bar">
        <Svg d={I.search} />
        <input
          type="search"
          value={q}
          maxLength={40}
          onChange={(e) => setQ(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          placeholder="Songs, artists, podcasts…"
          aria-label="Search, the way Blazify does"
          enterKeyHint="search"
        />
        <Svg d={I.podcast} className="ln-search-mic" />
      </label>
      <div className="ln-chips" role="radiogroup" aria-label="Show only">
        {KINDS.map(([id, label]) => (
          <button key={id} type="button" role="radio" aria-checked={kind === id} className="ln-chip" onClick={() => setKind(id)}>
            {label}
          </button>
        ))}
      </div>
      <ul className="ln-results" key={`${shown}|${kind}`} aria-live="polite">
        {list.length ? (
          list.map((r, i) => (
            <li key={r.kind} className={`ln-result ln-result--${r.kind}`} style={css({ "--i": i, "--h": hue(r.title + r.kind) })}>
              <span className="ln-result-art">
                <Svg d={I[r.kind]} />
              </span>
              <span className="ln-result-text">
                <b>{r.title}</b>
                <small>{r.sub}</small>
              </span>
              <Svg d={I.play} className="ln-result-play" />
            </li>
          ))
        ) : (
          <li className="ln-result-empty">{shown.trim() ? "Nothing of that kind for this one." : "Type a song, an artist, a mood or a podcast."}</li>
        )}
      </ul>
    </div>
  );
}

// ─── 2 · Offline first: the buffer keeps the song going ──────────────────────
// BufferAhead.kt: up to four minutes ahead on Wi-Fi, fifty seconds on mobile data.
const LEN = 334;
const CAP = { wifi: 240, data: 50, off: 0 } as const;
type Net = keyof typeof CAP;
const NETS: [Net, string, string][] = [
  ["wifi", "Wi-Fi", I.wifi],
  ["data", "Mobile data", I.data],
  ["off", "No signal", I.off],
];
const TUNES = ["Phewa at Dawn", "Ring Road Lights", "Monsoon Static", "Late Bus Home"];
const SPEED = 12; // the song runs twelve times faster here

export function Offline({ demo }: ToyProps) {
  const [net, setNet] = useState<Net>("data");
  const [s, setS] = useState({ pos: 6, buf: 6, kept: false, song: 0 });
  useEvery(100, () =>
    setS((o) => {
      let { pos, buf, kept } = o;
      if (kept) buf = LEN;
      else if (net !== "off") buf = Math.max(buf, Math.min(Math.min(LEN, pos + CAP[net]), buf + 6));
      const stalled = !kept && buf - pos < 0.1 && buf < LEN;
      if (!stalled) pos = Math.min(buf, pos + SPEED / 10);
      // Played to the end, the song is kept on the phone and plays with no signal.
      if (pos >= LEN) return { ...o, pos: 0, buf: LEN, kept: true };
      return { ...o, pos, buf };
    }),
  );
  useScript(demo, [
    [2400, () => setNet("off")],
    [5200, () => setNet("wifi")],
    [3200, () => setNet("off")],
    [3600, () => setNet("data")],
  ]);
  const skip = () => setS((o) => ({ pos: 0, buf: 0, kept: false, song: o.song + 1 }));
  const ahead = s.buf - s.pos;
  const stalled = !s.kept && ahead < 0.1 && s.buf < LEN;
  const say = s.kept
    ? "Played through once, so it's kept on the phone. It plays with no signal at all."
    : stalled
      ? "Out of buffer. It picks up the moment the signal comes back."
      : net === "off"
        ? `No signal, still playing: ${mmss(ahead)} left in the buffer.`
        : net === "wifi"
          ? `${mmss(ahead)} buffered ahead. On Wi-Fi it fetches up to four minutes.`
          : `${mmss(ahead)} ahead. On mobile data it stops at fifty seconds, so a skipped song costs you little.`;
  const title = TUNES[s.song % TUNES.length];
  return (
    <div className={`ln-off is-${net}${stalled ? " is-stalled" : ""}${s.kept ? " is-kept" : ""}`}>
      <div className="ln-off-now">
        <span className="ln-off-art" style={css({ "--h": hue(title) })} aria-hidden="true">
          <i />
        </span>
        <span className="ln-off-title">
          <b>{title}</b>
          <small>{s.kept ? "Kept on this phone" : stalled ? "Waiting for a signal…" : "Streaming"}</small>
        </span>
        <button type="button" className="ln-iconbtn" onClick={skip} aria-label="Next song">
          <Svg d={I.next} />
        </button>
      </div>
      <div className="ln-off-bar" aria-hidden="true">
        <i className="ln-off-buf" style={{ width: `${(s.buf / LEN) * 100}%` }} />
        <i className="ln-off-played" style={{ width: `${(s.pos / LEN) * 100}%` }} />
        <b className="ln-off-head" style={{ left: `${(s.pos / LEN) * 100}%` }} />
      </div>
      <div className="ln-off-times" aria-hidden="true">
        <span>{mmss(s.pos)}</span>
        <span>×{SPEED}</span>
        <span>{mmss(LEN)}</span>
      </div>
      <p className="ln-off-say" aria-live="polite">
        {say}
      </p>
      <div className="ln-seg ln-off-net" role="radiogroup" aria-label="Signal">
        {NETS.map(([id, label, d]) => (
          <button key={id} type="button" role="radio" aria-checked={net === id} onClick={() => setNet(id)}>
            <Svg d={d} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 3 · Synced lyrics: word by word, with romanization and translation ──────
// Four lines written for this page, so no song's words are borrowed.
const LYRICS = [
  { ne: "पहाडको हावा, मनको गीत", rom: "Pahadko hawa, manko geet", en: "Wind off the hills, a song in the heart" },
  { ne: "सडकभरि बत्ती, आँखाभरि सपना", rom: "Sadakbhari batti, aankhabhari sapana", en: "Lights all down the road, dreams all through the eyes" },
  { ne: "बिस्तारै बजाऊ, रात लामो छ", rom: "Bistarai bajau, raat lamo chha", en: "Play it slowly, the night is long" },
  { ne: "भोलि फेरि सुनौँला", rom: "Bholi pheri sunaunla", en: "We'll listen again tomorrow" },
];
const PROVIDERS = ["LRCLIB", "KuGou", "BetterLyrics", "Paxsenix", "LyricsPlus"]; // PreferredLyricsProvider
const LINE = 3.6;
type Aux = "none" | "rom" | "en";

export function Lyrics({ demo }: ToyProps) {
  const [line, setLine] = useState(0);
  const [take, setTake] = useState(0);
  const [aux, setAux] = useState<Aux>("rom");
  const [order, setOrder] = useState(PROVIDERS);
  const chips = useRef<HTMLOListElement>(null);
  const before = useRef<Map<string, number> | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setLine((l) => (l + 1) % LYRICS.length), LINE * 1000);
    return () => clearTimeout(id);
  }, [line, take]);
  useScript(demo, [
    [LINE * 2000, () => setAux("en")],
    [LINE * 2000, () => reorder(order[2])],
    [LINE * 1000, () => setAux("rom")],
  ]);
  // The provider chips slide to their new places (FLIP).
  const reorder = (p: string) => {
    before.current = new Map([...(chips.current?.children ?? [])].map((c) => [(c as HTMLElement).dataset.p!, c.getBoundingClientRect().left]));
    setOrder((o) => [p, ...o.filter((x) => x !== p)]);
  };
  useLayoutEffect(() => {
    const was = before.current;
    before.current = null;
    if (!was || still()) return;
    [...(chips.current?.children ?? [])].forEach((c) => {
      const dx = (was.get((c as HTMLElement).dataset.p!) ?? 0) - c.getBoundingClientRect().left;
      if (dx) gsap.fromTo(c, { x: dx }, { x: 0, duration: 0.5, ease: "expo.out" });
    });
  }, [order]);

  return (
    <div className="ln-ly">
      <ol className="ln-ly-lines">
        {LYRICS.map((l, i) => {
          const words = l.ne.split(" ");
          const w = (LINE - 0.8) / words.length;
          return (
            <li key={i} className={i === line ? "is-now" : i < line ? "is-past" : undefined}>
              <button
                type="button"
                onClick={() => {
                  setLine(i);
                  setTake((t) => t + 1);
                }}
                aria-label={`Sing from: ${l.en}`}
              >
                <span lang="ne" className="ln-ly-ne" key={i === line ? `n${take}` : "idle"}>
                  {words.map((x, j) => (
                    <span key={j} className="ln-ly-w" style={css({ "--d": `${j * w}s`, "--w": `${w}s` })}>
                      {x}
                    </span>
                  ))}
                </span>
                {aux !== "none" && (
                  <small lang={aux === "rom" ? "ne-Latn" : "en"} className="ln-ly-aux">
                    {aux === "rom" ? l.rom : l.en}
                  </small>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="ln-seg" role="radiogroup" aria-label="Under each line">
        {(
          [
            ["none", "Original"],
            ["rom", "Romanized"],
            ["en", "Translated"],
          ] as [Aux, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" role="radio" aria-checked={aux === id} onClick={() => setAux(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="ln-ly-prov">
        <span>Tries the providers in your order. Tap one to put it first.</span>
        <ol ref={chips}>
          {order.map((p, i) => (
            <li key={p} data-p={p}>
              <button type="button" onClick={() => reorder(p)} aria-label={`${p}, choice ${i + 1}. Put it first`}>
                <b>{i + 1}</b>
                {p}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ─── 4 · 10-band equalizer: AutoEQ flattens your headphones ──────────────────
// The curves are illustrative; in the app you search the AutoEq database by model.
const HZ = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];
const CANS = [
  { name: "Closed over-ear", m: [5, 4.5, 3, 1, 0, 0, -2, -4, 1.5, -3] },
  { name: "Wireless earbuds", m: [-4, -3, -1.5, 0, 0.5, 0, 2, 5, 3, -5] },
  { name: "Open-back", m: [-6, -4, -1.5, 0, 0, 0.5, 1, -1, 4, -2] },
];
const GX = (i: number) => 22 + i * 39.5;
const GY = (db: number) => 90 - db * 11;
function curve(v: number[]) {
  const p = v.map((d, i) => [GX(i), GY(d)]);
  let s = `M ${p[0][0]} ${p[0][1].toFixed(2)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, d] = [p[i - 1] ?? p[i], p[i], p[i + 1], p[i + 2] ?? p[i + 1]];
    s += ` C ${(b[0] + (c[0] - a[0]) / 6).toFixed(2)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(2)} ${(c[0] - (d[0] - b[0]) / 6).toFixed(2)} ${(c[1] - (d[1] - b[1]) / 6).toFixed(2)} ${c[0]} ${c[1].toFixed(2)}`;
  }
  return s;
}

export function AutoEq({ demo }: ToyProps) {
  const [can, setCan] = useState(0);
  const [on, setOn] = useState(false);
  const meas = useRef<SVGPathElement>(null);
  const fix = useRef<SVGPathElement>(null);
  const hear = useRef<SVGPathElement>(null);
  const now = useRef({ m: [...CANS[0].m], mix: 0 });
  useLayoutEffect(() => {
    const draw = () => {
      const { m, mix } = now.current;
      meas.current?.setAttribute("d", curve(m));
      fix.current?.setAttribute("d", curve(m.map((x) => -x * mix)));
      hear.current?.setAttribute("d", curve(m.map((x) => x * (1 - mix))));
    };
    const from = { m: [...now.current.m], mix: now.current.mix };
    const to = { m: CANS[can].m, mix: on ? 1 : 0 };
    if (still()) {
      now.current = { m: [...to.m], mix: to.mix };
      return draw();
    }
    const t = { p: 0 };
    const tw = gsap.to(t, {
      p: 1,
      duration: 0.9,
      ease: "power3.inOut",
      onUpdate: () => {
        now.current = { m: from.m.map((x, i) => x + (to.m[i] - x) * t.p), mix: from.mix + (to.mix - from.mix) * t.p };
        draw();
      },
    });
    return () => void tw.kill();
  }, [can, on]);
  useScript(demo, [
    [1100, () => setOn(true)],
    [2600, () => setOn(false)],
    [500, () => setCan((c) => (c + 1) % CANS.length)],
  ]);
  const gains = CANS[can].m.map((x) => (on ? -x : 0));
  const pre = Math.max(0, ...gains);
  return (
    <div className={`ln-eq${on ? " is-on" : ""}`}>
      <div className="ln-seg" role="radiogroup" aria-label="Headphones">
        {CANS.map((c, i) => (
          <button key={c.name} type="button" role="radio" aria-checked={can === i} onClick={() => setCan(i)}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="ln-eq-plot">
        <svg className="ln-eq-graph" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
          {[-6, 0, 6].map((g) => (
            <line key={g} x1="0" x2="400" y1={GY(g)} y2={GY(g)} className={g ? "ln-eq-grid" : "ln-eq-zero"} />
          ))}
          <path ref={meas} className="ln-eq-meas" d={curve(CANS[0].m)} />
          <path ref={fix} className="ln-eq-fix" d={curve(CANS[0].m.map(() => 0))} />
          <path ref={hear} className="ln-eq-hear" d={curve(CANS[0].m)} />
        </svg>
        <span className="ln-eq-db" aria-hidden="true">
          <i>+6</i>
          <i>0 dB</i>
          <i>−6</i>
        </span>
        <span className="ln-eq-hz" aria-hidden="true">
          {HZ.map((h, i) => (
            <i key={h} style={{ left: `${(GX(i) / 400) * 100}%` }}>
              {h}
            </i>
          ))}
        </span>
      </div>
      <div className="ln-eq-foot">
        <button type="button" role="switch" aria-checked={on} className="ln-switch" onClick={() => setOn((v) => !v)}>
          <i aria-hidden="true" />
          AutoEQ
        </button>
        <span className="ln-eq-key">
          <i className="k-meas" />
          Measured <i className="k-fix" />
          Correction <i className="k-hear" />
          What you hear
        </span>
        <output className="ln-eq-pre">{on ? `Preamp −${pre.toFixed(1)} dB, so nothing clips` : "Off: the headphones as they are"}</output>
      </div>
      <p className="ln-fine">Illustrative curves. In the app you search the AutoEq database for your model.</p>
    </div>
  );
}

// ─── 5 · Your colours: the app's palette repaints this whole page ────────────
const TRIAL = ["#039be5", "#d81b60", "#c0ca33", "#00897b"];

export function Colours({ demo }: ToyProps) {
  const root = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState<Look>({ hex: BLAZE, black: false });
  const world = () => root.current?.closest<HTMLElement>(".w-bz") ?? null;
  const apply = (next: Look, keep: boolean, from?: Element) => {
    setLook(next);
    const w = world();
    if (w) paint(w, next);
    if (keep) saveLook(next);
    // A wash of the new colour spreads out from the swatch.
    if (from && w && !still()) {
      const r = from.getBoundingClientRect();
      const wash = document.createElement("span");
      wash.className = "ln-wash";
      wash.style.background = tones(next.hex).acc;
      w.appendChild(wash);
      const at = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
      gsap.fromTo(wash, { clipPath: `circle(0px at ${at})`, opacity: 0.32 }, { clipPath: `circle(150vmax at ${at})`, opacity: 0, duration: 1.1, ease: "power2.out", onComplete: () => wash.remove() });
    }
  };
  useEffect(() => {
    const saved = loadLook();
    const id = requestAnimationFrame(() => setLook(saved));
    const w = world();
    // A colour tried by the demo doesn't outlive the track; a chosen one stays.
    return () => {
      cancelAnimationFrame(id);
      if (w) paint(w, loadLook());
    };
  }, []);
  useScript(demo, [...TRIAL.map((hex) => [1500, () => apply({ hex, black: false }, false)] as [number, () => void]), [1500, () => apply(loadLook(), false)]]);
  // Once someone takes over, the page goes back to their own colour.
  useEffect(() => {
    if (demo) return;
    const w = world();
    if (w && w.dataset.accent !== loadLook().hex) apply(loadLook(), false);
  }, [demo]);
  const name = PALETTE.find(([, h]) => h === look.hex)?.[0] ?? "Blaze";
  return (
    <div className="ln-col" ref={root}>
      <div className="ln-col-ring" role="radiogroup" aria-label="Accent colour">
        {PALETTE.map(([n, hex], i) => (
          <button
            key={hex}
            type="button"
            role="radio"
            aria-checked={look.hex === hex}
            aria-label={n}
            title={n}
            className="ln-sw"
            style={css({ "--i": i, "--c": hex })}
            onClick={(e) => apply({ ...look, hex }, true, e.currentTarget)}
          />
        ))}
        <div className="ln-col-now" aria-hidden="true">
          <span className="ln-col-art" />
          <b>{name}</b>
          <small>{look.hex.toUpperCase()}</small>
          <span className="ln-col-bar">
            <i />
          </span>
          <span className="ln-col-play">
            <Svg d={I.play} />
          </span>
        </div>
      </div>
      <div className="ln-col-side">
        <p>Twenty seeds from the app&rsquo;s own palette. Pick one and the whole page takes it, down to the player at the bottom.</p>
        <button type="button" role="switch" aria-checked={look.black} className="ln-switch" onClick={() => apply({ ...look, black: !look.black }, true)}>
          <i aria-hidden="true" />
          Pure black
        </button>
        <button type="button" className="ln-textbtn" disabled={look.hex === BLAZE && !look.black} onClick={(e) => apply({ hex: BLAZE, black: false }, true, e.currentTarget)}>
          Back to Blaze
        </button>
      </div>
    </div>
  );
}

// ─── 6 · Blaze Together: the host lets people in, and okays their songs ──────
// The envelope types are the app's own (listentogether/ListenTogetherProtocol).
type Knock = { kind: "join" | "song"; who: string; title?: string };
const KNOCKS: Knock[] = [
  { kind: "join", who: "Asha" },
  { kind: "song", who: "Asha", title: "Phewa at Dawn" },
  { kind: "join", who: "Bikash" },
  { kind: "song", who: "Bikash", title: "Ring Road Lights" },
  { kind: "join", who: "Sita" },
  { kind: "song", who: "Sita", title: "Monsoon Static" },
  { kind: "join", who: "Kiran" },
];
type Wire = { id: number; dir: "up" | "down"; type: string };

export function Together({ demo }: ToyProps) {
  const [k, setK] = useState(0);
  const [ask, setAsk] = useState<Knock | null>(null);
  const [inRoom, setInRoom] = useState<string[]>([]);
  const [queue, setQueue] = useState<{ title: string; who: string }[]>([]);
  const [wire, setWire] = useState<Wire[]>([{ id: 0, dir: "down", type: "room_created" }]);
  const [say, setSay] = useState("Room open. Share the code and wait for a knock.");
  const seq = useRef(1);
  const send = (...m: [Wire["dir"], string][]) => setWire((w) => [...m.map(([dir, type]) => ({ id: seq.current++, dir, type })).reverse(), ...w].slice(0, 5));
  // The next knock, a moment after the last one was answered; a fresh room when everyone's in.
  useEffect(() => {
    if (ask) return;
    const id = setTimeout(
      () => {
        if (k >= KNOCKS.length) {
          setK(0);
          setInRoom([]);
          setQueue([]);
          setSay("Room closed. A new one opens.");
          return send(["up", "leave_room"], ["down", "room_created"]);
        }
        const n = KNOCKS[k];
        setAsk(n);
        if (n.kind === "join") send(["up", "join_room"], ["down", "join_request"]);
        else send(["up", "suggest_track"], ["down", "suggestion_received"]);
      },
      k >= KNOCKS.length ? 3200 : 1300,
    );
    return () => clearTimeout(id);
  }, [ask, k]);
  const answer = (yes: boolean) => {
    if (!ask) return;
    if (ask.kind === "join") {
      if (yes) {
        setInRoom((r) => [...r, ask.who]);
        setSay(`${ask.who} is in, and hears the same second you do.`);
        send(["up", "approve_join"], ["down", "user_joined"]);
      } else {
        setSay(`${ask.who} wasn't let in.`);
        send(["up", "reject_join"], ["down", "join_rejected"]);
      }
      setK((x) => x + (yes ? 1 : 2));
    } else {
      if (yes) setQueue((q) => [...q, { title: ask.title!, who: ask.who }]);
      setSay(yes ? `“${ask.title}” is up next, suggested by ${ask.who}.` : `“${ask.title}” stays off the queue.`);
      send(["up", yes ? "approve_suggestion" : "reject_suggestion"], ["down", yes ? "suggestion_approved" : "suggestion_rejected"]);
      setK((x) => x + 1);
    }
    setAsk(null);
  };
  useEffect(() => {
    if (!demo || !ask) return;
    const id = setTimeout(() => answer(true), 1500);
    return () => clearTimeout(id);
  });

  return (
    <div className="ln-tog">
      <div className="ln-tog-room">
        <span className="ln-tog-code" aria-label="Room code BLZ 7169">
          {"BLZ7169".split("").map((c, i) => (
            <b key={i}>{c}</b>
          ))}
        </span>
        <ul className="ln-tog-people" aria-label="In the room">
          <li className="is-host" style={css({ "--h": 30 })}>
            Y<small>You, hosting</small>
          </li>
          {inRoom.map((p) => (
            <li key={p} style={css({ "--h": hue(p) })}>
              {p[0]}
              <small>{p}</small>
            </li>
          ))}
        </ul>
      </div>
      <div className="ln-tog-ask" aria-live="polite">
        {ask ? (
          <div className={`ln-tog-card ln-tog-card--${ask.kind}`} key={`${k}`}>
            <span className="ln-tog-face" style={css({ "--h": hue(ask.who) })}>
              {ask.kind === "join" ? ask.who[0] : <Svg d={I.song} />}
            </span>
            <span className="ln-tog-what">
              {ask.kind === "join" ? (
                <>
                  <b>{ask.who} wants to join</b>
                  <small>Only the host lets people in</small>
                </>
              ) : (
                <>
                  <b>{ask.title}</b>
                  <small>Suggested by {ask.who}</small>
                </>
              )}
            </span>
            <span className="ln-tog-btns">
              <button type="button" className="ln-pill is-yes" onClick={() => answer(true)}>
                {ask.kind === "join" ? "Let in" : "Add"}
              </button>
              <button type="button" className="ln-pill" onClick={() => answer(false)}>
                Not now
              </button>
            </span>
          </div>
        ) : (
          <p className="ln-tog-say">{say}</p>
        )}
      </div>
      <div className="ln-tog-foot">
        <div className="ln-tog-queue">
          <small>Up next</small>
          {queue.length ? (
            <ol>
              {queue.map((s) => (
                <li key={s.title}>
                  <i style={css({ "--h": hue(s.title) })} />
                  {s.title}
                  <small>{s.who}</small>
                </li>
              ))}
            </ol>
          ) : (
            <p>Nothing yet</p>
          )}
        </div>
        <ol className="ln-tog-wire" aria-label="On the wire">
          {wire.map((m) => (
            <li key={m.id} className={`is-${m.dir}`}>
              <i aria-hidden="true">{m.dir === "up" ? "↑" : "↓"}</i>
              {m.type}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ─── 7 · Bring your playlists: import, then share as a QR code ───────────────
const SOURCES = [
  { id: "spotify", label: "Spotify", from: "open.spotify.com/playlist/…" },
  { id: "file", label: "A file", from: "road-trip.m3u or road-trip.csv" },
  { id: "link", label: "A link", from: "music.youtube.com/playlist?list=…" },
] as const;
const TRIP = ["Phewa at Dawn", "Ring Road Lights", "Monsoon Static", "Late Bus Home", "Thamel After Rain", "Prayer Flags"];
const MISS = 4; // one of them has no match, the way a real import goes

export function Import({ demo, icons }: ToyProps) {
  const [src, setSrc] = useState(0);
  const [phase, setPhase] = useState<"ready" | "run" | "done" | "qr">("ready");
  const [found, setFound] = useState(0);
  useEffect(() => {
    if (phase !== "run") return;
    if (found >= TRIP.length) return setPhase("done");
    const id = setTimeout(() => setFound((f) => f + 1), 360);
    return () => clearTimeout(id);
  }, [phase, found]);
  const start = () => {
    setFound(0);
    setPhase("run");
  };
  useScript(demo, [
    [1100, start],
    [3600, () => setPhase("qr")],
    [3200, () => (setPhase("ready"), setSrc((s) => (s + 1) % SOURCES.length))],
  ]);
  const s = SOURCES[src];
  return (
    <div className={`ln-imp is-${phase}`}>
      <div className="ln-imp-card">
        <div className="ln-imp-front" inert={phase === "qr"}>
          <div className="ln-seg" role="radiogroup" aria-label="Import from">
            {SOURCES.map((x, i) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={src === i}
                onClick={() => {
                  setSrc(i);
                  setPhase("ready");
                }}
              >
                {x.id === "spotify" && icons.spotify}
                {x.label}
              </button>
            ))}
          </div>
          <div className="ln-imp-from">
            <code>{s.from}</code>
            <button type="button" className="ln-pill is-yes" onClick={start} disabled={phase === "run"}>
              {phase === "ready" ? "Import" : "Again"}
            </button>
          </div>
          <ol className="ln-imp-rows" aria-live="polite">
            {TRIP.map((t, i) => {
              const st = i < found ? (i === MISS ? "miss" : "ok") : i === found && phase === "run" ? "look" : "wait";
              return (
                <li key={t} className={`is-${st}`}>
                  <i style={css({ "--h": hue(t) })} />
                  <span>{t}</span>
                  <small>{st === "ok" ? "Found" : st === "miss" ? "No match, skipped" : st === "look" ? "Searching…" : ""}</small>
                  {st === "ok" && <Svg d={I.check} />}
                </li>
              );
            })}
          </ol>
          <div className="ln-imp-done">
            <span>
              {icons.ytm}
              {phase === "done" ? `${TRIP.length - 1} of ${TRIP.length} matched on YouTube Music, saved as Road trip.` : "Each song is matched by title and artist."}
            </span>
            <button type="button" className="ln-pill" disabled={phase !== "done"} onClick={() => setPhase("qr")}>
              <Svg d={I.share} />
              Share
            </button>
          </div>
        </div>
        <div className="ln-imp-back" inert={phase !== "qr"}>
          <svg className="ln-qr" viewBox={`-2 -2 ${QR_SIZE + 4} ${QR_SIZE + 4}`} role="img" aria-label="QR code for Blazify's website">
            <rect x="-2" y="-2" width={QR_SIZE + 4} height={QR_SIZE + 4} rx="2" className="ln-qr-bg" />
            <path d={QR_PATH} className="ln-qr-dots" shapeRendering="crispEdges" />
          </svg>
          <p>
            <b>Road trip, as a code.</b> In the app it opens the playlist on a friend&rsquo;s phone. This one opens Blazify&rsquo;s website: try it.
          </p>
          <button type="button" className="ln-pill" onClick={() => setPhase("done")}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 8 · No strings: cut them, and nothing falls ─────────────────────────────
const TIES = ["Ads", "Tracking", "Account"];

export function NoStrings({ demo, icons }: ToyProps) {
  const root = useRef<HTMLDivElement>(null);
  const [cut, setCut] = useState<boolean[]>(() => TIES.map(() => false));
  const [google, setGoogle] = useState(false);
  const gone = useRef(new Set<number>());
  const free = cut.every(Boolean);
  const snip = (i: number) => {
    if (gone.current.has(i)) return;
    gone.current.add(i);
    setCut((c) => c.map((x, j) => x || j === i));
    const s = root.current?.querySelectorAll(".ln-ns-str")[i];
    if (!s) return;
    const [top, low, tag] = [".ln-ns-top", ".ln-ns-low", ".ln-ns-tag"].map((q) => s.querySelector(q));
    if (still()) return void gsap.set([top, low, tag], { autoAlpha: 0 });
    gsap.to(top, { scaleY: 0, duration: 0.45, ease: "back.in(1.6)" });
    [low, tag].forEach((n, j) =>
      gsap.to(n, {
        physics2D: { velocity: 160 + Math.random() * 120, angle: -70 - Math.random() * 40 + j * 20 * (i - 1), gravity: 1300 },
        rotation: (Math.random() - 0.5) * 160,
        autoAlpha: 0,
        duration: 1.3,
        ease: "power1.in",
      }),
    );
  };
  const tie = () => {
    gone.current.clear();
    setCut(TIES.map(() => false));
    gsap.set(root.current!.querySelectorAll(".ln-ns-top, .ln-ns-low, .ln-ns-tag"), { clearProps: "all" });
  };
  // Drag across a string to cut it, or just tap it.
  const slice = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && !e.buttons) return;
    const s = (document.elementFromPoint(e.clientX, e.clientY) as Element | null)?.closest<HTMLElement>(".ln-ns-str");
    if (s) snip(+s.dataset.i!);
  };
  useScript(demo, [
    [1300, () => snip(0)],
    [650, () => snip(1)],
    [650, () => snip(2)],
    [1600, () => setGoogle(true)],
    [2600, () => (tie(), setGoogle(false))],
  ]);
  return (
    <div className={`ln-ns${free ? " is-free" : ""}`} ref={root}>
      <div className="ln-ns-scene" onPointerMove={slice} onPointerDown={slice} data-cursor="Cut">
        <span className="ln-ns-bar" aria-hidden="true" />
        {TIES.map((t, i) => (
          <button key={t} type="button" className="ln-ns-str" data-i={i} style={css({ "--i": i })} aria-label={`Cut the ${t} string`} aria-pressed={cut[i]} onClick={() => snip(i)}>
            <i className="ln-ns-top" />
            <i className="ln-ns-low" />
            <span className="ln-ns-tag">{t}</span>
          </button>
        ))}
        <div className="ln-ns-phone" aria-hidden="true">
          <span className="ln-ns-screen">
            <i className="ln-ns-art" />
            <b>Blazify</b>
            <small>{free ? "Nothing attached" : "Playing"}</small>
            <span className="ln-ns-bars">
              <i />
              <i />
              <i />
              <i />
            </span>
          </span>
          {google && <span className="ln-ns-lib">{icons.google} Your library</span>}
        </div>
      </div>
      <div className="ln-ns-foot">
        <p aria-live="polite">{free ? "All three cut, and it still plays. It never needed them." : `${cut.filter(Boolean).length} of ${TIES.length} cut. Swipe across a string, or tap it.`}</p>
        <button type="button" role="switch" aria-checked={google} className="ln-switch" onClick={() => setGoogle((g) => !g)}>
          <i aria-hidden="true" />
          Sign in with Google, if you like: it only adds your YouTube Music library
        </button>
        {cut.some(Boolean) && (
          <button type="button" className="ln-textbtn" onClick={tie}>
            Tie them back
          </button>
        )}
      </div>
    </div>
  );
}
