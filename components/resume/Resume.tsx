// The résumé, as two A4 sheets. On screen it sits under a bar with Download and
// Print; printed (or turned into the PDF by `npm run resume`), only the sheets
// remain. On a phone the sheets become plain, readable columns.
import Icon from "@/components/Icon";
import { resume } from "@/lib/resume";
import PrintButton from "./PrintButton";
import "./resume.css";

const GLYPH: Record<string, string> = {
  email: "M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Zm2.3-.5 6.7 5.2L18.7 6H5.3ZM19 7.7l-6.4 5a1 1 0 0 1-1.2 0L5 7.7v9.8c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V7.7Z",
  phone: "M7.4 3.2c.5-.3 1.2-.2 1.6.3l2.1 2.8c.4.5.3 1.2-.1 1.6l-1.3 1.3a12 12 0 0 0 5.1 5.1l1.3-1.3c.4-.4 1.1-.5 1.6-.1l2.8 2.1c.5.4.6 1.1.3 1.6l-1.2 2c-.5.8-1.5 1.2-2.4 1A17.7 17.7 0 0 1 3.7 7.7c-.2-.9.2-1.9 1-2.4l2.7-2.1Z",
  place: "M12 2.5a7 7 0 0 1 7 7c0 5-7 12-7 12s-7-7-7-12a7 7 0 0 1 7-7Zm0 4.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z",
  web: "M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Zm2.3 10.5H9.7c.2 3 1.2 5.6 2.3 6.4 1.1-.8 2.1-3.4 2.3-6.4Zm4.7 0h-2.7a17 17 0 0 1-1.2 5.6 7.5 7.5 0 0 0 3.9-5.6ZM7.7 13H5a7.5 7.5 0 0 0 3.9 5.6A17 17 0 0 1 7.7 13Zm1.2-7.6A7.5 7.5 0 0 0 5 11h2.7c.1-2.1.5-4 1.2-5.6Zm3.1-.8c-1.1.8-2.1 3.4-2.3 6.4h4.6c-.2-3-1.2-5.6-2.3-6.4Zm3.1.8c.7 1.6 1.1 3.5 1.2 5.6H19a7.5 7.5 0 0 0-3.9-5.6Z",
};

function ContactIcon({ kind }: { kind: string }) {
  if (kind === "linkedin") return <Icon icon="simple-icons:linkedin" className="rs-ico" />;
  if (kind === "github") return <Icon icon="simple-icons:github" className="rs-ico" />;
  return (
    <svg viewBox="0 0 24 24" className="rs-ico" aria-hidden="true">
      <path d={GLYPH[kind]} />
    </svg>
  );
}

export default function Resume() {
  const r = resume;
  return (
    <section className="rs" aria-labelledby="rs-title">
      <div className="rs-bar">
        <div>
          <h1 className="rs-h1" id="rs-title">
            Résumé
          </h1>
          <p className="rs-sub">Two pages, updated {r.updated}. Download it as a PDF or print it as it is.</p>
        </div>
        <div className="rs-actions">
          <a className="btn" href={r.pdf} download="Rajendra-Pandey-Resume.pdf" data-magnetic>
            Download PDF
          </a>
          <PrintButton />
        </div>
      </div>

      <article className="rs-doc" aria-label={`Résumé of ${r.name}`}>
        {/* ── Page 1: who, and the work ─────────────────────────────────── */}
        <div className="rs-page">
          <header className="rs-head">
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized by `npm run images` */}
            <img className="rs-photo" src={r.photo} alt="" width={720} height={720} />
            <div className="rs-who">
              <h2 className="rs-name">{r.name}</h2>
              <p className="rs-title">{r.title}</p>
              <ul className="rs-contact">
                {r.contact.map((c) => (
                  <li key={c.kind}>
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      <ContactIcon kind={c.kind} />
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <div className="rs-cols">
            <div className="rs-main">
              <section className="rs-sec">
                <h3 className="rs-h3">Profile</h3>
                <p className="rs-summary">{r.summary}</p>
              </section>
              <section className="rs-sec">
                <h3 className="rs-h3">Experience</h3>
                <ol className="rs-jobs">
                  {r.experience.map((job) => (
                    <li className="rs-job" key={job.org}>
                      <p className="rs-org">
                        <b>{job.org}</b>
                        <span>{job.where}</span>
                      </p>
                      {job.roles.map((role) => (
                        <div className="rs-role" key={role.role}>
                          <p className="rs-role-head">
                            <b>{role.role}</b>
                            <time>{role.when}</time>
                          </p>
                          <ul className="rs-points">
                            {role.points.map((pt) => (
                              <li key={pt}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <aside className="rs-side">
              <section className="rs-sec">
                <h3 className="rs-h3">Skills</h3>
                <dl className="rs-skills">
                  {r.skills.map((g) => (
                    <div key={g.group}>
                      <dt>{g.group}</dt>
                      <dd>{g.items.join(", ")}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="rs-sec">
                <h3 className="rs-h3">Works on</h3>
                <p className="rs-plain">{r.systems.join(", ")}</p>
              </section>
              <section className="rs-sec">
                <h3 className="rs-h3">Speaks</h3>
                <p className="rs-plain">{r.languages.join(", ")}</p>
              </section>
            </aside>
          </div>
        </div>

        {/* ── Page 2: what he builds on his own, and where he learned ───── */}
        <div className="rs-page">
          <div className="rs-cols">
            <div className="rs-main">
              <section className="rs-sec">
                <h3 className="rs-h3">Personal projects</h3>
                <ul className="rs-projects">
                  {r.projects.map((p) => (
                    <li key={p.name}>
                      <p className="rs-project-head">
                        <b>{p.name}</b>
                        <span>{p.kind}</span>
                      </p>
                      <p className="rs-project-text">{p.text}</p>
                      <p className="rs-stack">{p.stack}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <aside className="rs-side">
              <section className="rs-sec">
                <h3 className="rs-h3">Education</h3>
                <ul className="rs-edu">
                  {r.education.map((e) => (
                    <li key={e.degree}>
                      <p className="rs-role-head">
                        <b>{e.degree}</b>
                        <time>{e.when}</time>
                      </p>
                      <span>{e.school}</span>
                      {e.note && <small>{e.note}</small>}
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
          <p className="rs-foot">
            {r.name}, {r.contact[0].label}
          </p>
        </div>
      </article>
    </section>
  );
}
