import type { Metadata } from "next";
import Motion from "@/components/Motion";
import { PageHeading, SectionTitle } from "@/components/Bits";
import { experience } from "@/lib/content";

export const metadata: Metadata = { title: "Experience" };

export default function Experience() {
  return (
    <Motion>
      <PageHeading art="experience" title="Experience" subtitle={experience.intro} />

      <section className="section">
        <SectionTitle>Work</SectionTitle>
        <div className="timeline">
          <span className="timeline-line" data-anim="vline" aria-hidden="true" />
          <ol className="timeline-list">
          {experience.roles.map((r) => (
            <li className="role" key={r.company}>
              <span className="role-dot" style={{ background: r.color }} data-anim="pop" aria-hidden="true">
                {r.company[0]}
              </span>
              <article className="role-card" data-anim="right" data-tilt>
                <header className="role-head" style={{ "--accent": r.color } as React.CSSProperties}>
                  <div>
                    <h3>{r.title}</h3>
                    <p>
                      {r.company} · {r.where}
                    </p>
                  </div>
                  <span className="role-when">{r.when}</span>
                </header>
                <ul className="points points--dark">
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
          </ol>
        </div>
      </section>
    </Motion>
  );
}
