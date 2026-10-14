// Experience hero: a staff ID badge hanging on a lanyard from the top of the
// screen (on a phone, on a short strap below the buttons). Drag it and it swings
// back like a pendulum; click it to flip to the Blazify maintainer pass. Text the
// lanyard passes behind turns light (an ink copy of the text, clipped to the
// strap; see ExpHeroMotion).
// Layers: .xh-drop (intro drop) > .xh-swing (pendulum rotation) > .xh-badge-tilt
// (cursor tilt) > button > .xh-badge-inner (CSS flip).
import { preload } from "react-dom";
import HeroField from "@/components/hero/HeroField";
import KtmClock from "@/components/hero/KtmClock";
import { TransitionLink } from "@/components/PageTransition";
import { careerLog, contact, experience, work } from "@/lib/content";
import { projects } from "@/lib/projects";
import { AppTile } from "@/components/proj/Devices";
import ExpHeroMotion from "./ExpHeroMotion";

// The staff card on the badge: light (it's 240 to 290 px on screen), and fetched
// first thing, since the badge drops in as soon as the page starts.
const CARD = { src: "/images/idcard-800.webp", srcSet: "/images/idcard-600.webp 600w, /images/idcard-800.webp 800w", sizes: "(max-width: 899px) 240px, 290px" };

// The back's after-hours list: the four "What I Do" disciplines.
const AFTER_HOURS = [
  ["🧑‍💻", "Full-stack apps for Android, iPhone & desktop"],
  ["☁️", "Cloud servers and deployments"],
  ["🎨", "UI/UX and logo design"],
  ["🎬", "Video and photography"],
] as const;

const built = projects.filter((p) => p.featured);

export default function ExpHero() {
  preload(CARD.src, { as: "image", imageSrcSet: CARD.srcSet, imageSizes: CARD.sizes, fetchPriority: "high" });
  const releases2026 = careerLog.filter((c) => c.date.startsWith("2026")).length;
  const stats = [
    { value: work.length, label: "roles" },
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
        <Copy stats={stats} />

        <div className="xh-stage">
          <span className="xh-anchor" aria-hidden="true" />
          <div className="xh-drop">
            <div className="xh-swing">
              <span className="xh-strap" aria-hidden="true">
                <i className="xh-strap-a" />
                <i className="xh-strap-b" />
                <span className="xh-strap-print">{"MATRIKA TECHNOLOGY  ✦  ".repeat(8)}</span>
              </span>
              <span className="xh-clip" aria-hidden="true" />
              <div className="xh-badge-tilt">
                <button type="button" className="xh-badge" aria-pressed="false" aria-label="Matrika Technology staff ID badge. Flip it to see what I do outside the office" data-cursor="Drag · Flip">
                  <span className="xh-badge-inner">
                    {/* Front: the real Matrika Technology staff card */}
                    <span className="xh-face xh-front">
                      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized by `npm run images` */}
                      <img
                        className="xh-card"
                        src={CARD.src}
                        srcSet={CARD.srcSet}
                        sizes={CARD.sizes}
                        fetchPriority="high"
                        width={1182}
                        height={2007}
                        alt="Matrika Technology staff ID card: Rajendra Pandey, Software Engineer, J-Jewellery Software"
                        draggable={false}
                      />
                      <span className="xh-hole" aria-hidden="true" />
                      <span className="xh-foil" aria-hidden="true" />
                    </span>

                    {/* Back: what he does outside the office */}
                    <span className="xh-face xh-back">
                      <span className="xh-hole" aria-hidden="true" />
                      <span className="xh-back-head">
                        <small>After-hours pass</small>
                        <b>Off the clock</b>
                        <span>What I do outside the office</span>
                      </span>
                      <span className="xh-does">
                        {AFTER_HOURS.map(([icon, what]) => (
                          <span className="xh-do" key={what}>
                            <i aria-hidden="true">{icon}</i>
                            {what}
                          </span>
                        ))}
                      </span>
                      <span className="xh-ships">
                        <small>Apps I build</small>
                        <span className="xh-ships-row">
                          {built.map((p) => (
                            <AppTile key={p.slug} p={p} className="xh-ship" />
                          ))}
                        </span>
                        <span className="xh-ships-names">{built.map((p) => p.name).join(" · ")}</span>
                      </span>
                      <span className="xh-back-foot">rajendrapandey.info.np</span>
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

        {/* The same text in white, clipped by ExpHeroMotion to the lanyard's outline:
            wherever the strap passes behind the text, the text turns light. */}
        <Copy stats={stats} ink />
      </div>
    </ExpHeroMotion>
  );
}

type Stat = { value: number; label: string };

// Matrika Technology's site, as printed on the card.
const COMPANY = "https://matrikatec.com.np";

/** The hero text. `ink` renders the light copy laid over the lanyard: same layout, no semantics. */
function Copy({ stats, ink = false }: { stats: Stat[]; ink?: boolean }) {
  const Title = ink ? "div" : "h1";
  return (
    <div className={`xh-copy${ink ? " xh-ink" : ""}`} aria-hidden={ink || undefined} inert={ink || undefined}>
      <p className="hx-eyebrow xh-eyebrow">
        <span aria-hidden="true">💼</span> Career log · HEAD → now
      </p>
      <Title className="xh-title">
        {!ink && <span className="sr-only">Experience</span>}
        <span className="eh-title-clip" aria-hidden="true">
          <span className="hx-line hx-line--a xh-title-text">Experience</span>
        </span>
      </Title>
      <p className="xh-intro">{experience.intro}</p>

      <p className="xh-status">
        <span className="xh-status-dot" aria-hidden="true" />
        <span>
          Currently <b>Software Engineer</b> at{" "}
          {ink ? (
            <b className="xh-co">Matrika Technology</b>
          ) : (
            <a className="xh-co" href={COMPANY} target="_blank" rel="noreferrer">
              Matrika Technology
            </a>
          )}
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
        {ink ? (
          <>
            <span className="btn">
              See the work <span className="btn-arrow">→</span>
            </span>
            <span className="btn btn--ghost">Résumé</span>
          </>
        ) : (
          <>
            <TransitionLink href="/projects" className="btn" data-magnetic>
              See the work <span aria-hidden="true" className="btn-arrow">→</span>
            </TransitionLink>
            <TransitionLink href={contact.resume} className="btn btn--ghost" data-magnetic>
              Résumé
            </TransitionLink>
          </>
        )}
      </div>
    </div>
  );
}
