// Section 6 — Shipped (spec §4.6). Server-rendered: the eight projects are real
// links in the markup, so the page reads (and indexes) without JS. The dust forms
// eight tiles on the fixed canvas; ShippedMotion lays these DOM tiles exactly on
// them (desktop) or lets them flow as a list under the dust (phones, stills).
import { hero, projects, projectsIntro } from "@/lib/content";
import { Chars } from "@/components/Motion";
import { TransitionLink } from "@/components/PageTransition";
import Icon from "@/components/Icon";
import ShippedMotion from "./ShippedMotion";

export default function Shipped() {
  const stat = hero.stats[1]; // { value: 8, label: "projects shipped" }
  return (
    <ShippedMotion>
      <div className="ds-copy dm-copy">
        <h2 className="ds-h2 dm-h2" id="shipped">
          <span className="ds-count" data-to={stat.value}>
            {stat.value}
          </span>
          {stat.suffix}{" "}
          <Chars text={stat.label} />
        </h2>
        <p className="ds-intro dm-lead">{projectsIntro}</p>
        <p className="ds-ctas">
          <TransitionLink className="btn ds-cta" href="/projects" data-magnetic>
            All projects <span className="btn-arrow">→</span>
          </TransitionLink>
        </p>
      </div>

      {/* Eight tiles. Desktop: absolutely placed over the dust tiles (left/top/width/height from
          layout.tiles(), set by GSAP). Phones + reduced motion: an in-flow list under the dust. */}
      <ul className="ds-grid">
        {projects.map((p, k) => (
          <li className="ds-tile" data-k={k} key={p.name}>
            <div className="ds-tile-in">
              <span className="ds-tile-techs" aria-label="Built with">
                {p.techs.slice(0, 3).map((t) => (
                  <span className="ds-tile-ic" key={t.name}>
                    <Icon icon={t.icon} color={t.color} />
                    <span className="sr-only">{t.name}</span>
                  </span>
                ))}
              </span>
              <span className="ds-tile-label">
                {/* The repo link covers the whole tile (::after); the Live link below is a sibling,
                    not a child, so the HTML stays valid (no nested <a>). */}
                <a className="ds-tile-link" href={p.url} target="_blank" rel="noreferrer">
                  {p.name}
                </a>
                <span className="ds-tile-date">{p.date}</span>
              </span>
            </div>
            {p.live && (
              <a className="ds-tile-live" href={p.live} target="_blank" rel="noreferrer">
                Live <span aria-hidden="true">↗</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </ShippedMotion>
  );
}
