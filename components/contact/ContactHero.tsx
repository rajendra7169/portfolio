// Contact hero: copyable contact rows and a live radar. The sweep pings each
// social channel (a blip) as it passes; blips are real links.
import Icon from "@/components/Icon";
import HeroField from "@/components/hero/HeroField";
import KtmClock from "@/components/hero/KtmClock";
import { contact, radarBlips, socials } from "@/lib/content";
import ContactHeroMotion from "./ContactHeroMotion";

const ROWS = [
  { key: "email", label: "Email", icon: "✉️", value: contact.email, href: `mailto:${contact.email}`, copy: contact.email },
  { key: "phone", label: "Phone", icon: "📞", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}`, copy: contact.phone },
  { key: "address", label: "Address", icon: "📍", value: contact.address, href: contact.maps, copy: contact.address },
];

export default function ContactHero() {
  return (
    <ContactHeroMotion>
      <div className="ch-bg" aria-hidden="true">
        <div className="hx-glow hx-glow--a" />
        <div className="hx-glow hx-glow--b" />
        <div className="hx-floor">
          <div className="hx-floor-grid" />
        </div>
        <HeroField />
      </div>

      <div className="ch-inner">
        <div className="ch-main">
          <p className="hx-eyebrow ch-eyebrow">
            <span aria-hidden="true">📡</span> Open a channel · replies within 24h
          </p>
          <h1 className="ch-title">
            <span className="sr-only">Contact Me</span>
            <span className="eh-title-clip" aria-hidden="true">
              <span className="hx-line hx-line--a ch-title-text">Contact Me</span>
            </span>
          </h1>
          <p className="ch-blurb">{contact.blurb}</p>

          <ul className="ch-rows">
            {ROWS.map((r) => (
              <li className="ch-row" key={r.key}>
                <span className="ch-row-icon" aria-hidden="true">
                  {r.icon}
                </span>
                <span className="ch-row-text">
                  <small>{r.label}</small>
                  <a href={r.href} target={r.key === "address" ? "_blank" : undefined} rel="noreferrer">
                    {r.value}
                  </a>
                </span>
                <button type="button" className="ch-copy" data-copy={r.copy} aria-label={`Copy ${r.label.toLowerCase()}`}>
                  Copy
                </button>
              </li>
            ))}
          </ul>
          <p className="sr-only" aria-live="polite" data-copy-status />

          <div className="ch-ctas">
            <a className="btn" href={contact.resume} target="_blank" rel="noreferrer" data-magnetic>
              See My Resume <span aria-hidden="true">↗</span>
            </a>
            <a className="btn btn--ghost" href={contact.maps} target="_blank" rel="noreferrer" data-magnetic>
              Visit on Google Maps <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="ch-stage">
          <div className="ch-radar-depth" data-depth="0.4">
            <div className="ch-radar">
              <svg className="ch-grid" viewBox="0 0 400 400" aria-hidden="true">
                {[196, 150, 104, 58].map((r) => (
                  <circle key={r} cx="200" cy="200" r={r} className="ch-ring" />
                ))}
                <line x1="200" y1="4" x2="200" y2="396" className="ch-axis" />
                <line x1="4" y1="200" x2="396" y2="200" className="ch-axis" />
                {Array.from({ length: 72 }, (_, i) => (
                  <line
                    key={i}
                    x1="200"
                    y1={i % 6 === 0 ? 4 : 9}
                    x2="200"
                    y2="16"
                    className={`ch-tick${i % 6 === 0 ? " ch-tick--major" : ""}`}
                    transform={`rotate(${i * 5} 200 200)`}
                  />
                ))}
              </svg>
              <span className="ch-sweep" aria-hidden="true" />

              <nav className="ch-blips" aria-label="Social channels">
                {socials.map((s) => {
                  const b = radarBlips[s.name];
                  const rad = (b.angle * Math.PI) / 180;
                  return (
                    <a
                      key={s.name}
                      className="ch-blip"
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      data-angle={b.angle}
                      aria-label={s.name}
                      style={{
                        left: `${50 + Math.sin(rad) * b.r * 50}%`,
                        top: `${50 - Math.cos(rad) * b.r * 50}%`,
                        "--brand": s.color,
                      } as React.CSSProperties}
                    >
                      <span className="ch-blip-in">
                        <Icon icon={s.icon} />
                      </span>
                      <span className="ch-blip-label" aria-hidden="true">
                        {s.name}
                      </span>
                    </a>
                  );
                })}
              </nav>

              <div className="ch-avatar">
                <span className="ch-ping" aria-hidden="true" />
                <span className="ch-ping ch-ping--2" aria-hidden="true" />
                <span className="ch-avatar-img">
                  {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized by `npm run images` */}
                  <img src="/images/contact-800.webp" alt="Rajendra Pandey" draggable={false} />
                </span>
                <span className="ch-onair" aria-hidden="true">
                  <i /> On air
                </span>
              </div>
            </div>
          </div>

          <div className="ch-read ch-read--a" aria-hidden="true">
            <div className="hx-chip ch-chip">
              <span className="hx-chip-icon">🛰️</span>
              <span>
                <b>Kathmandu</b>
                <small>{contact.coords}</small>
              </span>
            </div>
          </div>
          <div className="ch-read ch-read--b" aria-hidden="true">
            <div className="hx-chip ch-chip">
              <span className="hx-chip-icon hx-chip-icon--live" />
              <span>
                <b>
                  <KtmClock /> NPT
                </b>
                <small>Replies &lt; 24h</small>
              </span>
            </div>
          </div>
          <div className="ch-read ch-read--c" aria-hidden="true">
            <div className="hx-chip ch-chip">
              <span className="hx-chip-icon">📶</span>
              <span>
                <b>{socials.length} channels open</b>
                <small>Tap a blip to connect</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </ContactHeroMotion>
  );
}
