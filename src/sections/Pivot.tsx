/**
 * Experience — ENTRY 03. Where I work now; the current role is marked and the
 * scene's ridge morph is keyed to this section.
 */
import { experience, acts } from '../content';
import { EntryLabel } from '../components/EntryLabel';

const act = acts[2];

const KIND_LABEL: Record<string, string> = {
  work: 'Work',
  internship: 'Internship',
};

export function Pivot() {
  return (
    <section className="act" id={act.id} aria-labelledby="pivot-title">
      <div className="shell act__grid">
        <div className="act__content">
          <header className="act__head" data-reveal>
            <EntryLabel entry={act.entry} qualifier={act.qualifier} title="Experience" />
            <h2 className="act__title" id="pivot-title">
              Now
            </h2>
            <p className="act__standfirst">
              Building software for Nepali businesses by day, and open-source apps that
              thousands of people use the rest of the time.
            </p>
          </header>

          <ol className="timeline">
            {experience.roles.map((role) => (
              <li
                className={`timeline__item${role.id === 'matrika' ? ' timeline__item--pivot' : ''}`}
                key={role.id}
                data-reveal
              >
                <p className="timeline__num figures">
                  {role.duration} · {KIND_LABEL[role.kind] ?? role.kind}
                </p>

                <h3 className="card__title">{role.title}</h3>

                <p className="card__meta">
                  {role.company ? (
                    role.companyUrl ? (
                      <a
                        className="link"
                        href={role.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {role.company}
                      </a>
                    ) : (
                      /* A missing link renders as plain text, never a dead `#`
                         anchor. the brief §5. */
                      <span>{role.company}</span>
                    )
                  ) : null}
                  <span>{role.location}</span>
                </p>

                {role.description ? (
                  <p className="card__body">{role.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
