// Experience body: positions as `git branch`, then the work as `git log --graph`
// with a sticky terminal (desktop) running `git show` for the commit in view.
import { Chars } from "@/components/Motion";
import { careerLog, experience, type Commit } from "@/lib/content";
import ExpLogMotion from "./ExpLogMotion";

const LANE_NAME: Record<Commit["lane"], string> = { main: "main", side: "side-projects", blazify: "blazify" };
const BRANCHES = ["main", "blazify"] as const; // one per role, in order

/** "2026-07-15" → "Wed Jul 15 2026" (git's date style); "now" stays "now". */
function gitDate(iso: string) {
  if (iso === "now") return "now";
  const d = new Date(`${iso}T00:00:00Z`);
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", { ...o, timeZone: "UTC" });
  return `${part({ weekday: "short" })} ${part({ month: "short" })} ${part({ day: "2-digit" })} ${part({ year: "numeric" })}`;
}
const shortDate = (iso: string) =>
  iso === "now" ? "Now" : new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
const subject = (c: Commit) => `${c.type}${c.scope ? `(${c.scope})` : ""}: ${c.title}`;
const repoPath = (url?: string) => url?.replace("https://github.com/", "") ?? "local";

export default function ExpLog() {
  const last = careerLog.length - 1;

  return (
    <ExpLogMotion>
      <section className="xg-section" aria-labelledby="positions">
        <header className="xg-head">
          <p className="wd-eyebrow">✦ $ git branch -v</p>
          <h2 className="xg-h2" id="positions">
            <Chars text="Positions" />
          </h2>
        </header>
        <ul className="xg-branches">
          {experience.roles.map((r, i) => (
            <li className={`xg-branch xg-branch--${BRANCHES[i]}`} key={r.company}>
              <div className="xg-branch-in">
                <p className="xg-branch-ref">
                  <span aria-hidden="true">{i === 0 ? "*" : " "}</span>
                  <b>{BRANCHES[i]}</b>
                  <small>{r.when}</small>
                </p>
                <h3 className="xg-branch-title">{r.title}</h3>
                <p className="xg-branch-org">
                  {r.company} · {r.where}
                </p>
                <ul className="points points--dark xg-branch-points">
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="xg-section" aria-labelledby="history">
        <header className="xg-head">
          <p className="wd-eyebrow">✦ $ git log --graph --reverse</p>
          <h2 className="xg-h2" id="history">
            <Chars text="Commit history" />
          </h2>
          <p className="xg-legend" aria-hidden="true">
            <span className="xg-ref xg-ref--main">main</span>
            <span className="xg-ref xg-ref--blazify">blazify</span>
            <span className="xg-ref xg-ref--side">side-projects</span>
          </p>
        </header>

        <div className="xg-log">
          <aside className="xg-term" aria-hidden="true">
            <div className="wd-bar xg-term-bar">
              <span className="wd-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="wd-bar-title">git show — rajendra@ktm</span>
              <span className="wd-bar-live">
                <i /> live
              </span>
            </div>
            <div className="xg-term-body">
              {careerLog.map((c, i) => (
                <div className="xg-show" data-i={i} key={i}>
                  <p className="xg-line xg-line--cmd">
                    <span className="wd-prompt">$ </span>git show {i === last ? "HEAD" : `HEAD~${last - i}`}
                  </p>
                  <p className="xg-line xg-line--commit">
                    commit {repoPath(c.repo)}
                    {c.tag && <span className="xg-term-tag"> (tag: {c.tag})</span>}
                  </p>
                  <p className="xg-line">Author: Rajendra Pandey</p>
                  <p className="xg-line">Date:   {gitDate(c.date)}</p>
                  <p className="xg-line">Branch: {LANE_NAME[c.lane]}</p>
                  <p className="xg-line xg-line--subject">    {subject(c)}</p>
                  <p className="xg-line xg-line--body">{c.body}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="xg-graph">
            <svg className="xg-svg" aria-hidden="true">
              <path className="xg-lane xg-lane--side" />
              <path className="xg-lane xg-lane--blazify" />
              <path className="xg-lane xg-lane--main" />
            </svg>
            <span className="xg-ptr" aria-hidden="true">
              HEAD
            </span>
            <ol className="xg-commits">
              {careerLog.map((c, i) => (
                <li className={`xg-commit xg-commit--${c.lane}`} key={i} data-i={i}>
                  <span className="xg-dot" aria-hidden="true" />
                  <div className="xg-c-body">
                    <p className="xg-c-meta">
                      <time dateTime={c.date === "now" ? undefined : c.date}>{shortDate(c.date)}</time>
                      <span className={`xg-ref xg-ref--${c.lane}`}>{LANE_NAME[c.lane]}</span>
                      {c.tag && <span className="xg-tag">{c.tag}</span>}
                    </p>
                    <h3 className="xg-c-msg">
                      <span className="xg-type">
                        {c.type}
                        {c.scope ? `(${c.scope})` : ""}:
                      </span>{" "}
                      {c.title}
                    </h3>
                    <p className="xg-c-text">{c.body}</p>
                    {(c.repo || c.live) && (
                      <p className="xg-c-links">
                        {c.repo && (
                          <a href={c.repo} target="_blank" rel="noreferrer">
                            Source <span aria-hidden="true">↗</span>
                          </a>
                        )}
                        {c.live && (
                          <a href={c.live} target="_blank" rel="noreferrer">
                            Live <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </ExpLogMotion>
  );
}
