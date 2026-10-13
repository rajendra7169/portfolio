// Projects hero: every app on the devices it really runs on, and nowhere else.
// A laptop at the back (switch it between Windows and Linux and its apps change),
// an iPhone on its lock screen with Blazify's lock-screen player, and a Galaxy S24
// on its home screen. Hover an app and the same app lights up on every other device
// it runs on; hover a laptop app to peek at its window; click any app and it opens
// out of its icon, then the page follows. Every icon is a real link underneath.
import Link from "next/link";
import Icon from "@/components/Icon";
import HeroField from "@/components/hero/HeroField";
import RootFlags from "@/components/RootFlags";
import { iconOf, PLATFORMS, projects, projectsPage, shot, type Project } from "@/lib/projects";
import { AppTile, DesktopShell, Laptop, OsWindow, Phone, Shot } from "./Devices";
import DeviceClock from "./DeviceClock";
import LauncherMotion from "./LauncherMotion";

const href = (p: Project) => `/projects/${p.slug}`;
/** "Android, iPhone, Windows and Linux", for the cross-device caption. */
const runs = (p: Project) => {
  const l = p.platforms.map((k) => PLATFORMS[k].label);
  return l.length > 1 ? `${l.slice(0, -1).join(", ")} and ${l[l.length - 1]}` : l[0];
};
// No prefetch on sight: with every app on screen at once, the Projects page
// fetched all seven worlds (and their fonts) as it loaded. LauncherMotion
// prefetches one when it's pointed at, touched or focused.
const appProps = (p: Project) => ({
  href: href(p),
  prefetch: false,
  className: "pl-app",
  "data-slug": p.slug,
  "data-name": p.name,
  "data-runs": runs(p),
  "data-world": p.world.bg,
  "data-icon": iconOf(p)?.src,
  "data-cursor": "Open",
});

// The notifications each app posts, from what it really does. `desk` is the laptop's.
const NOTES: Record<string, { phone?: string; desk?: string }> = {
  blazify: { phone: "Kept 12 songs for offline as you played.", desk: "Lyrics synced, word by word." },
  fitevo: { phone: "Lunch logged from one sentence: 640 kcal." },
  tally: { phone: "Checked in at 09:02. A sapling is in the ground.", desk: "3 entries waiting for your approval." },
  vocabu: { phone: "Word of the day: ephemeral.", desk: "Word of the day: ephemeral." },
  "r-ai": { phone: "Running offline on gemma2-2b-local.", desk: "Running offline. Nothing sent." },
  jarvis: { desk: "“Yes sir.” Volume down to 40%." },
  nexterm: { desk: "Explained the last error. A fix is ready." },
};

function Notif({ p, text, className }: { p: Project; text: string; className?: string }) {
  return (
    <li className={`pl-notif${className ? ` ${className}` : ""}`} data-windows={p.on.windows || undefined} data-linux={p.on.linux || undefined}>
      <AppTile p={p} className="pl-notif-tile" />
      <span className="pl-notif-text">
        <b>{p.name}</b>
        <span>{text}</span>
      </span>
      <small>now</small>
    </li>
  );
}

/** What an app shows as it opens: its first real screen on that device, or its splash. */
function Opening({ p, screen }: { p: Project; screen?: string }) {
  if (screen) return <Shot m={shot(screen)} className="pl-open-shot" />;
  return (
    <span className="pl-splash" style={{ "--accent": p.accent, "--tile": p.tile.bg } as React.CSSProperties}>
      <AppTile p={p} className="pl-splash-tile" />
      <b>{p.name}</b>
      <small>{p.tagline}</small>
    </span>
  );
}

function Controls() {
  return (
    <span className="pl-media-ctrl" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M6 5h2v14H6zM20 5v14L9 12z" />
      </svg>
      <svg viewBox="0 0 24 24">
        <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
      </svg>
      <svg viewBox="0 0 24 24">
        <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
      </svg>
    </span>
  );
}

export default function Launcher() {
  const android = projects.filter((p) => p.on.android);
  const desk = projects.filter((p) => p.on.windows || p.on.linux);
  const blazify = projects[0];

  return (
    <LauncherMotion>
      <div className="pl-bg" aria-hidden="true">
        <div className="hx-glow hx-glow--a" />
        <div className="hx-glow hx-glow--b" />
        <div className="hx-floor">
          <div className="hx-floor-grid" />
        </div>
        <HeroField />
      </div>

      <div className="pl-inner">
        <div className="pl-copy">
          <p className="hx-eyebrow pl-eyebrow">
            <span aria-hidden="true">📱</span> App drawer · {projects.length} apps · 3 devices
          </p>
          <h1 className="pl-title">
            <span className="sr-only">Projects</span>
            <span className="eh-title-clip" aria-hidden="true">
              <span className="hx-line hx-line--a pl-title-text">Projects</span>
            </span>
          </h1>
          <p className="pl-intro">{projectsPage.intro}</p>

          <div className="pl-os" data-os="windows">
            <span className="pl-os-label">Laptop runs</span>
            <div className="pl-os-switch" role="radiogroup" aria-label="Laptop operating system">
              <span className="pl-os-pill" aria-hidden="true" />
              <button type="button" role="radio" aria-checked="true" data-os="windows" className="pl-os-btn">
                <Icon icon="logos:microsoft-windows-icon" /> Windows
              </button>
              <button type="button" role="radio" aria-checked="false" data-os="linux" className="pl-os-btn">
                <Icon icon="logos:linux-tux" /> Linux
              </button>
            </div>
          </div>

          <p className="pl-twin" aria-live="polite">
            <span className="pl-twin-idle">
              <span className="pl-hint-fine">Hover an app to see everywhere it runs · click to open it</span>
              <span className="pl-hint-touch">Tap an app to open it</span>
            </span>
            <span className="pl-twin-text" />
          </p>
        </div>

        <div className="pl-stage">
          <div className="pl-tilt">
            <figure className="pl-dev pl-dev--laptop">
              <Laptop os="windows" className="pl-laptop">
                <DesktopShell pinned={desk}>
                  <ul className="pl-icons" aria-label="Laptop apps">
                    {desk.map((p) => (
                      <li key={p.slug} className="pl-icon" data-windows={p.on.windows || undefined} data-linux={p.on.linux || undefined}>
                        <Link {...appProps(p)}>
                          <AppTile p={p} />
                          <span className="pl-app-name">{p.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {desk.map((p) => (
                    <div className="pl-peek" data-slug={p.slug} key={p.slug} aria-hidden="true">
                      <OsWindow p={p} title={p.name}>
                        <Opening p={p} screen={p.desktop?.screens[0].img} />
                      </OsWindow>
                    </div>
                  ))}
                  <ul className="pl-notifs pl-notifs--desk" aria-hidden="true">
                    {desk.map((p) => NOTES[p.slug]?.desk && <Notif key={p.slug} p={p} text={NOTES[p.slug].desk!} />)}
                  </ul>
                  <div className="pl-boot" aria-hidden="true">
                    <Icon icon="logos:microsoft-windows-icon" className="pl-boot-win" />
                    <Icon icon="logos:linux-tux" className="pl-boot-tux" />
                    <span className="pl-boot-spin" />
                  </div>
                </DesktopShell>
              </Laptop>
              <figcaption className="pl-cap">
                <Icon icon="logos:microsoft-windows-icon" /> <Icon icon="logos:linux-tux" /> Laptop · Windows or Linux
              </figcaption>
            </figure>

            <figure className="pl-dev pl-dev--iphone">
              <Phone model="iphone" className="pl-iphone" top="#2a1846">
                <div className="pl-lock">
                  <span className="pl-lock-wall" aria-hidden="true" />
                  <DeviceClock format="date" className="pl-lock-date" />
                  <DeviceClock format="ios" className="pl-lock-time" />
                  <Link {...appProps(blazify)} className="pl-app pl-media" aria-label="Blazify on iPhone, playing on the lock screen">
                    <span className="pl-media-top">
                      <AppTile p={blazify} />
                      <span className="pl-media-text">
                        <b>Blazify</b>
                        <small>Lock-screen player</small>
                      </span>
                    </span>
                    <span className="pl-media-bar">
                      <i />
                    </span>
                    <Controls />
                  </Link>
                  <span className="pl-lock-btns" aria-hidden="true">
                    <i>
                      <svg viewBox="0 0 24 24">
                        <path d="M8 2h8l-1 6H9zM9 9h6l-1 13h-4z" />
                      </svg>
                    </i>
                    <i>
                      <svg viewBox="0 0 24 24">
                        <path d="M4 7h3l2-3h6l2 3h3v13H4zM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                      </svg>
                    </i>
                  </span>
                </div>
                <ul className="pl-notifs pl-notifs--ios" aria-hidden="true">
                  <Notif p={blazify} text="Blaze Together: 3 friends joined your room." />
                </ul>
                <div className="pl-open" data-slug={blazify.slug} aria-hidden="true">
                  <Opening p={blazify} screen={blazify.iphone?.[0].img} />
                </div>
              </Phone>
              <figcaption className="pl-cap">
                <Icon icon="logos:apple" /> iPhone · iOS
              </figcaption>
            </figure>

            <figure className="pl-dev pl-dev--android">
              <Phone model="android" pill className="pl-phone" top="#0d2a5c">
                <div className="pl-home">
                  <span className="pl-home-wall" aria-hidden="true" />
                  <div className="pl-widget" aria-hidden="true">
                    <DeviceClock className="pl-widget-time" />
                    <DeviceClock format="date" className="pl-widget-date" />
                    <small>Kathmandu</small>
                  </div>
                  <Link {...appProps(blazify)} className="pl-app pl-np" aria-label="Blazify on Android, now playing">
                    <AppTile p={blazify} />
                    <span className="pl-np-text">
                      <b>Now playing</b>
                      <small>Blazify</small>
                    </span>
                    <span className="pl-np-eq" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </Link>
                  <ul className="pl-grid" aria-label="Android apps">
                    {android.map((p) => (
                      <li key={p.slug} className="pl-icon">
                        <Link {...appProps(p)}>
                          <AppTile p={p} />
                          <span className="pl-app-name">{p.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <ul className="pl-notifs pl-notifs--android" aria-hidden="true">
                  {android.map((p) => NOTES[p.slug]?.phone && <Notif key={p.slug} p={p} text={NOTES[p.slug].phone!} />)}
                </ul>
                {android.map((p) => (
                  <div className="pl-open" data-slug={p.slug} key={p.slug} aria-hidden="true">
                    <Opening p={p} screen={p.phone?.[0].img} />
                  </div>
                ))}
              </Phone>
              <figcaption className="pl-cap">
                <Icon icon="logos:android-icon" /> Galaxy S24 · Android
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
      <RootFlags />
    </LauncherMotion>
  );
}
