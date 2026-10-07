import type { Metadata } from "next";
import Motion from "@/components/Motion";
import Icon from "@/components/Icon";
import { PageHeading, SectionTitle, TechIcons } from "@/components/Bits";
import { projects, projectsIntro, publications, socials } from "@/lib/content";

export const metadata: Metadata = { title: "Projects" };

export default function Projects() {
  return (
    <Motion>
      <PageHeading art="projects" title="Projects" subtitle={projectsIntro} />

      <section className="section">
        <ul className="projects" data-anim-group="0.07">
          {projects.map((p) => (
            <li key={p.name} className={`project${p.wide ? " project--wide" : ""}`} data-anim="up" data-tilt>
              <h3 className="project-name">
                <Icon icon="simple-icons:github" className="project-repo-icon" />
                <a href={p.url} target="_blank" rel="noreferrer" className="project-link">
                  {p.name}
                </a>
              </h3>
              <p className="project-desc">{p.description}</p>
              <div className="project-foot">
                <span className="project-date">Created on {p.date}</span>
                <TechIcons techs={p.techs} small />
              </div>
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="project-live">
                  Live <span aria-hidden="true">↗</span>
                </a>
              )}
            </li>
          ))}
        </ul>
        <div className="center" data-anim="up">
          <a className="btn" href={socials[0].href} target="_blank" rel="noreferrer" data-magnetic>
            More Projects
          </a>
        </div>
      </section>

      <section className="section">
        <SectionTitle>Documentations</SectionTitle>
        <p className="section-sub" data-anim="up">
          Some of my documentations created while doing a project.
        </p>
        <ul className="projects" data-anim-group="0.08">
          {publications.map((d) => (
            <li key={d.title} className="project" data-anim="up" data-tilt>
              <h3 className="project-name project-name--doc">{d.title}</h3>
              <p className="project-desc">{d.note}</p>
              <span className="project-date">Published on {d.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </Motion>
  );
}
