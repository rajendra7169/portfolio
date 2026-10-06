/**
 * Origin — ENTRY 02. Both institutions, both date ranges, all three description
 * bullets each, both website links (the brief §2).
 *
 * The bullets run past 300 characters. They are not clamped, shortened or
 * summarised — the longest one is the whole point of the section, because it is
 * where the business-studies half of the story is on the record.
 */
import { degrees, acts } from '../content';
import { EntryLabel } from '../components/EntryLabel';

const act = acts[1];

export function Origin() {
  return (
    <section className="act" id={act.id} aria-labelledby="origin-title">
      <div className="shell act__grid">
        <div className="act__content">
          <header className="act__head" data-reveal>
            <EntryLabel entry={act.entry} qualifier={act.qualifier} title="Education" />
            <h2 className="act__title" id="origin-title">
              Origin
            </h2>
            <p className="act__standfirst">
              Business studies first, then a degree in information technology: data
              structures, algorithms, databases and deep learning, finished in 2024.
            </p>
          </header>

          <ol className="timeline">
            {degrees.map((degree, i) => (
              <li className="timeline__item" key={degree.id} data-reveal>
                <p className="timeline__num figures">
                  {String(i + 1).padStart(2, '0')} · {degree.duration}
                </p>

                <h3 className="card__title">{degree.institution}</h3>

                <p className="card__meta">
                  <span>{degree.qualification}</span>
                  {degree.websiteLink ? (
                    <a
                      className="link"
                      href={degree.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {degree.websiteLink.replace(/^https?:\/\//, '')}
                    </a>
                  ) : null}
                </p>

                <ul className="bullets">
                  {degree.descriptions.map((line) => (
                    <li key={line.slice(0, 40)}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
