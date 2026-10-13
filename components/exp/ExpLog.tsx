// Experience body: positions as `git branch` (the current job checked out as
// HEAD, the rest as branches that are active, merged or done), then the work as
// `git log --graph` with a sticky terminal (desktop) running `git show` for the
// commit in view.
import Icon from "@/components/Icon";
import { Chars } from "@/components/Motion";
import { careerLog, span, work, type Commit, type Position, type Tech } from "@/lib/content";
import ExpLogMotion from "./ExpLogMotion";
import Tenure from "./Tenure";

const LANE_NAME: Record<Commit["lane"], string> = { main: "main", side: "side-projects", blazify: "blazify" };
const STATUS: Record<Position["status"], string> = { head: "HEAD", active: "active", merged: "merged", done: "completed" };

/** Whole months between two ISO dates, rounded: "3 months". */
function months(p: Position) {
  const [a, b] = [new Date(`${p.start}T00:00:00Z`), new Date(`${p.end}T00:00:00Z`)];
  const n = Math.max(1, Math.round((b.getTime() - a.getTime()) / (30.44 * 864e5)));
  return `${n} month${n === 1 ? "" : "s"}`;
}
const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function Stack({ techs }: { techs: Tech[] }) {
  return (
    <ul className="xp-stack" aria-label="Built with">
      {techs.map((t) => (
        <li key={t.name}>
          <Icon icon={t.icon} color={t.color} />
          {t.name}
        </li>
      ))}
    </ul>
  );
}
function Org({ p }: { p: Position }) {
  return (
    <p className="xp-org">
      {p.website ? (
        <a href={p.website} target="_blank" rel="noreferrer" className="xg-branch-site">
          {p.org}
        </a>
      ) : (
        p.org
      )}
      <span aria-hidden="true"> · </span>
      {p.where}
    </p>
  );
}

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
  const now = work.find((p) => p.status === "head")!;
  const merged = work.find((p) => p.status === "merged");
  const others = work.filter((p) => p !== now);

  return (
    <ExpLogMotion>
      <section className="xg-section" aria-labelledby="positions">
        <header className="xg-head">
          <p className="wd-eyebrow">✦ $ git branch -v</p>
          <h2 className="xg-h2" id="positions">
            <Chars text="Positions" />
          </h2>
        </header>
        {/* The job checked out right now: HEAD. */}
        <article className="xp-now" aria-labelledby="xp-now-title">
          <div className="xp-now-in">
            <p className="xp-ref">
              <span className="xp-star" aria-hidden="true">
                *
              </span>
              <b>{now.branch}</b>
              <span className="xp-pill xp-pill--head">HEAD</span>
              <span className="xp-live">
                <i aria-hidden="true" /> current
              </span>
            </p>
            <div className="xp-now-top">
              <div>
                <h3 className="xp-title" id="xp-now-title">
                  {now.title}
                </h3>
                <Org p={now} />
              </div>
              <p className="xp-tenure">
                <Tenure start={now.start} />
                <time>
                  {span(now)}
                  {now.website && (
                    <a href={now.website} target="_blank" rel="noreferrer" className="xg-branch-url">
                      {host(now.website)}
                    </a>
                  )}
                </time>
              </p>
            </div>
            <p className="xp-summary">{now.summary}</p>
            <ul className="xp-areas">
              {(now.areas ?? []).map((a) => (
                <li className="xp-area" key={a.name}>
                  <span className="xp-area-icons" aria-hidden="true">
                    {a.stack.map((t) => (
                      <Icon key={t.name} icon={t.icon} color={t.color} />
                    ))}
                  </span>
                  <h4>{a.name}</h4>
                  <p>{a.text}</p>
                </li>
              ))}
            </ul>
            {merged && (
              <p className="xp-merge">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v5.256a2.25 2.25 0 1 0 1.5 0V9.4A3.98 3.98 0 0 0 8 10.75h1.878a2.25 2.25 0 1 0 0-1.5H8A2.5 2.5 0 0 1 5.5 6.75v-.128A2.25 2.25 0 0 0 5 5.372ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm7.5-3.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                </svg>
                <span>
                  Started here as an intern: <a href={`#${merged.branch.replace("/", "-")}`}>{merged.branch}</a>, merged into this branch on{" "}
                  {new Date(`${merged.end}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}.
                </span>
              </p>
            )}
          </div>
        </article>

        {/* Everything else: active, merged or done. */}
        <ul className="xp-others">
          {others.map((p) => (
            <li className={`xp-card xp-card--${p.status}`} id={p.branch.replace("/", "-")} key={p.branch}>
              <p className="xp-ref">
                <span className="xp-star" aria-hidden="true" />
                <b>{p.branch}</b>
                <span className={`xp-pill xp-pill--${p.status}`}>{STATUS[p.status]}</span>
              </p>
              <h3 className="xp-title xp-title--card">{p.title}</h3>
              <Org p={p} />
              <p className="xp-when">
                <time>{span(p)}</time>
                <span aria-hidden="true"> · </span>
                {p.end ? months(p) : <Tenure start={p.start} />}
              </p>
              <p className="xp-card-summary">{p.summary}</p>
              <ul className="points points--dark xp-points">
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <Stack techs={p.stack} />
              {p.merged && <p className="xp-merged">{p.merged}</p>}
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
