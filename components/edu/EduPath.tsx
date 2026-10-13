// "Degrees Received" as the journey it was. Desktop: a pinned horizontal track
// with a wave path, a rider and a year counter; the degree cards, with the
// story between them (the moments), and one pen that travels the whole way,
// writing each in turn. Phones: the same, as a vertical timeline.
import { Chars } from "@/components/Motion";
import { TransitionLink } from "@/components/PageTransition";
import { journey, paperStop, pathMoments, schoolStop, type PathMoment, type PathStop } from "@/lib/content";
import EduPathMotion from "./EduPathMotion";
import { MOMENTS, PenTools } from "./Moments";
import { SCENES } from "./Scenes";

const STOPS: PathStop[] = [
  ...(schoolStop ? [schoolStop] : []),
  ...journey.map((j) => ({
    year: j.year,
    logo: j.degree.logo,
    title: j.degree.school,
    subtitle: j.degree.degree,
    duration: j.degree.duration,
    points: j.degree.points,
    links: [{ label: "Visit Website", href: j.degree.url }],
    stamp: j.stamp,
    scene: j.scene,
  })),
  paperStop,
];

// Each stop, then the moments that follow it.
type Panel = { stop: PathStop; moment?: never } | { moment: PathMoment; stop?: never };
const PANELS: Panel[] = STOPS.flatMap((stop) => [{ stop }, ...pathMoments.filter((m) => m.after === stop.scene).map((moment) => ({ moment }))]);
const YEARS = PANELS.map((p) => p.stop?.year ?? p.moment?.year).filter((y): y is number => y !== undefined);

function Scene({ name }: { name: PathStop["scene"] }) {
  const Drawn = SCENES[name];
  return <Drawn />;
}

function Moment({ m }: { m: PathMoment }) {
  const Drawn = MOMENTS[m.scene];
  return (
    <li className="ep-moment ep-panel" data-year={m.year}>
      <div className="ep-moment-text">
        <h3 className="ep-moment-title" data-v="fade" data-at="0">
          {m.title}
        </h3>
        <p className="ep-moment-line" data-v="fade" data-at="0.03">
          {m.line}
        </p>
        {m.link && (
          <TransitionLink className="btn ep-moment-link" href={m.link.href} data-v="fade" data-at="0.9">
            {m.link.label}
          </TransitionLink>
        )}
      </div>
      <figure className="ep-scene">
        <Drawn />
      </figure>
    </li>
  );
}

export default function EduPath() {
  return (
    <EduPathMotion>
      <header className="ep-head">
        <p className="wd-eyebrow">✦ The path · {STOPS[0].year} → now</p>
        <h2 className="ep-h2" id="degrees">
          <Chars text="Degrees Received" />
        </h2>
      </header>

      <div className="ep-viewport">
        <span className="ep-year" aria-hidden="true">
          {YEARS[0]}
        </span>
        <div className="ep-track">
          <div className="ep-line" aria-hidden="true">
            <svg className="ep-svg">
              <path className="ep-path ep-path--bg" />
              <path className="ep-path ep-path--fg" />
            </svg>
            {YEARS.map((y, i) => (
              <span className="ep-node" key={i} data-i={i}>
                <b>{y}</b>
              </span>
            ))}
            <span className="ep-rider">🎓</span>
          </div>
          <span className="ep-vline" aria-hidden="true">
            <span className="ep-vfill" />
          </span>

          <ol className="ep-stops">
            {PANELS.map(({ stop: s, moment }) =>
              moment ? (
                <Moment key={moment.scene} m={moment} />
              ) : (
                <li className="ep-stop ep-panel" key={s.title} data-year={s.year}>
                  <article className="ep-card">
                    <header className="ep-card-head">
                      <span className="ep-logo">
                        {/* eslint-disable-next-line @next/next/no-img-element -- small static logo */}
                        <img src={s.logo} alt="" />
                      </span>
                      <div>
                        <p className="ep-when">{s.duration}</p>
                        <h3 className="ep-school">{s.title}</h3>
                        <p className="ep-degree">{s.subtitle}</p>
                      </div>
                    </header>
                    <figure className="ep-scene">
                      <Scene name={s.scene} />
                    </figure>
                    <ul className="sr-only">
                      {s.points.map((p) => (
                        <li key={p.slice(0, 32)}>{p}</li>
                      ))}
                    </ul>
                    <div className="ep-links">
                      {s.links.map((l) => (
                        <a key={l.href} className="btn btn--soft" href={l.href} target="_blank" rel="noreferrer">
                          {l.label} <span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </div>
                    <span className="ep-stamp" aria-hidden="true">
                      <span className="ep-stamp-in">
                        <small>✦ {s.stamp[0]} ✦</small>
                        <b>{s.stamp[1]}</b>
                      </span>
                      <span className="ep-dust" />
                    </span>
                  </article>
                </li>
              ),
            )}
          </ol>
        </div>
      </div>
      <PenTools />
    </EduPathMotion>
  );
}
