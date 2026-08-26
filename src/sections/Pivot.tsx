/**
 * Pivot — ENTRY 03, and the emotional centre of the page (DESIGN.md §7).
 *
 * Chronological, oldest first, so the arc is visible rather than asserted:
 * marketing, then two years of balance sheets, then a game studio. The Yarsa
 * entry is marked as the pivot and the scene's ridge morph is keyed to this
 * section, which is the one place the metaphor and the content line up exactly.
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
              Pivot
            </h2>
            <p className="act__standfirst">
              Balance sheets, tax compliance and revenue forecasting until 2022. Game
              mechanics, level design and frame budgets in 2024. Both jobs are the same
              job: find the number that is wrong and work out why.
            </p>
          </header>

          <ol className="timeline">
            {experience.roles.map((role) => (
              <li
                className={`timeline__item${role.id === 'yarsa' ? ' timeline__item--pivot' : ''}`}
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
