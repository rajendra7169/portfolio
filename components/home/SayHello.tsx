// Section 7 — Say hello (spec §4.7). Server-rendered: every word is in the
// markup so the page reads without JS. The dust (kurta) lives on the fixed
// canvas in the empty right column; SayHelloMotion drives it.
import { contact } from "@/lib/content";
import { Chars } from "@/components/Motion";
import { TransitionLink } from "@/components/PageTransition";
import { SocialLinks } from "@/components/Bits";
import SayHelloMotion from "./SayHelloMotion";

export default function SayHello() {
  return (
    <SayHelloMotion>
      <div className="dy-copy dm-copy">
        <h2 className="dy-h2 dm-h2" id="say-hello">
          <Chars text="Say hello." />
        </h2>
        <p className="dy-blurb dm-lead">{contact.blurb}</p>
        <div className="dy-ctas">
          <TransitionLink className="btn" href="/contact">
            Contact me <span className="btn-arrow">→</span>
          </TransitionLink>
          <a className="btn btn--ghost" href={contact.resume} target="_blank" rel="noreferrer">
            Resume <span className="btn-arrow">↗</span>
          </a>
        </div>
        <div className="dy-socials">
          <SocialLinks anim={false} />
        </div>
        <a className="dy-email dm-mono" href={`mailto:${contact.email}`}>
          {contact.email}
        </a>
        <p className="dy-foot">
          {/* The HUD name tag docks into this slot at max scroll (HudMotion owns that tween). */}
          <span className="dy-foot-slot" aria-hidden="true" />
          <span className="dy-foot-text dm-mono">— made in Kathmandu</span>
        </p>
      </div>
    </SayHelloMotion>
  );
}
