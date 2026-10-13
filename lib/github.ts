// The GitHub contribution calendar for the Projects page: read from the public
// profile page (no token needed), refreshed every six hours. If GitHub can't
// be reached, the copy saved in lib/github-contributions.json (written by
// `npm run github`) stands in, so the page never breaks.
import saved from "./github-contributions.json";

export const GITHUB_USER = "rajendra7169";

export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Calendar = { user: string; total: number; days: Day[]; fetched: string };

/** The calendar's days, oldest first, out of the HTML GitHub serves for /users/<name>/contributions. */
export function parseCalendar(html: string, user = GITHUB_USER): Calendar | null {
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^([\d,]+) contributions?/.exec(m[2].trim());
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }
  const days: Day[] = [];
  for (const m of html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d\d-\d\d)"[^>]*>/g)) {
    const tag = m[0];
    const id = /\bid="([^"]+)"/.exec(tag)?.[1] ?? "";
    const level = Number(/\bdata-level="(\d)"/.exec(tag)?.[1] ?? 0) as Day["level"];
    days.push({ date: m[1], count: counts.get(id) ?? (level ? 1 : 0), level });
  }
  if (days.length < 300) return null;
  days.sort((a, b) => a.date.localeCompare(b.date));
  const stated = /([\d,]+)\s+contributions?\s+in the last year/.exec(html)?.[1];
  const total = stated ? Number(stated.replace(/,/g, "")) : days.reduce((s, d) => s + d.count, 0);
  return { user, total, days, fetched: new Date().toISOString() };
}

export async function contributions(): Promise<Calendar> {
  try {
    const res = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
      headers: { "User-Agent": "rajendrapandey.info.np", Accept: "text/html" },
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const cal = parseCalendar(await res.text());
      if (cal) return cal;
    }
  } catch {}
  return saved as Calendar;
}

export type Summary = {
  longest: { days: number; from: string; to: string };
  current: number;
  busiest: Day;
  busiestWeekday: number; // 0 = Sunday
  activeDays: number;
};

export function summarize(days: Day[]): Summary {
  let run = 0;
  let longest = { days: 0, from: "", to: "" };
  let start = "";
  for (const d of days) {
    if (d.count > 0) {
      if (!run) start = d.date;
      run++;
      if (run > longest.days) longest = { days: run, from: start, to: d.date };
    } else run = 0;
  }
  // The current streak may end yesterday: today's commits may still be coming.
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  const busiest = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  const byWeekday = [0, 0, 0, 0, 0, 0, 0];
  days.forEach((d) => (byWeekday[new Date(`${d.date}T00:00:00Z`).getUTCDay()] += d.count));
  return { longest, current, busiest, busiestWeekday: byWeekday.indexOf(Math.max(...byWeekday)), activeDays: days.filter((d) => d.count > 0).length };
}
