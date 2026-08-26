/**
 * Practice — ENTRY 05. All five competitive-programming profiles, each with the
 * username that identifies it, each linked (CLAUDE.md §2).
 *
 * The usernames are the content. A row of five logos would be decoration; a row
 * of five handles is something a reader can go and check.
 */
import { competitiveSites, acts } from '../content';
import { EntryLabel } from '../components/EntryLabel';
import { LinkRow } from '../components/LinkRow';

const act = acts[4];

export function Practice() {
  return (
    <section className="act" id={act.id} aria-labelledby="practice-title">
      <div className="shell act__grid">
        <div className="act__content">
          <header className="act__head" data-reveal>
            <EntryLabel entry={act.entry} qualifier={act.qualifier} title="Practice" />
            <h2 className="act__title" id="practice-title">
              Practice
            </h2>
            <p className="act__standfirst">
              Where the algorithm coursework kept going after the coursework stopped.
              Five profiles, all public, all under a name you can search.
            </p>
          </header>

          <ul className="linklist" data-reveal>
            {competitiveSites.map((site) => (
              <LinkRow
                key={site.site}
                href={site.link}
                name={site.site}
                handle={site.handle}
                icon={site.icon}
                brand={site.brand}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
