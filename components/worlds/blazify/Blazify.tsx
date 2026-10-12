// Blazify's world: the page is a record. Side A is the Android app, Side B the
// iPhone and desktop apps, then the mixing desk, the sleeves, a listening room
// and the liner notes. The scroll is the song: the mini player at the bottom
// shows how far through it you are, and pauses the record.
// Colours and type are Blazify's own (its website's tokens: void, cream, amber,
// ember; Anton, Instrument Serif and Outfit).
import { Anton, Instrument_Serif, Noto_Serif_Devanagari, Outfit } from "next/font/google";
import Icon from "@/components/Icon";
import { AppTile, DesktopShell, Laptop, OsWindow, Phone, Shot } from "@/components/proj/Devices";
import BzEqualizer from "@/components/proj/sig/BzEqualizer";
import { hasShot, iconOf, nextProject, PLATFORMS, shot, type Project } from "@/lib/projects";
import WorldNext from "../WorldNext";
import BlazifyMotion from "./BlazifyMotion";
import LinerNotes from "./notes/LinerNotes";
import Room from "./Room";
import "./blazify.css";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--bz-display", display: "swap" });
const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--bz-serif", display: "swap" });
const body = Outfit({ subsets: ["latin"], variable: "--bz-body", display: "swap" });
// Only the synced-lyrics track sets Nepali, so it isn't preloaded.
const deva = Noto_Serif_Devanagari({ weight: ["400", "600"], subsets: ["devanagari"], variable: "--bz-deva", display: "swap", preload: false });

// The tagline, sung word by word the way Blazify shows synced lyrics.
const TAGLINE = ["Stream", "it.", "Feel", "it.", "Blaze", "it."];

// The six player designs (ui/player/PlayerDesign.kt), in the app's order.
// Each one shows once its screen is in assets/projects/blazify/phone-player-<id>.png.
const DESIGNS = [
  { id: "classic", name: "Classic", text: "The artwork up top and the controls under it, the way most players do it." },
  { id: "ring", name: "Ring", text: "The artwork sits inside a ring that fills as the song plays." },
  { id: "full_art", name: "Full Art", text: "The cover takes the whole screen and the controls float over it." },
  { id: "record", name: "Record", text: "A vinyl that spins under a tonearm while the song plays." },
  { id: "cassette", name: "Cassette", text: "A tape deck: the reels turn and the waveform runs along the tape." },
  { id: "video", name: "Video", text: "When the song has a music video, it plays behind the controls instead of the artwork." },
];
const PLAYERS = DESIGNS.filter((d) => hasShot(`blazify/phone-player-${d.id}`));

export default function Blazify({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  const label = shot("blazify/logo-white");
  const android = p.phone ?? [];
  const iphone = p.iphone ?? [];
  const desk = p.desktop?.screens ?? [];

  return (
    <BlazifyMotion className={`w-bz ${display.variable} ${serif.variable} ${body.variable} ${deva.variable}`}>
      {/* ── The record ─────────────────────────────────────────────────── */}
      <section className="bz-hero">
        <span className="bz-hero-glow" aria-hidden="true" />
        <div className="bz-hero-copy">
          <p className="bz-np">
            <span className="bz-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            Playing on {p.platforms.map((k) => PLATFORMS[k].label).join(", ").replace(/, ([^,]*)$/, " and $1")}
          </p>
          <h1 className="bz-title">
            <span className="sr-only">{p.name}</span>
            <span className="bz-title-word" aria-hidden="true">
              {"BLAZIFY".split("").map((c, i) => (
                <span className="bz-letter" key={i}>
                  {c}
                </span>
              ))}
            </span>
          </h1>
          <p className="bz-sing">
            <span className="sr-only">{p.tagline}</span>
            {TAGLINE.map((w, i) => (
              <span className="bz-word" key={i} aria-hidden="true">
                {w}
              </span>
            ))}
          </p>
          <p className="bz-lede">{p.summary}</p>
          <div className="bz-links">
            {p.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={`bz-link${l.primary ? " is-primary" : ""}`} data-magnetic>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="bz-deck" aria-hidden="true">
          <div className="bz-disc" data-cursor="Scratch">
            <div className="bz-disc-spin">
              <span className="bz-label">
                {/* eslint-disable-next-line @next/next/no-img-element -- Blazify's white mark from `npm run images` */}
                <img src={label.src} width={label.w} height={label.h} alt="" draggable={false} />
                <small>Side A · 33⅓</small>
              </span>
            </div>
            <span className="bz-sheen" />
          </div>
          <div className="bz-arm">
            <div className="bz-arm-in">
              <svg viewBox="0 0 200 400" className="bz-arm-svg">
                <defs>
                  <linearGradient id="bz-rod" x1="0" x2="1">
                    <stop offset="0" stopColor="#7d766e" />
                    <stop offset="0.5" stopColor="#efe8de" />
                    <stop offset="1" stopColor="#7d766e" />
                  </linearGradient>
                </defs>
                <circle cx="150" cy="40" r="30" fill="#221d1a" stroke="#3a332e" strokeWidth="4" />
                <circle cx="150" cy="40" r="12" fill="#8b847c" />
                <path d="M150 40 L122 292 L98 346" fill="none" stroke="url(#bz-rod)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="80" y="338" width="34" height="22" rx="4" fill="#2a2420" stroke="#4a403a" strokeWidth="2" transform="rotate(24 97 349)" />
                <rect x="160" y="20" width="26" height="12" rx="3" fill="#3a332e" transform="rotate(-6 173 26)" />
              </svg>
            </div>
          </div>
          <p className="bz-deck-hint">Drag the record, or its label on a phone</p>
        </div>
      </section>

      {/* ── Side A: the Android app, as a tracklist ────────────────────── */}
      <section className="bz-side bz-side-a" aria-labelledby="bz-side-a">
        <header className="bz-side-head">
          <h2 className="bz-h2" id="bz-side-a">
            Side A
          </h2>
          <p className="bz-side-sub">
            The Android app, {android.length} screens, recorded straight off a phone. Scroll to play through them.
          </p>
        </header>
        <div className="bz-tracks-view">
          <ol className="bz-tracks">
            {android.map((s, i) => (
              <li className={`bz-track${i === 0 ? " is-on" : ""}`} key={s.img}>
                <Phone model="android" top={shot(s.img).top} className="bz-track-phone">
                  <Shot m={shot(s.img)} />
                </Phone>
                <div className="bz-track-meta">
                  <span className="bz-track-no" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <span className="bz-side-progress" aria-hidden="true">
          <i />
        </span>
      </section>

      {/* ── Side B: the iPhone and desktop apps ────────────────────────── */}
      <section className="bz-side bz-side-b" aria-labelledby="bz-side-b">
        <header className="bz-side-head">
          <h2 className="bz-h2" id="bz-side-b">
            Side B
          </h2>
          <p className="bz-side-sub">The iPhone app, written from scratch in SwiftUI, and the desktop app for Linux and Windows. Same songs, other codebases.</p>
        </header>
        <div className="bz-b-stage">
          <figure className="bz-b-dev bz-b-dev--iphone">
            <Phone model="iphone" top={shot(iphone[0].img).top} className="bz-b-iphone">
              {iphone.map((s, i) => (
                <Shot key={s.img} m={shot(s.img)} className={`bz-bshot bz-bshot-i${i === 0 ? " is-on" : ""}`} eager={i === 0} />
              ))}
            </Phone>
            <figcaption className="bz-b-caps">
              {iphone.map((s, i) => (
                <span key={s.img} className={`bz-cap bz-cap-i${i === 0 ? " is-on" : ""}`}>
                  <b>{s.title}</b>
                  {s.note}
                </span>
              ))}
            </figcaption>
          </figure>
          <figure className="bz-b-dev bz-b-dev--desk">
            <Laptop os="linux" className="bz-b-laptop">
              <DesktopShell pinned={[p]}>
                <OsWindow p={p} title={p.name}>
                  {desk.map((s, i) => (
                    <Shot key={s.img} m={shot(s.img)} className={`bz-bshot bz-bshot-d${i === 0 ? " is-on" : ""}`} eager={i === 0} />
                  ))}
                </OsWindow>
              </DesktopShell>
            </Laptop>
            <figcaption className="bz-b-caps">
              {desk.map((s, i) => (
                <span key={s.img} className={`bz-cap bz-cap-d${i === 0 ? " is-on" : ""}`}>
                  <b>{s.title}</b>
                  {s.note}
                </span>
              ))}
            </figcaption>
            <div className="bz-os" role="radiogroup" aria-label="Show the desktop app on">
              {(["linux", "windows"] as const).map((o, i) => (
                <button key={o} type="button" role="radio" aria-checked={i === 0} data-os={o} className="bz-os-btn">
                  <Icon icon={PLATFORMS[o].icon} /> {PLATFORMS[o].label}
                </button>
              ))}
            </div>
          </figure>
        </div>
      </section>

      {/* ── The mixing desk ────────────────────────────────────────────── */}
      <section className="bz-mix">
        <div className="bz-mix-copy">
          <h2 className="bz-h2">Mixing desk</h2>
          <p className="bz-side-sub">Ten bands from 31 Hz to 16 kHz and thirteen presets, with the same values as the app. Pull a fader or pick a preset.</p>
        </div>
        <BzEqualizer />
      </section>

      {/* ── Six players: one song, six designs, picked from a crate ──────── */}
      <section className="bz-players" aria-labelledby="bz-players">
        <header className="bz-side-head">
          <h2 className="bz-h2" id="bz-players">
            Six players
          </h2>
          <p className="bz-side-sub">One song, six ways to see it, from Settings, Look and feel. Each one is repainted by the artwork that&rsquo;s playing.</p>
        </header>
        <div className="bz-players-stage">
          <figure className="bz-players-dev">
            <Phone model="android" top={shot(`blazify/phone-player-${PLAYERS[0].id}`).top} className="bz-players-phone">
              {PLAYERS.map((d, i) => (
                <Shot key={d.id} m={shot(`blazify/phone-player-${d.id}`)} alt={`Blazify's ${d.name} player`} className={`bz-pshot${i === 0 ? " is-on" : ""}`} eager={i === 0} />
              ))}
            </Phone>
          </figure>
          <div className="bz-crate-wrap">
            <div className="bz-crate" role="tablist" aria-label="Player design">
              {PLAYERS.map((d, i) => (
                <button key={d.id} type="button" role="tab" aria-selected={i === 0} className={`bz-sleeve${i === 0 ? " is-on" : ""}`} data-i={i} style={{ "--i": i } as React.CSSProperties} data-cursor="Play">
                  <span className={`bz-sleeve-art bz-art--${d.id}`} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <b>{d.name}</b>
                </button>
              ))}
            </div>
            <p className="bz-crate-cap" aria-live="polite">
              {PLAYERS.map((d, i) => (
                <span key={d.id} className={i === 0 ? "is-on" : undefined}>
                  <b>{d.name}.</b> {d.text}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ── The listening room: Blaze Together ─────────────────────────── */}
      <section className="bz-room" aria-labelledby="bz-room">
        <header className="bz-side-head">
          <h2 className="bz-h2" id="bz-room">
            Listening room
          </h2>
          <p className="bz-side-sub">
            Blaze Together: you host, a friend joins with the code. Play, pause, skip or drag the bar on your phone, and watch theirs follow.
          </p>
        </header>
        <Room hub={<Icon icon="simple-icons:go" color="#00add8" />} />
        <p className="bz-room-note">The wire carries which song and where in it, never the audio. Each phone streams the song itself.</p>
      </section>

      {/* ── Liner notes: a jukebox, each track a working piece of the app ─ */}
      <section className="bz-notes" aria-labelledby="bz-notes">
        <header className="bz-side-head">
          <h2 className="bz-h2" id="bz-notes">
            Liner notes
          </h2>
          <p className="bz-side-sub">Eight tracks on the back of the sleeve, and every one of them plays. Pick a track and have a go.</p>
        </header>
        <LinerNotes
          notes={p.features}
          icons={{
            spotify: <Icon icon="simple-icons:spotify" color="#1ed760" />,
            ytm: <Icon icon="simple-icons:youtubemusic" color="#ff0033" />,
            google: <Icon icon="logos:google-icon" />,
          }}
        />
        <dl className="bz-credits">
          <div>
            <dt>Written and produced by</dt>
            <dd>Rajendra Pandey, in Kathmandu</dd>
          </div>
          <div>
            <dt>First released</dt>
            <dd>{p.started}</dd>
          </div>
          <div>
            <dt>Recorded with</dt>
            <dd className="bz-credits-stack">
              {p.stack.flatMap((g) => g.techs).map((t) => (
                <span key={t.name} title={t.name}>
                  <Icon icon={t.icon} color={t.color} />
                  {t.name}
                </span>
              ))}
            </dd>
          </div>
          {p.credit && (
            <div>
              <dt>Samples</dt>
              <dd>{p.credit}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* ── Up next ────────────────────────────────────────────────────── */}
      <section className="bz-next">
        <p className="bz-next-label">Up next in the queue</p>
        <WorldNext href={`/projects/${next.slug}`} color={next.world.bg} icon={iconOf(next)?.src} className="bz-next-link">
          <AppTile p={next} className="bz-next-tile" />
          <span className="bz-next-text">
            <b>{next.name}</b>
            <small>{next.tagline}</small>
          </span>
          <span className="bz-next-play" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </WorldNext>
      </section>

      {/* ── The page is the song: a mini player that follows the scroll ── */}
      <div className="bz-mini" role="group" aria-label="Page player">
        {/* eslint-disable-next-line @next/next/no-img-element -- trimmed icon */}
        <img className="bz-mini-art" src={iconOf(p)!.src} alt="" />
        <span className="bz-mini-text">
          <b>Blazify</b>
          <small>Rajendra Pandey</small>
        </span>
        <button type="button" className="bz-mini-play" aria-pressed="true" aria-label="Pause the record">
          <svg viewBox="0 0 24 24" className="bz-ico-pause">
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          </svg>
          <svg viewBox="0 0 24 24" className="bz-ico-play">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="bz-mini-seek" aria-hidden="true">
          <time className="bz-mini-time">0:00</time>
          <span className="bz-mini-track">
            <i />
          </span>
          <time>3:28</time>
        </span>
      </div>
    </BlazifyMotion>
  );
}
