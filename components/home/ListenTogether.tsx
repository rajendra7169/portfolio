// Home section 4 — Listen Together. The globe is dust on the fixed canvas; this
// file is the server-rendered copy beside it (every word from lib/content.ts).
import Icon from "@/components/Icon";
import { Chars } from "@/components/Motion";
import { careerLog, contact, skills } from "@/lib/content";
import ListenTogetherMotion from "./ListenTogetherMotion";

export default function ListenTogether() {
  const server = careerLog.find((c) => c.scope === "server")!;
  // "Listen Together server" → the headline is its first two words; the body is the lead.
  const title = server.title.split(" ").slice(0, 2).join(" ");
  const cloud = skills[1];

  return (
    <ListenTogetherMotion>
      <div className="dg-copy dm-copy">
        <h2 className="dg-h2 dm-h2" id="listen-together">
          <Chars text={title} />
        </h2>
        <p className="dg-lead dm-lead">{server.body}</p>
        <p className="dg-coords dm-mono">
          <span className="dg-dot" aria-hidden="true" />
          {contact.coords}
        </p>
        <p className="dg-tag">{cloud.tagline}</p>
        <ul className="dg-logos" aria-label={`${cloud.short} tools`}>
          {cloud.techs.map((t) => (
            <li className="dg-ic" key={t.name} tabIndex={0}>
              <Icon icon={t.icon} color={t.color} />
              <span className="tech-tip" role="tooltip">
                {t.name}
              </span>
              <span className="sr-only">{t.name}</span>
            </li>
          ))}
        </ul>
        <ul className="points dg-points">
          {cloud.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </ListenTogetherMotion>
  );
}
