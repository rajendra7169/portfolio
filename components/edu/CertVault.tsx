// Certifications as holographic trading cards: dealt from a stack, foil that
// follows the cursor, and a flip to the back for course details.
// Layers: li (deal) > .cv-tilt (cursor tilt) > button > .cv-inner (CSS flip).
import Icon from "@/components/Icon";
import { Chars } from "@/components/Motion";
import { certifications } from "@/lib/content";
import CertVaultMotion from "./CertVaultMotion";

function Logo({ logo, className }: { logo: string; className: string }) {
  return logo.startsWith("/") ? (
    // eslint-disable-next-line @next/next/no-img-element -- small static logo
    <img src={logo} alt="" className={className} />
  ) : (
    <Icon icon={logo} className={className} />
  );
}

export default function CertVault() {
  return (
    <CertVaultMotion>
      <header className="cv-head">
        <div>
          <p className="wd-eyebrow">✦ The vault · {certifications.length} cards</p>
          <h2 className="cv-h2" id="certifications">
            <Chars text="Certifications" />
          </h2>
        </div>
        <p className="cv-hint">
          <span className="cv-hint-fine">Hover to tilt · click a card to flip it</span>
          <span className="cv-hint-touch">Tap a card to flip it</span>
        </p>
      </header>

      <ul className="cv-grid">
        {certifications.map((c, i) => (
          <li className="cv-card" key={c.title} style={{ "--brand": c.color } as React.CSSProperties}>
            <div className="cv-tilt">
              <button type="button" className="cv-flip" aria-pressed="false" aria-label={`${c.title} by ${c.by}. Show details`} data-cursor="Flip">
                <span className="cv-inner">
                  <span className="cv-face cv-front">
                    <span className="cv-art">
                      <span className="cv-no">No. {String(i + 1).padStart(2, "0")}/{String(certifications.length).padStart(2, "0")}</span>
                      <Logo logo={c.logo} className="cv-logo" />
                      <span className="cv-rarity" aria-hidden="true">
                        ✦✦✦
                      </span>
                    </span>
                    <span className="cv-body">
                      <span className="cv-tag">Certificate</span>
                      <b className="cv-title">{c.title}</b>
                      <small className="cv-by">- {c.by}</small>
                    </span>
                    <span className="cv-foil" aria-hidden="true" />
                  </span>
                  <span className="cv-face cv-back">
                    <span className="cv-seal" aria-hidden="true">
                      <Logo logo={c.logo} className="cv-seal-logo" />
                    </span>
                    <span className="cv-rows">
                      <span>
                        <small>Course</small>
                        <b>{c.title}</b>
                      </span>
                      <span>
                        <small>Instructor</small>
                        <b>{c.by}</b>
                      </span>
                      <span>
                        <small>Provider</small>
                        <b>{c.provider}</b>
                      </span>
                    </span>
                    <span className="cv-back-tag">✦ Certified learning ✦</span>
                    <span className="cv-foil" aria-hidden="true" />
                  </span>
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </CertVaultMotion>
  );
}
