// The bottom of the Projects page: the last year on GitHub as a contribution
// calendar, read from the public profile (lib/github.ts). It fills in week by
// week as it scrolls into view, a HEAD marker carrying the date along the top
// (CommitsMotion.tsx), and ends on the year's streaks and busiest day.
import type { CSSProperties } from "react";
import { SectionTitle } from "@/components/Bits";
import { contributions, summarize, type Day } from "@/lib/github";
import CommitsMotion from "./CommitsMotion";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
const short = (iso: string) => `${day(iso).getUTCDate()} ${MONTHS[day(iso).getUTCMonth()]}`;

export default async function Commits() {
  const cal = await contributions();
  const s = summarize(cal.days);
  // Columns are weeks, Sunday on top, as on GitHub.
  const lead = day(cal.days[0].date).getUTCDay();
  const cells: (Day | null)[] = [...Array<null>(lead).fill(null), ...cal.days];
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  // A month's label sits over the week that holds its 1st; the month the calendar
  // opens in gets one too, if there's room before the next.
  const months: [number, string][] = [];
  weeks.forEach((wk, w) => {
    const first = wk.find((d) => d && day(d.date).getUTCDate() === 1);
    if (first) months.push([w, MONTHS[day(first.date).getUTCMonth()]]);
  });
  if (!months.length || months[0][0] >= 3) months.unshift([0, MONTHS[day(cal.days[0].date).getUTCMonth()]]);
  const last = cal.days[cal.days.length - 1];

  return (
    <CommitsMotion>
      <SectionTitle id="gc-title">A year of commits</SectionTitle>
      <p className="section-sub" data-anim="up">
        {cal.total.toLocaleString("en")} contributions in the last year, on GitHub as {cal.user}.
      </p>

      <div className="gc-card" data-anim="up">
        <div className="gc-scroll">
          <div
            className="gc-cal is-end"
            style={{ "--weeks": weeks.length } as CSSProperties}
            role="img"
            aria-label={`${cal.total} contributions in the last year. Longest streak ${s.longest.days} days; busiest day ${s.busiest.count} contributions on ${short(s.busiest.date)}.`}
          >
            <span className="gc-head" aria-hidden="true">
              <b>HEAD</b>
              <span className="gc-head-date">{short(last.date)}</span>
            </span>
            <div className="gc-months" aria-hidden="true">
              {months.map(([w, name]) => (
                <span key={`${w}${name}`} style={{ "--w": w } as CSSProperties}>
                  {name}
                </span>
              ))}
            </div>
            <div className="gc-wdays" aria-hidden="true">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            <div className="gc-grid" aria-hidden="true">
              {weeks.map((wk, w) => (
                <div className="gc-week" key={w}>
                  {wk.map((d, i) =>
                    d ? (
                      <i key={d.date} data-l={d.level} data-c={d.count} data-d={short(d.date)} className={d.date === s.busiest.date ? "is-top" : undefined} />
                    ) : (
                      <i key={`x${i}`} className="is-blank" />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="gc-foot">
          <span className="gc-legend" aria-hidden="true">
            Less
            {[0, 1, 2, 3, 4].map((l) => (
              <i key={l} data-l={l} />
            ))}
            More
          </span>
          <dl className="gc-stats">
            <div>
              <dt>Longest streak</dt>
              <dd>
                <b data-to={s.longest.days}>{s.longest.days}</b> days
                <small>
                  {short(s.longest.from)} – {short(s.longest.to)}
                </small>
              </dd>
            </div>
            <div>
              <dt>Current streak</dt>
              <dd>
                <b data-to={s.current}>{s.current}</b> {s.current === 1 ? "day" : "days"}
              </dd>
            </div>
            <div>
              <dt>Busiest day</dt>
              <dd>
                <b data-to={s.busiest.count}>{s.busiest.count}</b> on {short(s.busiest.date)}
              </dd>
            </div>
            <div>
              <dt>Most active on</dt>
              <dd>
                <b>{WEEKDAYS[s.busiestWeekday]}s</b>
              </dd>
            </div>
          </dl>
        </div>
        <span className="gc-tip" aria-hidden="true" />
      </div>

      <div className="center" data-anim="up">
        <a className="btn" href={`https://github.com/${cal.user}`} target="_blank" rel="noreferrer" data-magnetic>
          More on GitHub
        </a>
      </div>
    </CommitsMotion>
  );
}
