/**
 * Arrival — ENTRY 01. The only place --step-4 type appears on the site
 * (DESIGN.md §3), and the only <h1>.
 *
 * The hero line is short. Everything under it is not: seven labelled social
 * links, the résumé, the coordinates. A name and a shape is Failure 1 in
 * the brief §1, and this section is where that failure would start.
 */
import { greeting, socialMediaLinks, contactPageData, acts } from '../content';
import { EntryLabel } from '../components/EntryLabel';
import { LinkRow } from '../components/LinkRow';

const act = acts[0];

export function Arrival() {
  return (
    <section className="act" id={act.id} aria-labelledby="arrival-name">
      <div className="shell act__grid">
        <div className="act__content">
          <div data-reveal>
            <EntryLabel entry={act.entry} qualifier={act.qualifier} title="Kathmandu" />
          </div>

          <h1 id="arrival-name" className="hero__name" data-reveal>
            {greeting.name}
          </h1>

          <p className="hero__devanagari" lang="ne" data-reveal>
            {greeting.devanagari}
          </p>

          <p className="hero__thesis" data-reveal>
            {greeting.thesis}
          </p>

          <p className="hero__supporting measure" data-reveal>
            {greeting.supporting}
          </p>

          <div className="hero__actions" data-reveal>
            <a
              className="btn"
              href={greeting.resumeLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Résumé
              <span aria-hidden="true">↗</span>
            </a>
            <a className="link hero__repo" href={greeting.githubProfile} target="_blank" rel="noopener noreferrer">
              github.com/{greeting.githubUsername}
            </a>
          </div>

          <h2 className="sr-only">Find Rajendra</h2>
          <ul className="linklist hero__socials" data-reveal>
            {socialMediaLinks.map((social) => (
              <LinkRow
                key={social.name}
                href={social.link}
                name={social.name}
                handle={social.handle}
                icon={social.icon}
                brand={social.brand}
              />
            ))}
          </ul>

          <p className="cue figures" data-reveal>
            <span>↓ Scroll · eight entries</span>
            <span>
              {contactPageData.address.locality} · {contactPageData.address.coordinates}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
