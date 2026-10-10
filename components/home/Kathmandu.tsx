// Home §4.2 — Made in Kathmandu. The dust is Nepal (formed at the end of the
// hero pin) with one orange dot landing on Kathmandu; a canvas line joins that
// dot to the headline. Server-rendered copy; KathmanduMotion drives the rest.
import { Chars } from "@/components/Motion";
import { TransitionLink } from "@/components/PageTransition";
import { contact, experience } from "@/lib/content";
import KathmanduMotion from "./KathmanduMotion";

export default function Kathmandu() {
  const role = experience.roles[0];
  const place = contact.address.split(",").slice(0, 2).join(",").trim();

  return (
    <KathmanduMotion tip={place}>
      <div className="dk-copy dm-copy">
        <p className="dm-kicker dk-kicker">02 — Home base</p>
        <h2 className="dk-h2 dm-h2" id="made-in-kathmandu">
          <span className="dk-anchor">
            <Chars text="Made in Kathmandu." />
          </span>
        </h2>
        <p className="dk-coords dm-mono">
          <span className="dk-dot" aria-hidden="true" />
          <span className="dk-coords-text">{contact.coords}</span>
        </p>
        <p className="dk-intro dm-lead">{experience.intro}</p>
        <p className="dk-label dm-mono">
          {role.title} · {role.company} · {role.when}
        </p>
        <p className="dk-links">
          <TransitionLink className="btn btn--soft" href="/experience" data-magnetic>
            Experience <span aria-hidden="true" className="btn-arrow">→</span>
          </TransitionLink>
        </p>
      </div>
    </KathmanduMotion>
  );
}
