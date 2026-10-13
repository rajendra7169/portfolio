// Education page hero: a rotating diploma seal, a cap you can toss, and coding arenas.
// Same layering rule as the home hero: outer box = parallax, inner box = intro.
import Icon from "@/components/Icon";
import HeroField from "@/components/hero/HeroField";
import { codingProfiles, degrees } from "@/lib/content";
import EduHeroMotion from "./EduHeroMotion";

const SEAL_TEXT = "SUNWAY ✦ BSc. IT ✦ ST. LAWRENCE ✦ +2 ✦ KATHMANDU ✦ PAPER PUBLISHED 2024 ✦ ";
const CONFETTI = ["#001c55", "#2f7fc1", "#7cc8f0", "#a6dff7", "#f26b38", "#ffffff"];

export default function EduHero() {
  const stats = [
    { value: degrees.length, label: "degrees" },
    { value: codingProfiles.length, label: "coding arenas" },
  ];

  return (
    <EduHeroMotion>
      <div className="eh-bg" aria-hidden="true">
        <div className="hx-glow hx-glow--a" />
        <div className="hx-glow hx-glow--b" />
        <div className="hx-floor">
          <div className="hx-floor-grid" />
        </div>
        <HeroField />
      </div>

      <div className="eh-inner">
        <div className="eh-copy">
          <p className="hx-eyebrow eh-eyebrow">
            <span aria-hidden="true">🎓</span> Basic Qualification and Certifications
          </p>
          <h1 className="eh-title">
            <span className="sr-only">Education</span>
            <span className="eh-title-clip" aria-hidden="true">
              <span className="hx-line hx-line--a eh-title-text">Education</span>
            </span>
          </h1>
          <p className="eh-sub">Two degrees and five coding arenas: the learning behind the work.</p>

          <dl className="hx-stats eh-stats">
            {stats.map((s) => (
              <div className="hx-stat eh-stat" key={s.label}>
                <dt>{s.label}</dt>
                <dd className="eh-count" data-to={s.value}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="eh-arena-label">Coding arenas</p>
          <ul className="eh-arena">
            {codingProfiles.map((p) => (
              <li key={p.name}>
                <a className="eh-arena-link" href={p.href} target="_blank" rel="noreferrer" style={{ "--brand": p.color } as React.CSSProperties}>
                  <span className="eh-arena-icon">
                    <Icon icon={p.icon} color={p.color} />
                  </span>
                  <span className="eh-arena-text">
                    <b>{p.name}</b>
                    <small>@{p.handle}</small>
                  </span>
                  <span className="eh-arena-go" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="eh-stage">
          <div className="eh-tilt">
            {/* Ribbons first so they sit behind the seal (z-index is unreliable inside preserve-3d). */}
            <div className="eh-ribbons" aria-hidden="true">
              <span className="eh-ribbon eh-ribbon--l" />
              <span className="eh-ribbon eh-ribbon--r" />
            </div>

            <div className="eh-depth" data-depth="0.4">
              {/* Three stacked layers, so the rosette and the text ring each turn on the
                  GPU instead of the whole seal (and its shadow) repainting every frame. */}
              <div className="eh-seal" aria-hidden="true">
                <svg className="eh-seal-layer eh-seal-layer--rosette" viewBox="0 0 600 600">
                  {/* Scalloped rosette edge */}
                  <g className="eh-rosette">
                    {Array.from({ length: 40 }, (_, i) => {
                      const a = (i / 40) * Math.PI * 2;
                      return <circle key={i} cx={300 + Math.cos(a) * 270} cy={300 + Math.sin(a) * 270} r="22" className="eh-scallop" />;
                    })}
                    <circle cx="300" cy="300" r="270" className="eh-scallop" />
                  </g>
                </svg>
                <svg className="eh-seal-layer" viewBox="0 0 600 600">
                  <defs>
                    <radialGradient id="eh-disc" cx="0.38" cy="0.32" r="0.75">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset="0.35" stopColor="#d3f0fd" />
                      <stop offset="0.8" stopColor="#93d3f3" />
                      <stop offset="1" stopColor="#5fb4e6" />
                    </radialGradient>
                    <path id="eh-ring" d="M300,300 m-232,0 a232,232 0 1,1 464,0 a232,232 0 1,1 -464,0" />
                  </defs>
                  <circle cx="300" cy="300" r="262" fill="url(#eh-disc)" className="eh-disc" />
                  <circle cx="300" cy="300" r="256" className="eh-seal-edge" />
                  <circle cx="300" cy="300" r="204" className="eh-seal-inner" />
                </svg>
                <svg className="eh-seal-layer eh-seal-layer--text" viewBox="0 0 600 600">
                  <g className="eh-seal-text">
                    <text>
                      <textPath href="#eh-ring" textLength="1450" lengthAdjust="spacing">
                        {SEAL_TEXT}
                      </textPath>
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            <div className="eh-cap-depth" data-depth="0.9">
              <div className="eh-cap">
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG illustration */}
                <img src="/illustrations/education.svg" alt="" draggable={false} />
              </div>
            </div>
            <button type="button" className="eh-toss" aria-label="Toss the graduation cap" data-cursor="Toss!" />

            <div className="eh-confetti" aria-hidden="true">
              {Array.from({ length: 46 }, (_, i) => (
                <i key={i} className={i % 3 === 0 ? "is-round" : undefined} style={{ background: CONFETTI[i % CONFETTI.length] }} />
              ))}
            </div>

            <div className="eh-chip-pos eh-chip-pos--a">
              <div className="eh-chip-depth" data-depth="1.7">
                <div className="hx-chip eh-chip">
                  <span className="hx-chip-icon" aria-hidden="true">📅</span>
                  <span>
                    <b>2015 → 2024</b>
                    <small>From +2 to BSc.</small>
                  </span>
                </div>
              </div>
            </div>
            <div className="eh-chip-pos eh-chip-pos--b">
              <div className="eh-chip-depth" data-depth="2.1">
                <div className="hx-chip eh-chip">
                  <span className="hx-chip-icon" aria-hidden="true">🏛️</span>
                  <span>
                    <b>BSc. IT</b>
                    <small>Sunway · 2024</small>
                  </span>
                </div>
              </div>
            </div>
            <div className="eh-chip-pos eh-chip-pos--c">
              <div className="eh-chip-depth" data-depth="1.4">
                <div className="hx-chip eh-chip">
                  <span className="hx-chip-icon" aria-hidden="true">🤖</span>
                  <span>
                    <b>ML · Deep Learning</b>
                    <small>Andrew Ng</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EduHeroMotion>
  );
}
