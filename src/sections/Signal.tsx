/**
 * Signal — ENTRY 08. Address with a map link, phone, email, socials repeated.
 *
 * The page closes where it opened: the Core object fades back into the scene and
 * the ridge settles toward flat. The content closes the same loop — the last
 * thing on the page is how to reach the person the first thing named.
 */
import { contactPageData, socialMediaLinks, greeting, acts } from '../content';
import { EntryLabel } from '../components/EntryLabel';
import { LinkRow } from '../components/LinkRow';

const act = acts[7];
const { address, phone, email, note } = contactPageData;

export function Signal() {
  return (
    <section className="act" id={act.id} aria-labelledby="signal-title">
      <div className="shell act__grid">
        <div className="act__content">
          <header className="act__head" data-reveal>
            <EntryLabel entry={act.entry} qualifier={act.qualifier} title="Contact" />
            <h2 className="act__title" id="signal-title">
              Signal
            </h2>
            <p className="act__standfirst">{note}</p>
          </header>

          <dl className="defs" data-reveal>
            <div className="defs__row">
              <dt className="defs__key">Address</dt>
              <dd className="defs__val">
                <a
                  className="link"
                  href={address.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {address.display}
                </a>
                <br />
                <span className="figures defs__coords">{address.coordinates}</span>
              </dd>
            </div>

            <div className="defs__row">
              <dt className="defs__key">{phone.label}</dt>
              <dd className="defs__val figures">
                <a className="link" href={phone.link}>
                  {phone.value}
                </a>
              </dd>
            </div>

            <div className="defs__row">
              <dt className="defs__key">{email.label}</dt>
              <dd className="defs__val">
                <a className="link" href={email.link}>
                  {email.value}
                </a>
              </dd>
            </div>

            <div className="defs__row">
              <dt className="defs__key">Résumé</dt>
              <dd className="defs__val">
                <a
                  className="link"
                  href={greeting.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Drive ↗
                </a>
              </dd>
            </div>
          </dl>

          <h3 className="act__subtitle" data-reveal>
            Elsewhere
          </h3>
          <ul className="linklist" data-reveal>
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
            <span>{greeting.devanagari}</span>
            <span>
              <a className="link" href={greeting.portfolioRepository} target="_blank" rel="noopener noreferrer">
                Source of this page ↗
              </a>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
