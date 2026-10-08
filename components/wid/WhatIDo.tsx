// "What I Do?" as Capability OS: four modules, each a live mini-app in an OS window.
// Desktop: one pinned stage, scroll switches modules. Phones / reduced motion: stacked.
import Icon from "@/components/Icon";
import { Chars } from "@/components/Motion";
import { skills } from "@/lib/content";
import WhatIDoMotion from "./WhatIDoMotion";
import { CloudScene, DesignScene, EditorScene, VideoScene } from "./Scenes";

const SCENES = [EditorScene, CloudScene, DesignScene, VideoScene];
// Glow behind each module's window, all from the site palette.
const GLOWS = ["#a6dff7", "#b9cdf5", "#cfeefc", "#ffd9c7"];

export default function WhatIDo() {
  return (
    <WhatIDoMotion>
      <span className="wd-bignum" aria-hidden="true">
        01
      </span>

      <header className="wd-head">
        <div>
          <p className="wd-eyebrow">✦ Capability OS · 4 modules</p>
          <h2 className="wd-h2" id="what-i-do">
            <Chars text="What I Do?" />
          </h2>
        </div>
        <nav className="wd-rail" aria-label="Disciplines">
          <ol>
            {skills.map((s, i) => (
              <li key={s.short}>
                <button type="button" className="wd-rail-btn" data-i={i}>
                  <span className="wd-rail-no">{String(i + 1).padStart(2, "0")}</span>
                  {s.short}
                </button>
              </li>
            ))}
          </ol>
          <span className="wd-rail-track" aria-hidden="true">
            <span className="wd-rail-fill" />
          </span>
        </nav>
      </header>

      <div className="wd-items">
        {skills.map((s, i) => {
          const Scene = SCENES[i];
          return (
            <article className="wd-item" key={s.title} style={{ "--glow": GLOWS[i] } as React.CSSProperties}>
              <div className="wd-panel">
                <p className="wd-kicker wd-fade">
                  <span className="wd-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="wd-of">/ 04</span>
                  <span className="wd-mod">module</span>
                </p>
                <h3 className="wd-name">
                  <Chars text={s.title} />
                </h3>
                <p className="wd-tag wd-fade">{s.tagline}</p>
                <ul className="wd-icons" aria-label={`${s.short} tools`}>
                  {s.techs.map((t) => (
                    <li className="wd-ic" key={t.name} tabIndex={0}>
                      <Icon icon={t.icon} color={t.color} />
                      <span className="tech-tip" role="tooltip">
                        {t.name}
                      </span>
                      <span className="sr-only">{t.name}</span>
                    </li>
                  ))}
                </ul>
                <ul className="points wd-points">
                  {s.points.map((p) => (
                    <li className="wd-fade" key={p}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="wd-win-wrap">
                <div className="wd-win">
                  <div className="wd-bar">
                    <span className="wd-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="wd-bar-title">{s.app}</span>
                    <span className="wd-bar-live" aria-hidden="true">
                      <i /> live
                    </span>
                  </div>
                  <div className="wd-body">
                    <Scene />
                  </div>
                  <span className="wd-scan" aria-hidden="true" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </WhatIDoMotion>
  );
}
