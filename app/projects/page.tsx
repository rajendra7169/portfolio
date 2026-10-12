import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Motion from "@/components/Motion";
import Icon from "@/components/Icon";
import { SectionTitle } from "@/components/Bits";
import { TransitionLink } from "@/components/PageTransition";
import Launcher from "@/components/proj/Launcher";
import { AppTile } from "@/components/proj/Devices";
import { publications, socials } from "@/lib/content";
import { archive, PLATFORMS, projects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

export default function Projects() {
  return (
    <Motion>
      <Launcher />

      <section className="section pl-index" aria-labelledby="all-apps">
        <SectionTitle id="all-apps">All apps</SectionTitle>
        <p className="section-sub" data-anim="up">
          The four with the full story first, then the rest.
        </p>
        <ul className="pl-cards" data-anim-group="0.07">
          {projects.map((p) => (
            <li key={p.slug} className={`pl-card${p.featured ? " pl-card--featured" : ""}`} data-anim="up" data-tilt style={{ "--accent": p.accent } as CSSProperties}>
              <span className="pl-card-top">
                <AppTile p={p} className="pl-card-tile" />
                <span className="pl-card-kind">{p.kind}</span>
              </span>
              <h3 className="pl-card-name">
                <TransitionLink href={`/projects/${p.slug}`} className="pl-card-link">
                  {p.name}
                </TransitionLink>
              </h3>
              <p className="pl-card-tag">{p.tagline}</p>
              <span className="pl-card-foot">
                <span className="pl-card-os" aria-label={`Runs on ${p.platforms.map((k) => PLATFORMS[k].label).join(", ")}`}>
                  {p.platforms.map((k) => (
                    <Icon key={k} icon={PLATFORMS[k].icon} />
                  ))}
                </span>
                <span className="pl-card-go" aria-hidden="true">
                  {p.featured ? "Full story" : "Open"} →
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <SectionTitle>Also on GitHub</SectionTitle>
        <ul className="projects" data-anim-group="0.08">
          {archive.map((a) => (
            <li key={a.name} className="project project--wide" data-anim="up" data-tilt>
              <h3 className="project-name">
                <Icon icon="simple-icons:github" className="project-repo-icon" />
                <a href={a.href} target="_blank" rel="noreferrer" className="project-link">
                  {a.name}
                </a>
              </h3>
              <p className="project-desc">{a.text}</p>
              <div className="project-foot">
                <span className="project-date">Created on {a.date}</span>
              </div>
              {a.live && (
                <a href={a.live} target="_blank" rel="noreferrer" className="project-live">
                  Live <span aria-hidden="true">↗</span>
                </a>
              )}
            </li>
          ))}
          {publications.map((d) => (
            <li key={d.title} className="project project--wide" data-anim="up" data-tilt>
              <h3 className="project-name project-name--doc">{d.title}</h3>
              <p className="project-desc">{d.note}</p>
              <span className="project-date">Published on {d.date}</span>
            </li>
          ))}
        </ul>
        <div className="center" data-anim="up">
          <a className="btn" href={socials[0].href} target="_blank" rel="noreferrer" data-magnetic>
            More on GitHub
          </a>
        </div>
      </section>
    </Motion>
  );
}
