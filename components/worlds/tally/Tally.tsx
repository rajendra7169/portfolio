// Tally's world: the living forest. The sky is Kathmandu's, right now, by the
// app's own dawn, day, dusk and night maths, and you can drag it through the
// day. The ground and the falling leaves follow the real season. Check in and
// a sapling goes into the ground; check out and it grows. Then a month at the
// office grows tree by tree, with the app's health score and weather.
import { Bricolage_Grotesque, Inter } from "next/font/google";
import type { CSSProperties } from "react";
import { AppTile, DesktopShell, Laptop, OsWindow, Phone, Shot } from "@/components/proj/Devices";
import { iconOf, nextProject, shot, type Project } from "@/lib/projects";
import WorldNext from "../WorldNext";
import { healthLabel, healthOf, seeded, weatherOf, type Kind, type Shape } from "./forest";
import TallyMotion from "./TallyMotion";
import { Range, Sapling, Tree, TreeArt } from "./Trees";
import "./tally.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--tl-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--tl-body", display: "swap" });

const SHAPES: Shape[] = ["round", "pine", "willow"];

// The grove behind the hero: three rows, back to front, with room at the
// front for the trees you plant.
const rnd = seeded(29);
const GROVE = [
  { y: 150, s: 1.15, n: 12 },
  { y: 182, s: 1.6, n: 10 },
  { y: 226, s: 2.15, n: 7 },
].flatMap((row, r) =>
  Array.from({ length: row.n }, (_, i) => {
    const x = ((i + 0.5) / row.n) * 1440 + (rnd() - 0.5) * (1440 / row.n) * 0.7;
    const k = rnd();
    const kind: Kind = k > 0.93 ? "absent" : k > 0.84 ? "overtime" : k > 0.74 ? "late" : "normal";
    return { x, y: row.y + (rnd() - 0.5) * 10, s: row.s * (0.85 + rnd() * 0.3), kind, shape: SHAPES[Math.floor(rnd() * 3)], r };
  }),
).filter((t) => !(t.r === 2 && t.x > 760 && t.x < 1300));
const SLOTS = [820, 905, 990, 1075, 1160, 1245];

// Four weeks at the office. Saturday is the day off, as it is in Nepal.
const MONTH: Kind[] = [
  ...["normal", "normal", "late", "normal", "overtime", "normal", "off"],
  ...["normal", "normal", "normal", "late", "normal", "early", "off"],
  ...["normal", "absent", "absent", "normal", "late", "normal", "off"],
  ...["normal", "normal", "overtime", "normal", "normal", "normal", "off"],
] as Kind[];
const WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const KEY: [Kind, string][] = [
  ["normal", "On time"],
  ["late", "Late"],
  ["overtime", "Overtime"],
  ["early", "Left early"],
  ["absent", "Absent"],
];
// Which phone screen goes with each laptop screen in the tour.
const PAIR = [0, 1, 1, 2, 3, 4, 5, 6];

const LABEL: Record<Kind, string> = { normal: "On time", late: "Late", overtime: "Overtime", early: "Left early", absent: "Absent", off: "Day off" };

export default function Tally({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  const desk = p.desktop!.screens;
  const phones = p.phone!;
  const score = healthOf(MONTH);

  return (
    <TallyMotion className={`w-tl ${display.variable} ${inter.variable}`} month={MONTH} slots={SLOTS.length}>
      {/* ── The sky, the range, the grove ───────────────────────────────── */}
      <section className="tl-hero">
        <div className="tl-scene" aria-hidden="true">
          <i className="tl-stars" />
          <i className="tl-sun" />
          <i className="tl-moon" />
          <div className="tl-clouds">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className={`tl-cloud tl-cloud-${i}`} />
            ))}
          </div>
          <svg className="tl-range" viewBox="0 0 1440 300" preserveAspectRatio="none">
            <Range seed={7} w={1440} h={300} peaks={9} rise={250} className="tl-range-far" />
            <Range seed={19} w={1440} h={300} peaks={13} rise={150} className="tl-range-near" />
          </svg>
          <svg className="tl-grove" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice">
            <path className="tl-ground" d="M0,140 C240,118 420,150 720,132 C1000,116 1220,146 1440,128 L1440,260 L0,260 Z" />
            {GROVE.map((t, i) => (
              <Tree key={i} x={t.x} y={t.y} s={t.s} kind={t.kind} shape={t.shape} className="tl-grove-tree" />
            ))}
            {SLOTS.map((x, i) => (
              <g key={i} transform={`translate(${x} ${228 + (i % 2) * 14}) scale(2.3)`}>
                <g className="tl-plant tl-plant-sapling" data-slot={i}>
                  <Sapling />
                </g>
                <g className="tl-plant tl-plant-tree" data-slot={i}>
                  <TreeArt kind={i === 2 ? "overtime" : "normal"} shape={SHAPES[i % 3]} />
                </g>
              </g>
            ))}
          </svg>
          <div className="tl-fall">
            {Array.from({ length: 16 }, (_, i) => (
              <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--d": `${7 + (i % 5) * 1.6}s`, "--w": `${-(i * 1.3)}s` } as CSSProperties} />
            ))}
          </div>
        </div>

        <div className="tl-copy">
          <p className="tl-kind">{p.kind}</p>
          <h1 className="tl-title">
            <span className="tl-name">{p.name}</span>
          </h1>
          <p className="tl-tag">{p.tagline}</p>
          <p className="tl-lede">{p.summary}</p>
          <div className="tl-links">
            {p.links.map((l) => (
              <a key={l.href} href={l.href} className={`tl-link${l.primary ? " is-primary" : ""}`} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="tl-card">
          <div className="tl-card-top">
            <AppTile p={p} className="tl-card-icon" />
            <b>Tally</b>
            <span>Kathmandu office</span>
          </div>
          <p className="tl-greet">Good day</p>
          <p className="tl-clock">--:--</p>
          <button type="button" className="tl-check" data-cursor="Tap">
            Check in
          </button>
          <p className="tl-geo">
            <i aria-hidden="true" />
            Inside the office radius
          </p>
          <p className="tl-log" aria-live="polite">
            Check in to plant today&rsquo;s tree.
          </p>
        </div>

        <div className="tl-dial">
          <label htmlFor="tl-time">
            <span>The sky over Kathmandu</span>
            <output className="tl-dial-time">--:--</output>
            <span className="tl-dial-phase" />
          </label>
          <input id="tl-time" className="tl-range-input" type="range" min={0} max={1439} step={1} defaultValue={720} aria-label="Time of day in Kathmandu" />
          <button type="button" className="tl-now">
            Now
          </button>
        </div>
      </section>

      {/* ── A month, tree by tree ───────────────────────────────────────── */}
      <section className="tl-month" aria-labelledby="tl-month">
        <header className="tl-head">
          <h2 className="tl-h2" id="tl-month">
            A month, in trees
          </h2>
          <p className="tl-sub">Four weeks at the office. Each working day grows a tree, sized and coloured by how the day went. Saturdays are off, as they are in Nepal.</p>
        </header>
        <div className="tl-month-stage">
          <ol className="tl-cal">
            {MONTH.map((k, i) => (
              <li key={i} data-kind={k} aria-label={`Day ${i + 1}: ${LABEL[k]}`}>
                <span>{WEEK[i % 7]}</span>
                <b>{i + 1}</b>
              </li>
            ))}
          </ol>
          <div className="tl-month-scene">
            <div className="tl-clouds tl-month-clouds" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={`tl-cloud tl-cloud-${i}`} />
              ))}
            </div>
            <i className="tl-rain" aria-hidden="true" />
            <svg className="tl-month-forest" viewBox="0 0 1200 250" aria-hidden="true">
              <path className="tl-ground" d="M0,120 C200,104 420,132 600,116 C820,98 1000,128 1200,112 L1200,250 L0,250 Z" />
              {MONTH.map((k, i) =>
                k === "off" ? (
                  <g key={i} transform={`translate(${30 + i * (1140 / 27)} ${i % 2 ? 214 : 176})`}>
                    <g className="tl-tree" data-day={i}>
                      <path d="M-4,0 Q-5,-7 -7,-10 M0,0 Q0,-8 1,-12 M4,0 Q5,-6 7,-9" stroke="#15803d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </g>
                  </g>
                ) : (
                  <Tree key={i} x={30 + i * (1140 / 27)} y={i % 2 ? 214 : 176} s={(i % 2 ? 2.25 : 1.85) * (k === "early" ? 0.78 : 1)} kind={k} shape={SHAPES[i % 3]} data={i} />
                ),
              )}
            </svg>
          </div>
          <dl className="tl-health">
            <div>
              <dt>Forest health</dt>
              <dd>
                <b className="tl-score">{score}</b>%
              </dd>
              <dd className="tl-label">{healthLabel(score)}</dd>
            </div>
            <div>
              <dt>Weather</dt>
              <dd className="tl-weather">{weatherOf(MONTH)}</dd>
              <dd className="tl-why">from the last seven working days</dd>
            </div>
            <div>
              <dt>Trees grown</dt>
              <dd>
                <b className="tl-count">{MONTH.filter((k) => k !== "off" && k !== "absent").length}</b>
              </dd>
              <dd className="tl-why">one stump for each day missed</dd>
            </div>
          </dl>
          <ul className="tl-key">
            {KEY.map(([k, l]) => (
              <li key={k}>
                <svg viewBox="-16 -46 32 50" aria-hidden="true">
                  <TreeArt kind={k} shape="round" />
                </svg>
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Inside the app: laptop and phone, screen by screen ───────────── */}
      <section className="tl-real" aria-labelledby="tl-real">
        <header className="tl-head">
          <h2 className="tl-h2" id="tl-real">
            Inside the app
          </h2>
          <p className="tl-sub">Real screens from a demo workspace, Himal Studio in Kathmandu: eight people and six weeks of attendance, on the web app and at phone size.</p>
        </header>
        <div className="tl-tour">
          <figure className="tl-dev tl-dev-laptop">
            <Laptop os="windows">
              <DesktopShell pinned={[p]}>
                <OsWindow p={p} title={p.name}>
                  {desk.map((s, i) => (
                    <Shot key={s.img} m={shot(s.img)} alt={`Tally on the web: ${s.title.toLowerCase()}`} className={`tl-tshot tl-tshot-d${i === 0 ? " is-on" : ""}`} eager={i === 0} />
                  ))}
                </OsWindow>
              </DesktopShell>
            </Laptop>
          </figure>
          <figure className="tl-dev tl-dev-phone">
            <Phone model="android" top={shot(phones[0].img).top}>
              {phones.map((s, i) => (
                <Shot key={s.img} m={shot(s.img)} alt={`Tally at phone size: ${s.title.toLowerCase()}`} className={`tl-tshot tl-tshot-p${i === 0 ? " is-on" : ""}`} eager={i === 0} />
              ))}
            </Phone>
          </figure>
          <ol className="tl-tour-caps">
            {desk.map((s, i) => (
              <li key={s.img} className={i === 0 ? "is-on" : undefined} data-phone={PAIR[i] ?? 0}>
                <b>{s.title}.</b> {s.note}
              </li>
            ))}
          </ol>
          <span className="tl-tour-dots" aria-hidden="true">
            {desk.map((s, i) => (
              <i key={s.img} className={i === 0 ? "is-on" : undefined} />
            ))}
          </span>
        </div>
      </section>

      {/* ── The roots: how a check-in becomes a tree ────────────────────── */}
      <section className="tl-roots" aria-labelledby="tl-roots">
        <header className="tl-head">
          <h2 className="tl-h2" id="tl-roots">
            {p.flow.title}
          </h2>
          <p className="tl-sub">{p.flow.intro} Under every tree, the same four roots.</p>
        </header>
        <div className="tl-roots-stage">
          <svg className="tl-roots-svg" viewBox="0 0 1000 470" aria-hidden="true">
            <defs>
              <radialGradient id="tl-soil" cx="50%" cy="0%" r="75%">
                <stop offset="0" className="tl-soil-a" />
                <stop offset="1" className="tl-soil-b" />
              </radialGradient>
            </defs>
            <path d="M0,118 C260,104 740,132 1000,112 L1000,470 L0,470 Z" fill="url(#tl-soil)" />
            <path className="tl-ground" d="M0,118 C260,104 740,132 1000,112 L1000,124 C740,144 260,116 0,130 Z" />
            <path className="tl-root" d="M500,122 C480,190 300,190 150,300" />
            <path className="tl-root" d="M500,122 C500,220 420,280 383,400" />
            <path className="tl-root" d="M500,122 C510,220 580,280 617,400" />
            <path className="tl-root" d="M500,122 C520,190 700,190 850,300" />
            <path className="tl-root tl-root-thin" d="M380,188 C340,210 300,206 262,236" />
            <path className="tl-root tl-root-thin" d="M640,196 C690,212 720,226 742,252" />
            <Tree x={500} y={122} s={4.4} kind="overtime" shape="round" className="tl-roots-tree" />
          </svg>
          <ol className="tl-nodes">
            {p.flow.steps.map((s, i) => (
              <li key={s.label} style={{ "--n": i } as CSSProperties}>
                <b>{s.label}</b>
                <span>{s.sub}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── What grows here ─────────────────────────────────────────────── */}
      <section className="tl-feats" aria-labelledby="tl-feats">
        <header className="tl-head">
          <h2 className="tl-h2" id="tl-feats">
            What grows here
          </h2>
        </header>
        <ul className="tl-feat-list">
          {p.features.map((f, i) => (
            <li key={f.title}>
              <svg viewBox="-18 -48 36 52" aria-hidden="true">
                <TreeArt kind={(["normal", "overtime", "late", "normal", "early", "normal"] as Kind[])[i]} shape={SHAPES[i % 3]} />
              </svg>
              <b>{f.title}</b>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="tl-next">
        <p className="tl-sub">Next app in the workspace</p>
        <WorldNext href={`/projects/${next.slug}`} color={next.world.bg} icon={iconOf(next)?.src} className="tl-next-link">
          <AppTile p={next} className="tl-next-tile" />
          <b>{next.name}</b>
          <span>{next.tagline}</span>
        </WorldNext>
      </section>
    </TallyMotion>
  );
}
