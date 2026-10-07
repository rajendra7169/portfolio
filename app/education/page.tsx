import type { Metadata } from "next";
import Motion from "@/components/Motion";
import Icon from "@/components/Icon";
import { PageHeading, SectionTitle } from "@/components/Bits";
import { certifications, codingProfiles, degrees } from "@/lib/content";

export const metadata: Metadata = { title: "Education" };

export default function Education() {
  return (
    <Motion>
      <PageHeading art="education" title="Education" subtitle="Basic Qualification and Certifications">
        <ul className="profiles" data-anim-group="0.07">
          {codingProfiles.map((p) => (
            <li key={p.name} data-anim="pop">
              <a href={p.href} target="_blank" rel="noreferrer" aria-label={p.name} className="profile-link">
                <Icon icon={p.icon} color={p.color} />
                <span className="tech-tip" role="tooltip">
                  {p.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </PageHeading>

      <section className="section">
        <SectionTitle>Degrees Received</SectionTitle>
        <div className="degrees">
          {degrees.map((d) => (
            <article className="degree" key={d.school}>
              <div className="degree-logo" data-anim="pop">
                {/* eslint-disable-next-line @next/next/no-img-element -- small static logo */}
                <img src={d.logo} alt={`${d.school} logo`} />
              </div>
              <div className="degree-card" data-anim="right" data-tilt>
                <header className="degree-head">
                  <div>
                    <h3>{d.school}</h3>
                    <p>{d.degree}</p>
                  </div>
                  <span className="degree-when">{d.duration}</span>
                </header>
                <div className="degree-body">
                  <ul className="points points--dark">
                    {d.points.map((p) => (
                      <li key={p.slice(0, 24)}>{p}</li>
                    ))}
                  </ul>
                  <a className="btn btn--soft" href={d.url} target="_blank" rel="noreferrer">
                    Visit Website
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionTitle>Certifications</SectionTitle>
        <ul className="certs" data-anim-group="0.08">
          {certifications.map((c) => (
            <li className="cert" key={c.title} data-anim="zoom" data-tilt>
              <div className="cert-head" style={{ background: c.color }}>
                {c.logo.startsWith("/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- small static logo
                  <img src={c.logo} alt="" />
                ) : (
                  <Icon icon={c.logo} className="cert-icon" />
                )}
              </div>
              <div className="cert-body">
                <h3>{c.title}</h3>
                <p>- {c.by}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Motion>
  );
}
