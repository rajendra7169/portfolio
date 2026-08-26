/**
 * Documentation — ENTRY 07. One paper, dated and linked.
 *
 * The old site's `publications` array carried this entry plus two empty objects
 * with `createdAt: "Not published yet"`. The empties are gone (CLAUDE.md §2);
 * one real thing beats three rows where two are blank.
 */
import { publications, acts } from '../content';
import { EntryLabel } from '../components/EntryLabel';

const act = acts[6];

export function Documentation() {
  if (publications.length === 0) return null;

  return (
    <section className="act act--right" id={act.id} aria-labelledby="documentation-title">
      <div className="shell act__grid">
        <div className="act__content">
          <header className="act__head" data-reveal>
            <EntryLabel entry={act.entry} qualifier={act.qualifier} title="Documentation" />
            <h2 className="act__title" id="documentation-title">
              Documentation
            </h2>
            <p className="act__standfirst">
              Writing the system down is part of building it. This is the paper for the
              final-year project, not a summary of it.
            </p>
          </header>

          <ol className="timeline">
            {publications.map((paper) => (
              <li className="timeline__item" key={paper.id} data-reveal>
                <p className="timeline__num figures">{paper.createdAt}</p>
                <h3 className="card__title">{paper.name}</h3>
                <p className="card__body">{paper.description}</p>
                {paper.url ? (
                  <p>
                    <a
                      className="link"
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read the paper ↗
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
