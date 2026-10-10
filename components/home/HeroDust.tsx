// Home §4.1 — the hero. His portrait is the dust on the fixed canvas (no <img>);
// this is the server-rendered copy beside it. HeroDustMotion runs the intro,
// the slot reel, the pin and the name handoff to the HUD tag.
import { SocialLinks } from "@/components/Bits";
import { TransitionLink } from "@/components/PageTransition";
import { experience, hero, profile } from "@/lib/content";
import HeroDustMotion from "./HeroDustMotion";

export default function HeroDust() {
  const role = experience.roles[0];
  const reel = [...hero.builds, hero.builds[0]]; // the clone makes the loop seamless

  return (
    <HeroDustMotion>
      <div className="dh-copy dm-copy">
        <p className="hx-eyebrow dh-eyebrow">
          <span className="dh-live" aria-hidden="true" />
          {role.title} · {role.where.split(",")[0]}
        </p>

        <h1 className="hx-name dh-name">
          <span className="sr-only">{profile.name}</span>
          <span className="hx-line-clip" aria-hidden="true">
            <span className="hx-line hx-line--a dh-line">{hero.first}</span>
          </span>
          <span className="hx-line-clip" aria-hidden="true">
            <span className="hx-line hx-line--b dh-line">{hero.last}</span>
          </span>
        </h1>

        <p className="dh-build" aria-hidden="true">
          <span className="dh-build-label">I build</span>
          <span className="dh-reel">
            <span className="dh-reel-track">
              {reel.map((b, i) => (
                <span className="dh-reel-item" key={i}>
                  {b}
                </span>
              ))}
            </span>
          </span>
        </p>
        <p className="sr-only">I build {hero.builds.join(", ")}.</p>

        <p className="dh-intro">{profile.intro}</p>

        <div className="hx-ctas dh-ctas">
          <TransitionLink className="btn" href="/projects" data-magnetic>
            See projects <span aria-hidden="true" className="btn-arrow">→</span>
          </TransitionLink>
          <TransitionLink className="btn btn--ghost" href="/contact" data-magnetic>
            Say hello
          </TransitionLink>
        </div>

        <div className="dh-socials">
          <SocialLinks anim={false} />
        </div>

        <dl className="hx-stats dh-stats">
          {hero.stats.map((s) => (
            <div className="hx-stat dh-stat" key={s.label}>
              <dt>{s.label}</dt>
              <dd>
                <span className="dh-count" data-to={s.value}>
                  {s.value}
                </span>
                {s.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="dh-cue" aria-hidden="true">
        <span className="dh-cue-in">
          <span className="hx-mouse" />
          scroll — the dust remembers
        </span>
      </div>
    </HeroDustMotion>
  );
}
