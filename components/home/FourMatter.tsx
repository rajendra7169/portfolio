// Home §4.5 — Four kinds of matter. The globe pinches and divides into four
// cells, one per skill; each step's illustration is the big silhouette and the
// other three wait as discs on the rail. Server-rendered copy for all four.
import Icon from "@/components/Icon";
import { Chars } from "@/components/Motion";
import { skills } from "@/lib/content";
import FourMatterMotion from "./FourMatterMotion";

export default function FourMatter() {
  return (
    <FourMatterMotion labels={skills.map((s) => s.short)}>
      <div className="dc-copy dm-copy">
        {skills.map((s, i) => (
          <article className={`dc-step${i === 0 ? " is-live" : ""}`} data-i={i} key={s.title} aria-labelledby={`dc-title-${i}`}>
            <p className="dc-kicker dm-kicker dc-fade">
              <span className="dc-num">0{i + 1}</span> / 04 · {s.short}
            </p>
            <h2 className="dc-title dm-h2" id={`dc-title-${i}`}>
              <Chars text={s.title} />
            </h2>
            <p className="dc-tag dm-lead dc-fade">{s.tagline}</p>
            <ul className="dc-logos" aria-label={`${s.short} tools`}>
              {s.techs.map((t) => (
                <li className="dc-ic" key={t.name} tabIndex={0}>
                  <Icon icon={t.icon} color={t.color} />
                  <span className="tech-tip" role="tooltip">
                    {t.name}
                  </span>
                  <span className="sr-only">{t.name}</span>
                </li>
              ))}
            </ul>
            <ul className="points dc-points">
              {s.points.map((p) => (
                <li className="dc-fade" key={p}>
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </FourMatterMotion>
  );
}
