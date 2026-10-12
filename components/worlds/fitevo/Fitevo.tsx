// Fitevo's world: one day, one ring. The hero is the app's calorie ring with
// its macros inside, fed by the one-sentence input; then a day runs from
// morning to night through the real screens, a personal record goes off,
// the badges unlock, and the plan for the day gets ticked off.
// Fitevo's own palette (its warm dark theme) and type (Plus Jakarta Sans).
import { Plus_Jakarta_Sans } from "next/font/google";
import Icon from "@/components/Icon";
import { AppTile, Phone, Shot } from "@/components/proj/Devices";
import { iconOf, nextProject, shot, type Project } from "@/lib/projects";
import WorldNext from "../WorldNext";
import FitevoMotion from "./FitevoMotion";
import { BADGE_ICONS } from "./badge-icons";
import { BADGES, DAYS, statsOn, unlockDay } from "./journey";
import "./fitevo.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--fv-font", display: "swap" });

// The demo profile's real targets from the app's Today screen.
export const TARGET = { kcal: 2431, p: 109, c: 362, f: 61 };
const R = { kcal: 182, p: 150, c: 126, f: 102 };
const ring = (r: number) => 2 * Math.PI * r;

// When each screen happens in a day.
const DAY = ["06:50", "08:05", "17:30", "18:05", "19:00", "19:05", "21:00", "22:00"];

// Strength tiers, as the PR page shows them (bodyweight multiples for a lift).
const TIERS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];

export default function Fitevo({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  const day = p.phone ?? [];

  return (
    <FitevoMotion className={`w-fv ${jakarta.variable}`}>
      {/* ── The ring ───────────────────────────────────────────────────── */}
      <section className="fv-hero">
        <div className="fv-hero-copy">
          <p className="fv-kicker">
            <AppTile p={p} className="fv-kicker-tile" />
            {p.kind}
          </p>
          <h1 className="fv-title">
            <span className="sr-only">{p.name}</span>
            <span aria-hidden="true">Fitevo</span>
          </h1>
          <p className="fv-tagline">{p.tagline}</p>
          <div className="fv-ask">
            <span className="fv-ask-spark" aria-hidden="true">
              ✦
            </span>
            <span className="fv-ask-text" aria-live="off">
              2 rotis and a bowl of dal
            </span>
            <span className="fv-ask-caret" aria-hidden="true" />
            <span className="fv-ask-send" aria-hidden="true">
              ↑
            </span>
          </div>
          <ul className="fv-ask-out" aria-hidden="true" />
          <p className="fv-lede">{p.summary}</p>
          <div className="fv-links">
            {p.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={`fv-link${l.primary ? " is-primary" : ""}`} data-magnetic>
                <Icon icon="simple-icons:github" /> {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="fv-rings" role="img" aria-label={`Today's calorie ring: ${TARGET.kcal} kcal target, with protein, carbs and fat inside`}>
          <svg viewBox="0 0 400 400" className="fv-rings-svg">
            {(["kcal", "p", "c", "f"] as const).map((k) => (
              <g key={k} className={`fv-r fv-r-${k}`}>
                <circle cx="200" cy="200" r={R[k]} className="fv-r-track" />
                <circle cx="200" cy="200" r={R[k]} className="fv-r-fill" strokeDasharray={ring(R[k])} strokeDashoffset={ring(R[k])} data-c={ring(R[k])} />
              </g>
            ))}
          </svg>
          <div className="fv-rings-core">
            <small>Calories left</small>
            <b className="fv-left">{TARGET.kcal}</b>
            <small>of {TARGET.kcal} target</small>
          </div>
          <ul className="fv-macros">
            {(
              [
                ["p", "Protein"],
                ["c", "Carbs"],
                ["f", "Fat"],
              ] as const
            ).map(([k, name]) => (
              <li key={k} className={`fv-macro fv-macro-${k}`}>
                <i aria-hidden="true" />
                {name} <b data-k={k}>{TARGET[k]} g</b> left
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── A day with Fitevo ──────────────────────────────────────────── */}
      <section className="fv-day" aria-labelledby="fv-day">
        <div className="fv-day-copy">
          <h2 className="fv-h2" id="fv-day">
            A day with Fitevo
          </h2>
          <p className="fv-clock" aria-hidden="true">
            {DAY[0]}
          </p>
          <ol className="fv-day-list">
            {day.map((s, i) => (
              <li key={s.img} className={`fv-day-item${i === 0 ? " is-on" : ""}`}>
                <time>{DAY[i]}</time>
                <b>{s.title}</b>
                <span>{s.note}</span>
                <span className="fv-day-shot" aria-hidden="true">
                  <Shot m={shot(s.img)} />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="fv-day-stage" aria-hidden="true">
          <Phone model="android" top={shot(day[0].img).top} className="fv-day-phone">
            {day.map((s, i) => (
              <Shot key={s.img} m={shot(s.img)} className={`fv-shot${i === 0 ? " is-on" : ""}`} eager={i === 0} />
            ))}
          </Phone>
        </div>
        <div className="fv-day-bar" aria-hidden="true">
          <span>06:00</span>
          <span className="fv-day-track">
            <i />
            {day.map((s, i) => (
              <em key={s.img} style={{ left: `${((parseInt(DAY[i]) * 60 + parseInt(DAY[i].slice(3)) - 360) / (17 * 60)) * 100}%` }} />
            ))}
          </span>
          <span>23:00</span>
        </div>
      </section>

      {/* ── A new personal record ──────────────────────────────────────── */}
      <section className="fv-pr" aria-labelledby="fv-pr">
        <div className="fv-pr-burst" aria-hidden="true" />
        <p className="fv-pr-lift">Squat, 80 kg × 5, at 68 kg bodyweight</p>
        <h2 className="fv-pr-big" id="fv-pr">
          <span className="sr-only">New personal record: 1.4 times bodyweight</span>
          <span aria-hidden="true">
            <span className="fv-pr-num">1.4</span>× BW
          </span>
        </h2>
        <p className="fv-pr-note">New PR. Fitevo spots it from your sets, works out the one-rep max, and throws a full-screen party.</p>
        <div className="fv-tiers" aria-label="Strength tier: intermediate">
          <span className="fv-tiers-track">
            <i className="fv-tiers-fill" />
            <i className="fv-tiers-dot" />
          </span>
          <ol>
            {TIERS.map((t) => (
              <li key={t} className={t === "Intermediate" ? "is-you" : undefined}>
                {t}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── The badges: a first year, scrolled ─────────────────────────── */}
      <section className="fv-badges" aria-labelledby="fv-badges">
        <div className="fv-badges-copy">
          <h2 className="fv-h2" id="fv-badges">
            Eleven badges to earn
          </h2>
          <p className="fv-sub">A beginner&rsquo;s first year, scrolled. Each badge unlocks on the day its rule in the app is met.</p>
          <dl className="fv-year">
            <div>
              <dt>Day</dt>
              <dd>
                <b data-stat="day">{DAYS}</b>
              </dd>
            </div>
            <div>
              <dt>Workouts</dt>
              <dd>
                <b data-stat="sessions">{statsOn(DAYS - 1).sessions}</b>
              </dd>
            </div>
            <div>
              <dt>Streak</dt>
              <dd>
                <b data-stat="streak">{statsOn(DAYS - 1).streak}</b> days
              </dd>
            </div>
            <div>
              <dt>Moved</dt>
              <dd>
                <b data-stat="volume">{statsOn(DAYS - 1).volume.toLocaleString("en-US")}</b> kg
              </dd>
            </div>
            <div>
              <dt>PRs</dt>
              <dd>
                <b data-stat="prs">{statsOn(DAYS - 1).prs}</b>
              </dd>
            </div>
            <div>
              <dt>Best squat</dt>
              <dd>
                <b data-stat="best">{statsOn(DAYS - 1).best}</b> kg 1RM
              </dd>
            </div>
          </dl>
          <p className="fv-toast" aria-live="polite" />
        </div>
        <ul className="fv-medals">
          {BADGES.map((b, i) => (
            <li key={b.id} className="fv-medal" data-at={unlockDay[i]}>
              <span className="fv-medal-disc" aria-hidden="true">
                <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: BADGE_ICONS[b.icon] }} />
              </span>
              <b>{b.name}</b>
              <span className="fv-medal-desc">{b.desc}</span>
            </li>
          ))}
        </ul>
        <div className="fv-ruler" aria-hidden="true">
          <span className="fv-ruler-track">
            <i className="fv-ruler-fill" />
            {unlockDay.map((d, i) => (
              <span key={i} className="fv-ruler-pin" style={{ left: `${(d / (DAYS - 1)) * 100}%` }} />
            ))}
          </span>
          <span className="fv-ruler-months">
            {["Month 1", "3", "6", "9", "12"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </span>
        </div>
      </section>

      {/* ── Today's plan: what Fitevo does ─────────────────────────────── */}
      <section className="fv-plan" aria-labelledby="fv-plan">
        <div>
          <h2 className="fv-h2" id="fv-plan">
            Today&rsquo;s plan
          </h2>
          <p className="fv-sub">Everything in the app, ticked off as you go.</p>
        </div>
        <ul className="fv-checks">
          {p.features.map((f) => (
            <li key={f.title} className="fv-check">
              <span className="fv-check-box" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <b>{f.title}</b>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Local first: a heartbeat through the stack ─────────────────── */}
      <section className="fv-pulse" aria-labelledby="fv-pulse">
        <h2 className="fv-h2" id="fv-pulse">
          {p.flow.title}
        </h2>
        <p className="fv-sub">{p.flow.intro}</p>
        <div className="fv-pulse-row">
          <svg className="fv-ecg" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 60 H140 L160 60 L175 18 L190 100 L205 60 H340 L360 60 L375 18 L390 100 L405 60 H540 L560 60 L575 18 L590 100 L605 60 H740 L760 60 L775 18 L790 100 L805 60 H1000" />
          </svg>
          <ol className="fv-nodes">
            {p.flow.steps.map((s) => (
              <li key={s.label}>
                <b>{s.label}</b>
                <span>{s.sub}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="fv-stack">
          Built with{" "}
          {p.stack
            .flatMap((g) => g.techs)
            .map((t) => (
              <span key={t.name}>
                <Icon icon={t.icon} color={t.color} />
                {t.name}
              </span>
            ))}
        </p>
      </section>

      {/* ── Next ───────────────────────────────────────────────────────── */}
      <section className="fv-next">
        <p className="fv-sub">Rest day over. Next app:</p>
        <WorldNext href={`/projects/${next.slug}`} color={next.world.bg} icon={iconOf(next)?.src} className="fv-next-link">
          <AppTile p={next} className="fv-next-tile" />
          <b>{next.name}</b>
          <span>{next.tagline}</span>
        </WorldNext>
      </section>
    </FitevoMotion>
  );
}
