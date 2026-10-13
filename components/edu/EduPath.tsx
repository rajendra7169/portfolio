// "Degrees Received" as a journey through time. Desktop: a pinned horizontal
// track with a wave path, a rider and a year counter. Phones: a vertical timeline.
import { Chars } from "@/components/Motion";
import { journey, paperStop, schoolStop, type PathStop } from "@/lib/content";
import EduPathMotion from "./EduPathMotion";
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

function Scene({ name }: { name: PathStop["scene"] }) {
  const Drawn = SCENES[name];
  return <Drawn />;
}

export default function EduPath() {
  return (
    <EduPathMotion>
      <header className="ep-head">
        <p className="wd-eyebrow">
          ✦ The path · {STOPS[0].year} → {STOPS[STOPS.length - 1].year}
        </p>
        <h2 className="ep-h2" id="degrees">
          <Chars text="Degrees Received" />
        </h2>
      </header>

      <div className="ep-viewport">
        <span className="ep-year" aria-hidden="true">
          {STOPS[0].year}
        </span>
        <div className="ep-track">
          <div className="ep-line" aria-hidden="true">
            <svg className="ep-svg">
              <path className="ep-path ep-path--bg" />
              <path className="ep-path ep-path--fg" />
            </svg>
            {STOPS.map((s, i) => (
              <span className="ep-node" key={i} data-i={i}>
                <b>{s.year}</b>
              </span>
            ))}
            <span className="ep-rider">🎓</span>
          </div>
          <span className="ep-vline" aria-hidden="true">
            <span className="ep-vfill" />
          </span>

          <ol className="ep-stops">
            {STOPS.map((s) => (
              <li className="ep-stop" key={s.title} data-year={s.year}>
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
            ))}
          </ol>
          <div className="ep-end" aria-hidden="true">
            <span>Next up</span>
            <b>Certifications ↓</b>
          </div>
        </div>
      </div>
    </EduPathMotion>
  );
}
