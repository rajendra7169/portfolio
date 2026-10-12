// Jarvis's world: the HUD. It boots like the real one, the arc reactor turns at
// its centre, and on scroll the reactor tilts and comes apart into its layers,
// each one a stage of the voice pipeline. Then a live run of one command, the
// HUD's own screens, the skill registry and the confidence gate.
// The HUD's MARK theme and its own type: Rajdhani, Share Tech Mono, Inter.
import { Inter, Rajdhani, Share_Tech_Mono } from "next/font/google";
import DeviceClock from "@/components/proj/DeviceClock";
import { AppTile, Shot } from "@/components/proj/Devices";
import JvGate from "@/components/proj/sig/JvGate";
import JvPipeline from "@/components/proj/sig/JvPipeline";
import { iconOf, nextProject, shot, type Project } from "@/lib/projects";
import WorldNext from "../WorldNext";
import JarvisMotion from "./JarvisMotion";
import "./jarvis.css";

const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--jv-head", display: "swap" });
const tech = Share_Tech_Mono({ subsets: ["latin"], weight: "400", variable: "--jv-mono", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--jv-body", display: "swap" });

// The HUD's cold-start windows, in the order it opens them.
const BOOT = ["Hardware probe", "Core systems telemetry", "Process table", "Voice stack", "Meteorology", "APT system update", "Network throughput", "Memory: episodic recall"];

// Measured on the laptop (docs/JARVIS_OVERVIEW.md).
const TELEMETRY = [
  ["Wake to reply", "~200 ms"],
  ["Speech to text, cloud", "~300 ms"],
  ["Router, tier 1", "0.003 ms"],
  ["First token, Groq", "200–600 ms"],
  ["Voice, Piper", "~137 ms"],
  ["Echo cancelled", "40.5 dB"],
  ["Warm boot", "~3.5 s"],
];

// Latency for each pipeline stage, where it was measured.
const STAGE_COST = ["echo −40.5 dB", "~200 ms to answer", "~65 ms", "~300 ms cloud", "0.003 ms tier 1", "one question at a time", "137 skills · ~137 ms voice"];

// The skill registry by family (137 skills).
const FAMILIES: [string, number][] = [
  ["system", 34],
  ["files", 9],
  ["media", 9],
  ["code", 7],
  ["talk", 7],
  ["window", 7],
  ["reactor", 6],
  ["query", 5],
  ["workstation", 5],
  ["teach", 4],
  ["web", 3],
  ["camera", 3],
  ["calendar", 3],
  ["presence", 3],
  ["time", 3],
  ["terminal", 3],
  ["memory", 3],
  ["browser", 3],
  ["ui", 3],
  ["15 more", 17],
];
const SKILL_IDS = ["system.volume_down", "query.time", "media.play", "camera.look", "reactor.explode", "files.find", "code.what_changed", "window.switch", "web.news_brief", "calendar.next_up", "memory.remember", "email.read_unread", "whatsapp.reply", "screen.describe", "teach.custom", "time.remind", "reactor.iron_man_mode", "system.wifi_off", "browser.youtube", "talk.abilities"];

// What each part of the real HUD is, pinned to where it sits on the screenshot.
type Call = { x: number; y: number; side: "l" | "r"; len: number; t: string };
const CALLS: Call[][] = [
  [
    { x: 50, y: 48, side: "r", len: 15, t: "The core pulses while Jarvis talks. Talk over it and it stops." },
    { x: 68, y: 31, side: "r", len: 9, t: "The pipeline ring lights each stage as a command passes." },
    { x: 10, y: 50, side: "r", len: 9, t: "Voice stack: Whisper, wake word, turn detection, Piper." },
    { x: 84, y: 21, side: "l", len: 11, t: "System load, and which model providers are up." },
    { x: 84, y: 76, side: "l", len: 11, t: "Every decision on the event bus, timestamped." },
  ],
  [
    { x: 50, y: 48, side: "r", len: 15, t: "Idle, listening for the wake word, on the laptop itself." },
    { x: 67, y: 31, side: "r", len: 9, t: "Wake lights first when it hears “hey Jarvis”." },
    { x: 84, y: 8, side: "l", len: 11, t: "The weather in Kathmandu." },
    { x: 9, y: 9, side: "r", len: 9, t: "The clock, and how long the daemon has been up." },
  ],
  [
    { x: 50, y: 50, side: "r", len: 15, t: "The original ION theme: the same HUD, in cyan." },
    { x: 79, y: 40, side: "l", len: 12, t: "The answer floats in over the core." },
    { x: 93, y: 78, side: "l", len: 12, t: "The router's decisions scroll by on the event bus." },
  ],
];

const PRINCIPLES = [
  ["Local first", "The wake word, voice activity, turn taking, speaker check, transcription and voice all run on the laptop. The cloud is for language models."],
  ["Honest when it cannot", "Ask for something it can't do yet and it says so, then puts it on the wish list."],
  ["Confirmation before irreversible", "Anything that can't be undone waits for a spoken yes. Silence is never consent."],
];

export default function Jarvis({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  const screens = p.desktop?.screens ?? [];
  const rings = p.flow.steps;

  return (
    <JarvisMotion className={`w-jv ${rajdhani.variable} ${tech.variable} ${inter.variable}`}>
      {/* The HUD frame around the screen */}
      <div className="jv-frame" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <span className="jv-frame-tl">JARVIS · ONLINE</span>
        <span className="jv-frame-tr">
          LOCAL TIME <DeviceClock />
        </span>
        <span className="jv-frame-bl">
          STATE <b className="jv-frame-state">LISTENING</b>
        </span>
        <span className="jv-frame-br">GROQ · CLAUDE · GEMINI</span>
      </div>

      {/* ── Boot ─────────────────────────────────────────────────────────── */}
      <section className="jv-hero">
        <ol className="jv-boot" aria-label="Boot sequence">
          {BOOT.map((b) => (
            <li key={b} className="jv-boot-line">
              <span>{b}</span>
              <i aria-hidden="true">
                <b />
              </i>
              <em>OK</em>
            </li>
          ))}
        </ol>

        <div className="jv-core-wrap">
          <button type="button" className="jv-reactor" aria-label="Wake Jarvis" data-cursor="Wake">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`jv-arc jv-arc-${i}`} aria-hidden="true">
                <span className="jv-arc-spin" />
              </span>
            ))}
            <span className="jv-heart" aria-hidden="true" />
            <span className="jv-voice" aria-live="polite" />
          </button>
          <h1 className="jv-word">
            <span className="sr-only">{p.name}</span>
            <span aria-hidden="true">JARVIS</span>
          </h1>
          <p className="jv-tag">{p.tagline}</p>
        </div>

        <dl className="jv-tele" aria-label="Measured on the laptop">
          {TELEMETRY.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="jv-intro">
        <p className="jv-lede">{p.summary}</p>
        <p className="jv-private">{p.note}</p>
      </section>

      {/* ── The reactor comes apart into the pipeline ───────────────────── */}
      <section className="jv-explode" aria-labelledby="jv-explode">
        <header className="jv-head">
          <h2 className="jv-h2" id="jv-explode">
            Reactor, explode
          </h2>
          <p className="jv-sub">{p.flow.intro} Each ring of the core is one stage between your voice and its answer.</p>
        </header>
        <div className="jv-stack-wrap">
          <div className="jv-stack" aria-hidden="true">
            {rings.map((s, i) => (
              <div key={s.label} className="jv-layer" style={{ "--i": i, "--n": rings.length } as React.CSSProperties}>
                <span className="jv-layer-ring">
                  <span className="jv-layer-spin" />
                </span>
              </div>
            ))}
          </div>
          <ol className="jv-legend">
            {rings.map((s, i) => (
              <li key={s.label}>
                <b>{s.label}</b>
                <em>{STAGE_COST[i]}</em>
                <span>{s.sub}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── One command, live ───────────────────────────────────────────── */}
      <section className="jv-run" aria-labelledby="jv-run">
        <header className="jv-head">
          <h2 className="jv-h2" id="jv-run">
            Say “hey Jarvis”
          </h2>
          <p className="jv-sub">A real two-part command, through the HUD&rsquo;s pipeline ring, with the time each stage measured.</p>
        </header>
        <JvPipeline />
      </section>

      {/* ── The HUD itself: the main screen up close, then the whole wall ── */}
      <section className="jv-screens" aria-labelledby="jv-screens">
        <header className="jv-head">
          <h2 className="jv-h2" id="jv-screens">
            The HUD, for real
          </h2>
          <p className="jv-sub">Screenshots from the laptop, with what each part does. Scroll to switch it from speaking to listening to the old ION theme, then step back to the whole wall.</p>
        </header>
        <div className="jv-wall">
          <div className="jv-wall-stage">
            <figure className="jv-mon jv-mon--side jv-mon--left">
              <Shot m={shot("jarvis/desk-idle")} alt="The Jarvis HUD on the left monitor, listening" />
            </figure>
            <figure className="jv-mon jv-mon--main">
              {screens.map((s, i) => (
                <Shot key={s.img} m={shot(s.img)} alt={`Jarvis HUD: ${s.title}`} className={`jv-mshot${i === 0 ? " is-on" : ""}`} eager={i === 0} />
              ))}
              <div className="jv-calls" aria-hidden="true">
                {CALLS.map((list, si) =>
                  list.map((c, ci) => (
                    <span
                      key={`${si}-${ci}`}
                      className={`jv-call jv-call--${c.side}`}
                      data-screen={si}
                      style={{ "--x": `${c.x}%`, "--y": `${c.y}%`, "--len": c.len } as React.CSSProperties}
                    >
                      <i />
                      <b>{ci + 1}</b>
                      <span>{c.t}</span>
                    </span>
                  )),
                )}
              </div>
            </figure>
            <figure className="jv-mon jv-mon--side jv-mon--portrait">
              <Shot m={shot("jarvis/portrait")} alt="The Jarvis HUD on the portrait monitor" />
            </figure>
          </div>
          <ol className="jv-wall-steps">
            {screens.map((s, i) => (
              <li key={s.img} className={i === 0 ? "is-on" : undefined}>
                <b>{s.title}.</b> {s.note}
              </li>
            ))}
            <li>
              <b>The wall.</b> A HUD on every screen: two landscape monitors and a portrait one, each with its own panes.
            </li>
          </ol>
          <p className="jv-readout" aria-hidden="true" />
        </div>
      </section>

      {/* ── Skill registry ──────────────────────────────────────────────── */}
      <section className="jv-skills" aria-labelledby="jv-skills">
        <header className="jv-head">
          <h2 className="jv-h2" id="jv-skills">
            Skill registry
          </h2>
          <p className="jv-sub">137 skills in code today, from volume and Wi-Fi to reading the screen and replying on WhatsApp. Ask for one it doesn&rsquo;t have and it goes on the wish list.</p>
        </header>
        <div className="jv-skills-grid">
          <ul className="jv-fams">
            {FAMILIES.map(([f, n]) => (
              <li key={f} style={{ "--n": n } as React.CSSProperties}>
                <span>{f}</span>
                <i aria-hidden="true">
                  <b />
                </i>
                <em>{n}</em>
              </li>
            ))}
          </ul>
          <div className="jv-bus" aria-hidden="true">
            <p className="jv-bus-head">EVENT BUS</p>
            <ul className="jv-bus-list">
              {[...SKILL_IDS, ...SKILL_IDS].map((id, i) => (
                <li key={i}>
                  <span>{String(10 + (i % 50)).padStart(2, "0")}:{String((i * 7) % 60).padStart(2, "0")}</span> <code>{id}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── The gate ────────────────────────────────────────────────────── */}
      <section className="jv-gate-world" aria-labelledby="jv-gate">
        <header className="jv-head">
          <h2 className="jv-h2" id="jv-gate">
            Sure, or it asks
          </h2>
          <p className="jv-sub">Every skill has a risk level and every guess a confidence. Pick a command, slide the confidence, and see what Jarvis would do.</p>
        </header>
        <JvGate />
      </section>

      {/* ── Principles ──────────────────────────────────────────────────── */}
      <section className="jv-laws" aria-label="Principles">
        {PRINCIPLES.map(([t, d]) => (
          <div key={t} className="jv-law">
            <b>{t}</b>
            <p>{d}</p>
          </div>
        ))}
      </section>

      <section className="jv-next">
        <p className="jv-sub">Next app on the bus</p>
        <WorldNext href={`/projects/${next.slug}`} color={next.world.bg} icon={iconOf(next)?.src} className="jv-next-link">
          <AppTile p={next} className="jv-next-tile" />
          <b>{next.name}</b>
          <span>{next.tagline}</span>
        </WorldNext>
      </section>
    </JarvisMotion>
  );
}
