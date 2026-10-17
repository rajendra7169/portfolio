// Contact hero: copyable contact rows and a clock whose hours are the social
// channels. Its one thick hand carries the name of the channel it points at, and
// the whole clock takes that channel's colours. Drag the hand, hover or tab to a
// channel, or let it tick round by itself; the channels are real links.
import Icon from "@/components/Icon";
import HeroField from "@/components/hero/HeroField";
import KtmClock from "@/components/hero/KtmClock";
import { TransitionLink } from "@/components/PageTransition";
import { contact, socials } from "@/lib/content";
import ContactHeroMotion from "./ContactHeroMotion";

// Each channel's colours on the clock: the brand colour for the hand and the
// bezel, and a second one for the glow. Black brands get a soft grey glow.
const TINT: Record<string, [string, string]> = {
  GitHub: ["#24292f", "#8c959f"],
  LinkedIn: ["#0a66c2", "#57a8ff"],
  YouTube: ["#ff0033", "#ff7a8a"],
  Email: ["#ea4335", "#fbbc05"],
  X: ["#0f1419", "#8b98a5"],
  Facebook: ["#1877f2", "#69a9ff"],
  Instagram: ["#dd2a7b", "#f58529"],
};
const handle = (href: string) => href.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?[^/]+\//, "").replace(/\/$/, "");
const HOUR = 360 / socials.length;

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
            <TransitionLink href={contact.resume} className="btn" data-magnetic>
              See my résumé
            </TransitionLink>
            <a className="btn btn--ghost" href={contact.maps} target="_blank" rel="noreferrer" data-magnetic>
              Visit on Google Maps <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="ch-stage" data-on="0" style={{ "--cc": TINT[socials[0].name][0], "--cc2": TINT[socials[0].name][1] } as React.CSSProperties}>
          <div className="ch-radar-depth" data-depth="0.4">
            <div className="cc">
              <span className="cc-bezel" aria-hidden="true" />
              <div className="cc-face" aria-hidden="true">
                <span className="cc-wedge" />
                <svg className="cc-ticks" viewBox="0 0 400 400">
                  {Array.from({ length: 60 }, (_, i) => (
                    <line key={i} x1="200" y1={i % 5 === 0 ? 10 : 14} x2="200" y2="22" className={`cc-tick${i % 5 === 0 ? " cc-tick--major" : ""}`} transform={`rotate(${i * 6} 200 200)`} />
                  ))}
                </svg>
                <p className="cc-time">
                  <KtmClock />
                  <small>Kathmandu</small>
                </p>
              </div>
              <span className="cc-sec" aria-hidden="true">
                <i />
              </span>
              <div className="cc-hand" aria-hidden="true" data-cursor="Drag">
                <span className="cc-hand-paint" />
                <b className="cc-hand-name">{socials[0].name}</b>
              </div>

              <nav className="cc-marks" aria-label="Social channels">
                {socials.map((s, i) => {
                  const rad = (i * HOUR * Math.PI) / 180;
                  const [c, c2] = TINT[s.name] ?? [s.color ?? "#0e2a52", "#93d3f3"];
                  return (
                    <a
                      key={s.name}
                      className={`cc-mark${i === 0 ? " is-on" : ""}`}
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      data-i={i}
                      data-c={c}
                      data-c2={c2}
                      data-name={s.name}
                      data-handle={handle(s.href)}
                      aria-label={s.name}
                      style={{ left: `${50 + Math.sin(rad) * 39.5}%`, top: `${50 - Math.cos(rad) * 39.5}%`, "--brand": c } as React.CSSProperties}
                    >
                      <span className="cc-mark-in">
                        <Icon icon={s.icon} />
                      </span>
                    </a>
                  );
                })}
              </nav>

              <div className="ch-avatar">
                <span className="ch-avatar-img">
                  {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized by `npm run images` */}
                  <img src="/images/rajendra-pandey-contact-800.webp" alt="Rajendra Pandey, software developer in Kathmandu" draggable={false} />
                </span>
                <span className="ch-onair" aria-hidden="true">
                  <i /> On air
                </span>
              </div>
              <span className="cc-glass" aria-hidden="true" />
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
          <div className="ch-read ch-read--c">
            <a className="hx-chip ch-chip cc-now" href={socials[0].href} target="_blank" rel="noreferrer">
              <span className="hx-chip-icon cc-now-dot" aria-hidden="true" />
              <span>
                <small>The hand points at</small>
                <b>
                  <span className="cc-now-name">{socials[0].name}</span> <span aria-hidden="true">↗</span>
                </b>
                <small className="cc-now-handle">{handle(socials[0].href)}</small>
              </span>
            </a>
          </div>
        </div>
      </div>
    </ContactHeroMotion>
  );
}
