// Experience hero: a staff ID badge hanging on a lanyard. Drag it and it swings
// back like a pendulum; click it to flip to the Blazify maintainer pass.
// Layers: .xh-drop (intro drop) > .xh-swing (pendulum rotation) > .xh-badge-tilt
// (cursor tilt) > button > .xh-badge-inner (CSS flip).
import Icon from "@/components/Icon";
import HeroField from "@/components/hero/HeroField";
import KtmClock from "@/components/hero/KtmClock";
import { TransitionLink } from "@/components/PageTransition";
import { careerLog, contact, experience, profile } from "@/lib/content";
import ExpHeroMotion from "./ExpHeroMotion";

// Decorative barcode / QR patterns, deterministic so server and client agree.
const BARS = Array.from({ length: 38 }, (_, i) => 1 + ((i * 7 + 3) % 4));
const QR = Array.from({ length: 81 }, (_, i) => (i * 37 + (i % 7) * 11) % 5 < 2);

export default function ExpHero() {
  const releases2026 = careerLog.filter((c) => c.date.startsWith("2026") && !c.scope?.includes("extractor")).length;
  const stats = [
    { value: experience.roles.length, label: "roles" },
    { value: 3, label: "Blazify platforms" },
    { value: releases2026, label: "releases in 2026" },
  ];

  return (
    <ExpHeroMotion>
      <div className="xh-bg" aria-hidden="true">
        <div className="hx-glow hx-glow--a" />
        <div className="hx-glow hx-glow--b" />
        <div className="hx-floor">
          <div className="hx-floor-grid" />
        </div>
        <HeroField />
      </div>

      <div className="xh-inner">
        <div className="xh-copy">
          <p className="hx-eyebrow xh-eyebrow">
            <span aria-hidden="true">💼</span> Career log · HEAD → now
          </p>
          <h1 className="xh-title">
            <span className="sr-only">Experience</span>
            <span className="eh-title-clip" aria-hidden="true">
              <span className="hx-line hx-line--a xh-title-text">Experience</span>
            </span>
          </h1>
          <p className="xh-intro">{experience.intro}</p>

          <p className="xh-status">
            <span className="xh-status-dot" aria-hidden="true" />
            <span>
              Currently <b>Software Developer</b> at <b>Matrika Technology</b>
            </span>
            <span className="xh-status-time">
              Kathmandu · <KtmClock /> NPT
            </span>
          </p>

          <dl className="hx-stats xh-stats">
            {stats.map((s) => (
              <div className="hx-stat xh-stat" key={s.label}>
                <dt>{s.label}</dt>
                <dd className="xh-count" data-to={s.value}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="xh-ctas">
            <TransitionLink href="/projects" className="btn" data-magnetic>
              See the work <span aria-hidden="true" className="btn-arrow">→</span>
            </TransitionLink>
            <a className="btn btn--ghost" href={contact.resume} target="_blank" rel="noreferrer" data-magnetic>
              Resume <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="xh-stage">
          <span className="xh-anchor" aria-hidden="true" />
          <div className="xh-drop">
            <div className="xh-swing">
              <span className="xh-strap" aria-hidden="true" />
              <span className="xh-clip" aria-hidden="true" />
              <div className="xh-badge-tilt">
                <button type="button" className="xh-badge" aria-pressed="false" aria-label="Staff ID badge. Flip to see the Blazify maintainer pass" data-cursor="Drag · Flip">
                  <span className="xh-badge-inner">
                    {/* Front: Matrika Technology staff card */}
                    <span className="xh-face xh-front">
                      <span className="xh-hole" aria-hidden="true" />
                      <span className="xh-band">
                        <b>Matrika Technology</b>
                        <small>Staff · Kathmandu</small>
                      </span>
                      <span className="xh-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized by `npm run images` */}
                        <img src="/images/contact-800.webp" alt="" draggable={false} />
                      </span>
                      <span className="xh-name">{profile.name}</span>
                      <span className="xh-role">Software Developer</span>
                      <span className="xh-meta">
                        <span>
                          <small>ID</small>RP-7169
                        </span>
                        <span>
                          <small>Since</small>Present
                        </span>
                      </span>
                      <span className="xh-barcode" aria-hidden="true">
                        {BARS.map((w, i) => (
                          <i key={i} style={{ width: w }} />
                        ))}
                      </span>
                      <span className="xh-foil" aria-hidden="true" />
                    </span>

                    {/* Back: Blazify open-source maintainer pass */}
                    <span className="xh-face xh-back">
                      <span className="xh-hole" aria-hidden="true" />
                      <span className="xh-back-head">
                        <small>Open source pass</small>
                        <b>Blazify</b>
                        <span>Creator &amp; Maintainer</span>
                      </span>
                      <span className="xh-platforms">
                        <Icon icon="logos:android-icon" />
                        <Icon icon="logos:apple" />
                        <Icon icon="logos:linux-tux" />
                        <Icon icon="logos:microsoft-windows-icon" />
                      </span>
                      <span className="xh-promises">No ads · No tracking · No account</span>
                      <span className="xh-qr" aria-hidden="true">
                        {QR.map((on, i) => (
                          <i key={i} className={on ? "on" : undefined} />
                        ))}
                      </span>
                      <span className="xh-back-foot">github.com/rajendra7169/blazify</span>
                      <span className="xh-foil" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <p className="xh-hint" aria-hidden="true">
            <span className="xh-hint-fine">Grab the badge · click to flip</span>
            <span className="xh-hint-touch">Swipe the badge · tap to flip</span>
          </p>
        </div>
      </div>
    </ExpHeroMotion>
  );
}
