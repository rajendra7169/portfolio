// Device mockups drawn in markup: a phone, a laptop, and the Windows / Linux
// desktops that run inside it. Sizes are in container units (cqw), so a device
// scales as one piece with whatever width its parent gives it.
// The laptop's OS is a data-os attribute; CSS swaps the chrome, so flipping
// it (the launcher's switch) needs no re-render.
import type { CSSProperties, ReactNode } from "react";
import { iconOf, type Media, type Project } from "@/lib/projects";
import DeviceClock from "./DeviceClock";
import { isLight } from "./light";

/** A screenshot sized from lib/media.json. */
/**
 * A screenshot. `deferred` ones start without a source (`data-src` holds it) and
 * are filled in by their page's script when they're about to be needed: hidden
 * screens that would otherwise all download with the page (see LauncherMotion).
 */
export function Shot({ m, alt = "", className, eager = false, deferred = false }: { m: Media; alt?: string; className?: string; eager?: boolean; deferred?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP from `npm run images`
    <img
      src={deferred ? undefined : m.src}
      data-src={deferred ? m.src : undefined}
      width={m.w}
      height={m.h}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      data-top={m.top}
    />
  );
}

/** The app icon on its tile, as on a home screen. */
export function AppTile({ p, className }: { p: Project; className?: string }) {
  const icon = iconOf(p);
  return (
    <span className={`dv-tile${className ? ` ${className}` : ""}`} style={{ "--tile": p.tile.bg, "--pad": `${(p.tile.pad ?? 0.12) * 100}%` } as CSSProperties} aria-hidden="true">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- trimmed icon from `npm run images`
        <img src={icon.src} width={icon.w} height={icon.h} alt="" draggable={false} />
      ) : p.tile.glyph === "jarvis" ? (
        <JarvisGlyph />
      ) : (
        <VocabuGlyph />
      )}
    </span>
  );
}

// Jarvis has no icon file; its brand is the arc-reactor core, drawn here in its MARK orange.
function JarvisGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="dv-glyph">
      <circle cx="32" cy="32" r="27" fill="none" stroke="#ff8a1a" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx="32" cy="32" r="21" fill="none" stroke="#ff8a1a" strokeWidth="3" strokeDasharray="10 6" />
      <circle cx="32" cy="32" r="13" fill="none" stroke="#ffd09a" strokeWidth="2" />
      <circle cx="32" cy="32" r="6" fill="#ffd09a" />
      <circle cx="32" cy="32" r="6" fill="none" stroke="#ff8a1a" strokeWidth="6" strokeOpacity="0.35" />
    </svg>
  );
}

// Vocabu ships Flutter's default icon; its own mark is the book from its app bar.
function VocabuGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="dv-glyph">
      <path d="M32 18c-6-4-14-5-20-4v30c6-1 14 0 20 4 6-4 14-5 20-4V14c-6-1-14 0-20 4Z" fill="#fff" />
      <path d="M32 18v30" stroke="#2d8464" strokeWidth="2.5" />
      <text x="22" y="37" fontSize="11" fontWeight="800" fill="#2d8464" textAnchor="middle" fontFamily="system-ui, sans-serif">A</text>
      <text x="42" y="37" fontSize="11" fontWeight="800" fill="#ff9800" textAnchor="middle" fontFamily="system-ui, sans-serif">a</text>
    </svg>
  );
}

const Signal = () => (
  <svg viewBox="0 0 18 12" aria-hidden="true">
    <rect x="0" y="8" width="3" height="4" rx="1" />
    <rect x="5" y="5" width="3" height="7" rx="1" />
    <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
    <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4" />
  </svg>
);
const Battery = () => (
  <svg viewBox="0 0 26 12" aria-hidden="true">
    <rect x="0.75" y="0.75" width="21.5" height="10.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
    <rect x="3" y="3" width="15" height="6" rx="1.5" />
    <rect x="23.5" y="4" width="2" height="4" rx="1" opacity="0.55" />
  </svg>
);

const Wifi = () => (
  <svg viewBox="0 0 16 12" aria-hidden="true">
    <path d="M8 11.5 5.6 8.9a3.4 3.4 0 0 1 4.8 0Z" />
    <path d="M3.4 6.7a6.5 6.5 0 0 1 9.2 0l-1.2 1.2a4.8 4.8 0 0 0-6.8 0Z" />
    <path d="M1.2 4.5a9.6 9.6 0 0 1 13.6 0l-1.2 1.2a7.9 7.9 0 0 0-11.2 0Z" />
  </svg>
);

/**
 * A phone, drawn as the real thing: a Galaxy S24 for Android (flat display, thin
 * even bezels, centred punch-hole, keys on the right) or an iPhone 15 Pro (titanium,
 * Dynamic Island). Apps run full screen; the status bar floats over them, its icons
 * dark on light screens. `top` is the colour along the screen's top edge.
 * Android screenshots carry their own gesture bar; `pill` draws one for drawn screens.
 */
export function Phone({
  children,
  model = "android",
  top = "#000",
  pill = model === "iphone",
  className,
  label,
}: {
  children: ReactNode;
  model?: "android" | "iphone";
  top?: string;
  pill?: boolean;
  className?: string;
  label?: string;
}) {
  const ios = model === "iphone";
  return (
    <div className={`dv-phone dv-phone--${model}${className ? ` ${className}` : ""}`} role={label ? "img" : undefined} aria-label={label}>
      <div className="dv-phone-body">
        {ios ? (
          <>
            <span className="dv-key dv-key--action" aria-hidden="true" />
            <span className="dv-key dv-key--up" aria-hidden="true" />
            <span className="dv-key dv-key--down" aria-hidden="true" />
            <span className="dv-key dv-key--side" aria-hidden="true" />
          </>
        ) : (
          <>
            <span className="dv-key dv-key--vol" aria-hidden="true" />
            <span className="dv-key dv-key--power" aria-hidden="true" />
          </>
        )}
        <div className="dv-phone-screen" style={{ "--top": top } as CSSProperties}>
          <div className="dv-phone-view">{children}</div>
          <div className={`dv-status${isLight(top) ? " dv-status--dark" : ""}`} aria-hidden="true">
            <DeviceClock format={ios ? "ios" : "time"} className="dv-status-time" />
            <span className={ios ? "dv-island" : "dv-punch"} />
            <span className="dv-status-icons">
              {!ios && <Wifi />}
              <Signal />
              {ios && <Wifi />}
              <Battery />
            </span>
          </div>
          {pill && <span className="dv-home-pill" aria-hidden="true" />}
          <span className="dv-glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/** A laptop. Its display is 16:10; children fill it. */
export function Laptop({ children, os = "windows", className, label }: { children: ReactNode; os?: "windows" | "linux"; className?: string; label?: string }) {
  return (
    <div className={`dv-laptop${className ? ` ${className}` : ""}`} data-os={os} role={label ? "img" : undefined} aria-label={label}>
      <div className="dv-lid">
        <span className="dv-cam" aria-hidden="true" />
        <div className="dv-display">
          {children}
          <span className="dv-glare" aria-hidden="true" />
        </div>
      </div>
      <div className="dv-base" aria-hidden="true">
        <span className="dv-base-notch" />
      </div>
    </div>
  );
}

const WinLogo = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <rect x="0" y="0" width="7.5" height="7.5" rx="0.8" fill="#38a1f3" />
    <rect x="8.5" y="0" width="7.5" height="7.5" rx="0.8" fill="#38a1f3" />
    <rect x="0" y="8.5" width="7.5" height="7.5" rx="0.8" fill="#38a1f3" />
    <rect x="8.5" y="8.5" width="7.5" height="7.5" rx="0.8" fill="#38a1f3" />
  </svg>
);

/**
 * The OS around the apps: Windows 11's centred taskbar, or GNOME's top bar (vanilla
 * GNOME has no dock, so a window gets the full width). Both are rendered; data-os on
 * the laptop picks one. `pinned` are the apps on the Windows taskbar.
 */
export function DesktopShell({ children, pinned = [] }: { children: ReactNode; pinned?: Project[] }) {
  const win = pinned.filter((p) => p.on.windows);
  return (
    <div className="dv-desk">
      <span className="dv-wall" aria-hidden="true" />
      <div className="dv-topbar" aria-hidden="true">
        <span className="dv-topbar-l">Activities</span>
        <DeviceClock format="short" className="dv-topbar-date" />
        <DeviceClock className="dv-topbar-time" />
        <span className="dv-topbar-r">
          <Signal />
          <Battery />
        </span>
      </div>
      <div className="dv-desk-area">{children}</div>
      <div className="dv-taskbar" aria-hidden="true">
        <span className="dv-taskbar-mid">
          <span className="dv-task dv-task--start">
            <WinLogo />
          </span>
          <span className="dv-task-search">Search</span>
          {win.map((p) => (
            <AppTile key={p.slug} p={p} className="dv-task" />
          ))}
        </span>
        <span className="dv-taskbar-r">
          <span>ENG</span>
          <Signal />
          <span className="dv-taskbar-clock">
            <DeviceClock />
            <DeviceClock format="short" />
          </span>
        </span>
      </div>
    </div>
  );
}

/** An app window, maximised: Windows 11 caption buttons or GNOME's header bar, by data-os. */
export function OsWindow({ p, title, children }: { p: Project; title: string; children: ReactNode }) {
  return (
    <div className="dv-win">
      <div className="dv-win-bar" aria-hidden="true">
        <span className="dv-win-title">
          <AppTile p={p} className="dv-win-icon" />
          {title}
        </span>
        <span className="dv-win-ctrl">
          <i className="dv-win-min" />
          <i className="dv-win-max" />
          <i className="dv-win-close" />
        </span>
      </div>
      <div className="dv-win-body">{children}</div>
    </div>
  );
}
