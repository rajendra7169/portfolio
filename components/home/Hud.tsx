// Fixed chrome for the home page: the name tag the hero hands off to, the
// chapter rail with the orange "you are here" dot, Play (autoplay) and 0g.
import { profile } from "@/lib/content";
import HudMotion from "./HudMotion";
import { CHAPTERS } from "./chapters";

export default function Hud() {
  return (
    <HudMotion>
      <button type="button" className="dn-tag" aria-label={`${profile.name}. Back to the top`}>
        <b>{profile.name}</b>
        <span className="dn-slate">01 / 07 · {CHAPTERS[0].label}</span>
      </button>
      <div className="dn-bar" aria-hidden="true">
        <b>{profile.name}</b>
        <span className="dn-slate-m">01 / 07 · {CHAPTERS[0].label}</span>
      </div>

      <nav className="dn-rail" aria-label="Chapters">
        <svg className="dn-rail-svg" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true">
          <line className="dn-track" x1="1" y1="0" x2="1" y2="100" />
          <line className="dn-line" x1="1" y1="0" x2="1" y2="100" />
        </svg>
        <ol className="dn-ticks">
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button type="button" className="dn-tick" data-i={i} aria-label={`Chapter ${i + 1}: ${c.label}`}>
                <span className="dn-tick-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="dn-tick-label">{c.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="dn-here" aria-hidden="true" />
      </nav>

      <div className="dn-tools">
        <button type="button" className="dn-zero" aria-pressed="false" aria-label="Zero gravity: let the dust drift">
          0g
        </button>
        <button type="button" className="dn-play" aria-label="Play the page">
          <span className="dn-play-icon" aria-hidden="true">▶</span>
        </button>
      </div>
    </HudMotion>
  );
}
