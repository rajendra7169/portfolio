// A beginner's first year with Fitevo, day by day, and the app's eleven badges
// with the rules it really uses (lib/services/progress/badges.dart): the page
// scrolls through the year and each badge unlocks the day its rule is met.
// Shared by the server markup and the client counters, so both agree.

export const DAYS = 365;
// Training four days a week, Saturday off (Nepal's weekend); logging meals
// every day except a missed day early on and the Dashain holidays in autumn.
const TRAINS = (d: number) => [0, 1, 3, 5].includes(d % 7);
const LOGS = (d: number) => d !== 11 && !(d >= 262 && d <= 265);

export type Stats = { day: number; sessions: number; streak: number; volume: number; prs: number; best: number };

const table: Stats[] = [];
{
  let sessions = 0, streak = 0, volume = 0;
  for (let d = 0; d < DAYS; d++) {
    const active = LOGS(d);
    if (TRAINS(d) && active) {
      volume += 2400 + 25 * sessions; // each session moves a little more
      sessions++;
    }
    streak = active ? streak + 1 : 0;
    const prs = sessions < 2 ? 0 : Math.floor(4 * Math.sqrt(sessions)) - 4;
    const best = Math.round(50 + 60 * (1 - Math.exp(-sessions / 60))); // squat, estimated 1RM in kg
    table.push({ day: d + 1, sessions, streak, volume, prs, best });
  }
}
export const statsOn = (d: number) => table[Math.max(0, Math.min(DAYS - 1, Math.floor(d)))];

// The badges: name and description as the app words them, a Material icon,
// and the rule. `earned` reads the stats for a day. Icons are keys of BADGE_ICONS.
export const BADGES: { id: string; name: string; desc: string; icon: string; earned: (s: Stats) => boolean }[] = [
  { id: "first_meal", name: "First bite", desc: "Log your first meal.", icon: "restaurant", earned: () => true },
  { id: "first_workout", name: "First lift", desc: "Finish your first workout.", icon: "fitness", earned: (s) => s.sessions >= 1 },
  { id: "first_pr", name: "New PR", desc: "Hit your first personal record.", icon: "trophy", earned: (s) => s.prs >= 1 },
  { id: "streak_7", name: "7-day streak", desc: "Stay active 7 days in a row.", icon: "fire", earned: (s) => s.streak >= 7 },
  { id: "ten_sessions", name: "10 sessions", desc: "Finish 10 workouts.", icon: "medal", earned: (s) => s.sessions >= 10 },
  { id: "pr_machine", name: "PR machine", desc: "Set 10 personal records.", icon: "trend", earned: (s) => s.prs >= 10 },
  { id: "streak_30", name: "30-day streak", desc: "A full month of consistency.", icon: "whatshot", earned: (s) => s.streak >= 30 },
  { id: "hundred_tonnes", name: "100 tonnes", desc: "Move 100,000 kg of total volume.", icon: "scale", earned: (s) => s.volume >= 100_000 },
  { id: "fifty_sessions", name: "50 sessions", desc: "Finish 50 workouts.", icon: "premium", earned: (s) => s.sessions >= 50 },
  { id: "century", name: "Century club", desc: "Reach a 100 kg estimated 1RM on any lift.", icon: "fitness", earned: (s) => s.best >= 100 },
  { id: "half_million", name: "Half a million", desc: "Move 500,000 kg of total volume.", icon: "diamond", earned: (s) => s.volume >= 500_000 },
];

/** The first day (0-based) each badge is earned. */
export const unlockDay = BADGES.map((b) => {
  for (let d = 0; d < DAYS; d++) if (b.earned(table[d])) return d;
  return DAYS;
});
