// Home §4.3 — Blazify. Server-rendered: every word is in the HTML before any
// script runs. BlazifyMotion drives the dust (phone → window), the synced
// lyric, the knob, the ♪ burst and the chip hover.
import { hero, projects } from "@/lib/content";
import BlazifyMotion from "./BlazifyMotion";
import StillShape from "./dust/StillShape";

const NOTES = 24; // the last 12 are display: none under 900px
const PILLS = "No ads · No tracking · No account".split(" · ");
const CHIPS = [
  { label: "Android", sub: "phone", project: projects[0] },
  { label: "iPhone", sub: "phone", project: projects[1] },
  { label: "Desktop", sub: "window", project: projects[2] },
] as const;

/** Sub-state copy: the mono line and the description as a synced lyric. */
function State({ sub, line, description }: { sub: "a" | "b"; line: string; description: string }) {
  const words = description.split(" ");
  return (
    <div className={`db-state db-state--${sub} ${sub === "a" ? "db-block--phone" : "db-block--window"}`} data-sub={sub === "a" ? "phone" : "window"}>
      <p className={`db-sub db-sub--${sub} dm-mono`}>{line}</p>
      <p className={`db-desc db-desc--${sub} db-lyric db-lyric--${sub}`}>
        {words.map((w, k) => (
          <span key={k}>
            <span className="db-word">{w}</span>
            {k < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      <div className="db-track" data-lenis-prevent>
        <button
          type="button"
          className="db-knob"
          role="slider"
          aria-label="Scrub the lyric"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          data-cursor="drag"
          disabled
        >
          <span className="db-knob-in" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function Blazify() {
  const stat = hero.stats[2];
  return (
    <BlazifyMotion>
      <div className="db-copy dm-copy">
        <h2 className="db-h2 dm-h2" id="blazify">
          <span className="db-h2-text">Blazify</span>
        </h2>

        <div className="db-states">
          <State sub="a" line="for Android & iPhone" description={projects[0].description} />
          <State sub="b" line="for Linux & Windows" description={projects[2].description} />
        </div>

        <ul className="db-pills" aria-label="Blazify is">
          {PILLS.map((p) => (
            <li key={p} className="db-pill">
              {p}
            </li>
          ))}
        </ul>

        <div className="db-chips" role="group" aria-label="Blazify platforms">
          {CHIPS.map((c) => (
            <button key={c.label} type="button" className="db-chip" data-sub={c.sub} title={c.project.name} aria-current={c.sub === "phone" ? "true" : undefined}>
              {c.label}
            </button>
          ))}
        </div>

        <p className="db-stat dm-mono">
          {stat.value}
          {stat.suffix} {stat.label}
        </p>

        <div className="db-links">
          <span className="db-play-wrap">
            <button type="button" className="btn db-play" aria-pressed="false">
              <span className="db-play-icon" aria-hidden="true">
                ▶
              </span>{" "}
              Play
            </button>
            <span className="db-notes" aria-hidden="true">
              {Array.from({ length: NOTES }, (_, i) => (
                <i key={i} className="db-note">
                  ♪
                </i>
              ))}
            </span>
          </span>
          <a className="btn btn--ghost" href={projects[0].live} target="_blank" rel="noreferrer">
            Get Blazify <span className="btn-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="btn btn--soft db-source" href={projects[0].url} target="_blank" rel="noreferrer">
            Source
          </a>
        </div>
      </div>

      {/* Reduced motion only: an in-flow still of the phone (renders nothing when the engine runs). */}
      <StillShape shape="phone" label="Blazify on a phone, drawn in particles: a frame around a ten-bar equalizer." />
    </BlazifyMotion>
  );
}
