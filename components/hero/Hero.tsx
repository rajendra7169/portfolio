// Home hero. Server-rendered markup; all motion lives in HeroMotion.
//
// Layering rule: every moving thing has up to three nested boxes, one per job,
// so animations never fight over the same transform:
//   outer  = scroll exit (.hx-copy, .hx-stage, .hx-chip-pos, …)
//   middle = cursor parallax ([data-depth])
//   inner  = intro (.hx-chip, .hx-photo, …)
import Icon from "@/components/Icon";
import { SocialLinks } from "@/components/Bits";
import { TransitionLink } from "@/components/PageTransition";
import { hero, profile, skills, type Tech } from "@/lib/content";
import HeroMotion from "./HeroMotion";
import HeroField from "./HeroField";
import KtmClock from "./KtmClock";
import CyberReveal from "./CyberReveal";

function Orbit({ items, kind }: { items: Tech[]; kind: "inner" | "outer" }) {
  return (
    <div className={`hx-orbit-depth hx-orbit-depth--${kind}`} data-depth={kind === "inner" ? "0.6" : "1"}>
      <div className={`hx-orbit hx-orbit--${kind}`}>
        {items.map((t, i) => (
          <span className="hx-arm" key={t.name} style={{ "--a": `${(360 / items.length) * i + (kind === "inner" ? 20 : 0)}deg` } as React.CSSProperties}>
            <span className="hx-orb">
              <span className="hx-orb-spin">
                <span className="hx-orb-pop" title={t.name}>
                  <Icon icon={t.icon} color={t.color} />
                </span>
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  // Ticker: every tech from the "What I Do?" section, once.
  const ticker = Array.from(new Map(skills.flatMap((s) => s.techs).map((t) => [t.name, t])).values());

  return (
    <HeroMotion>
      <div className="hx-bg" aria-hidden="true">
        <div className="hx-glow hx-glow--a" />
        <div className="hx-glow hx-glow--b" />
        <div className="hx-floor">
          <div className="hx-floor-grid" />
        </div>
        <HeroField />
        <div className="hx-spot" />
      </div>

      <div className="hx-inner">
        <div className="hx-copy">
          <p className="hx-eyebrow">
            <span className="hx-wave" aria-hidden="true">👋</span>
            <span className="hx-hello">Hi, I&apos;m</span>
          </p>

          <h1 className="hx-name">
            <span className="sr-only">{profile.name}</span>
            <span className="hx-line-clip" aria-hidden="true">
              <span className="hx-line hx-line--a">{hero.first}</span>
            </span>
            <span className="hx-line-clip" aria-hidden="true">
              <span className="hx-line hx-line--b">{hero.last}</span>
            </span>
          </h1>

          <p className="hx-build">
            <span className="hx-build-label">I build</span>{" "}
            <span className="hx-build-text">{hero.builds[0]}</span>
            <span className="hx-caret" aria-hidden="true" />
          </p>
          {/* The rotating line is decorative; screen readers get the full list once. */}
          <p className="sr-only">I build {hero.builds.join(", ")}.</p>

          <p className="hx-intro">{profile.intro}</p>

          <div className="hx-socials">
            <SocialLinks anim={false} />
          </div>

          <div className="hx-ctas">
            <a className="btn" href={profile.repo} target="_blank" rel="noreferrer" data-magnetic>
              <span aria-hidden="true">⭐</span> Star Me On Github
            </a>
            <TransitionLink href="/projects" className="btn btn--ghost" data-magnetic>
              See my work <span aria-hidden="true" className="btn-arrow">→</span>
            </TransitionLink>
          </div>

          <dl className="hx-stats">
            {hero.stats.map((s) => (
              <div className="hx-stat" key={s.label}>
                <dt>{s.label}</dt>
                <dd>
                  <span className="hx-count" data-to={s.value}>
                    {s.value}
                  </span>
                  {s.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hx-stage">
          <div className="hx-tilt">
            <div className="hx-rings-wrap" data-depth="0.4">
              {/* The rings that turn each get an svg of their own, stacked in the same
                  order, so each turns as one layer on the GPU instead of the whole dial
                  repainting every frame. */}
              <svg className="hx-rings" viewBox="0 0 600 600" aria-hidden="true">
                <defs>
                  <linearGradient id="hx-arc" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#4aa8e0" stopOpacity="0" />
                    <stop offset="1" stopColor="#4aa8e0" />
                  </linearGradient>
                </defs>
                <circle className="hx-ring hx-ring--solid" cx="300" cy="300" r="228" />
                <circle className="hx-ring hx-ring--dots" cx="300" cy="300" r="290" />
              </svg>
              <svg className="hx-rings hx-rings--turn hx-rings--dash" viewBox="0 0 600 600" aria-hidden="true">
                <circle className="hx-ring hx-ring--dash" cx="300" cy="300" r="170" />
              </svg>
              <svg className="hx-rings hx-rings--turn hx-rings--arc" viewBox="0 0 600 600" aria-hidden="true">
                <circle className="hx-ring hx-ring--arc" cx="300" cy="300" r="228" stroke="url(#hx-arc)" />
              </svg>
              <svg className="hx-rings hx-rings--turn hx-rings--arc2" viewBox="0 0 600 600" aria-hidden="true">
                <circle className="hx-ring hx-ring--arc hx-ring--arc2" cx="300" cy="300" r="290" stroke="url(#hx-arc)" />
              </svg>
              <svg className="hx-rings hx-rings--turn" viewBox="0 0 600 600" aria-hidden="true">
                {/* Tick marks around the outside, like an instrument dial. */}
                {Array.from({ length: 60 }, (_, i) => (
                  <line
                    key={i}
                    className={`hx-tick${i % 5 === 0 ? " hx-tick--major" : ""}`}
                    x1="300"
                    y1={i % 5 === 0 ? 2 : 6}
                    x2="300"
                    y2="14"
                    transform={`rotate(${i * 6} 300 300)`}
                  />
                ))}
              </svg>
            </div>

            <div className="hx-disc-depth" data-depth="0.25">
              <div className="hx-disc" />
            </div>

            <Orbit items={hero.orbitOuter} kind="outer" />
            <Orbit items={hero.orbitInner} kind="inner" />

            <div className="hx-photo-depth" data-depth="0.15">
              <div className="hx-photo">
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized by `npm run images` */}
                <img
                  src="/images/rajendra-pandey-800.webp"
                  srcSet="/images/rajendra-pandey-800.webp 800w, /images/rajendra-pandey-1600.webp 1600w"
                  sizes="(max-width: 899px) 80vw, 40vw"
                  width={800}
                  height={906}
                  alt="Rajendra Pandey, software developer in Kathmandu and maker of Blazify"
                  fetchPriority="high"
                  draggable={false}
                />
                {/* Hologram beam, masked to his silhouette by the photo's own alpha. */}
                <span className="hx-scan" aria-hidden="true" />
                <CyberReveal />
              </div>
            </div>

            <span className="hx-bracket hx-bracket--tl" aria-hidden="true" />
            <span className="hx-bracket hx-bracket--tr" aria-hidden="true" />
            <span className="hx-bracket hx-bracket--bl" aria-hidden="true" />
            <span className="hx-bracket hx-bracket--br" aria-hidden="true" />
          </div>

          <div className="hx-chip-pos hx-chip-pos--a">
            <div className="hx-chip-depth" data-depth="1.8">
              <div className="hx-chip">
                <span className="hx-chip-icon" aria-hidden="true">🎵</span>
                <span>
                  <b>Blazify</b>
                  <small>Thousands of downloads</small>
                </span>
              </div>
            </div>
          </div>
          <div className="hx-chip-pos hx-chip-pos--b">
            <div className="hx-chip-depth" data-depth="1.4">
              <div className="hx-chip">
                <span className="hx-chip-icon hx-chip-icon--live" aria-hidden="true" />
                <span>
                  <b>Kathmandu</b>
                  <small>
                    <KtmClock /> NPT
                  </small>
                </span>
              </div>
            </div>
          </div>
          <div className="hx-chip-pos hx-chip-pos--c">
            <div className="hx-chip-depth" data-depth="2.2">
              <div className="hx-chip">
                <span className="hx-chip-icon" aria-hidden="true">💼</span>
                <span>
                  <b>Software Engineer</b>
                  <small>@ Matrika Technology</small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hx-marquee" aria-hidden="true">
        <div className="hx-marquee-in">
          <div className="hx-marquee-track">
            {[...ticker, ...ticker].map((t, i) => (
              <span className="hx-marquee-item" key={i}>
                <Icon icon={t.icon} color={t.color} />
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hx-cue" aria-hidden="true">
        <span className="hx-cue-in">
          <span className="hx-mouse" />
          Scroll
        </span>
      </div>
    </HeroMotion>
  );
}
