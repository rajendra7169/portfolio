// "Transmit a message": a composer beside Rajendra's phone. The phone's inbox
// shows the message as you write it; sending folds it into a paper plane that
// flies into that inbox, then your email app opens with everything filled in.
// No server involved — it's a mailto: link.
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
        <p className="cm-sub" data-anim="up" data-delay="0.2">Pick a topic and write a line: it shows up on his phone as you type. Send it, and your email app opens with it ready to go.</p>
      </header>

      <ComposerForm email={contact.email} topics={contact.topics} />
    </section>
  );
}
