// "Transmit a message": a composer that folds your message into a paper plane,
// flies it into the envelope in the illustration, then opens your email app
// with everything filled in. No server involved — it's a mailto: link.
import { Floaties } from "@/components/Bits";
import { Chars } from "@/components/Motion";
import { contact } from "@/lib/content";
import ComposerForm from "./ComposerForm";

export default function Transmit() {
  return (
    <section className="cm section" aria-labelledby="transmit">
      <header className="cm-head">
        <p className="wd-eyebrow">✦ Transmit</p>
        <h2 className="cm-h2" id="transmit" data-anim="chars">
          <Chars text="Send a message" />
        </h2>
        <p className="cm-sub" data-anim="up" data-delay="0.2">Pick a topic, write a line, and your email app opens with it ready to send.</p>
      </header>

      <div className="cm-grid">
        <div className="cm-art" data-anim="left">
          <Floaties />
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG illustration */}
          <img src="/illustrations/contact.svg" alt="" className="cm-art-img" />
          {/* Where the plane lands: the envelope in the illustration. */}
          <span className="cm-target" aria-hidden="true" />
          <span className="cm-check" aria-hidden="true">
            ✓
          </span>
        </div>
        <ComposerForm email={contact.email} topics={contact.topics} />
      </div>
    </section>
  );
}
