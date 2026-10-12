// NexTerm's world: the terminal, and the desktop it runs on. The hero boots
// NexTerm on a Windows laptop; a pinned tour types a command for each real
// screen and the laptop switches to it; a live session shows ghost text, a
// failing build and Explain & Fix; `nexterm theme` repaints the whole page in
// one of NexTerm's own themes. One monospace family throughout, as the app sets it.
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import DeviceClock from "@/components/proj/DeviceClock";
import { AppTile, DesktopShell, Laptop, Shot } from "@/components/proj/Devices";
import { iconOf, nextProject, shot, type Project } from "@/lib/projects";
import WorldNext from "../WorldNext";
import NexTermMotion from "./NexTermMotion";
import { THEMES } from "./themes";
import "./nexterm.css";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--nx-font", display: "swap" });

// ANSI Shadow letters, joined into the banner word.
const GLYPHS: Record<string, string[]> = {
  N: ["███╗   ██╗", "████╗  ██║", "██╔██╗ ██║", "██║╚██╗██║", "██║ ╚████║", "╚═╝  ╚═══╝"],
  E: ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
  X: ["██╗  ██╗", "╚██╗██╔╝", " ╚███╔╝ ", " ██╔██╗ ", "██╔╝ ██╗", "╚═╝  ╚═╝"],
  T: ["████████╗", "╚══██╔══╝", "   ██║   ", "   ██║   ", "   ██║   ", "   ╚═╝   "],
  R: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██║  ██║", "╚═╝  ╚═╝"],
  M: ["███╗   ███╗", "████╗ ████║", "██╔████╔██║", "██║╚██╔╝██║", "██║ ╚═╝ ██║", "╚═╝     ╚═╝"],
};
const banner = (word: string) => GLYPHS.N.map((_, row) => [...word].map((c) => GLYPHS[c][row]).join("")).join("\n");

// The tour: a command for each real screen (docs/screenshots in the repo).
const TOUR: Record<string, string> = {
  "nexterm/desk-main": "nexterm",
  "nexterm/desk-shells": "nexterm new-tab --pick-shell",
  "nexterm/desk-splits": "nexterm split --right --broadcast",
  "nexterm/desk-profiles": "nexterm ssh --profiles",
  "nexterm/desk-themes": "nexterm settings themes",
  "nexterm/desk-font": "nexterm settings typography",
};

// Version history from the repo's tags and commits (2026).
const LOG = [
  ["05-20", "HEAD -> main, tag: v0.4.1", "Voice input, file compare, format-on-save, language servers"],
  ["05-18", "tag: v0.4.0", "Extensions, Claude, workspaces that persist"],
  ["05-13", "v0.3.0", "Coder mode, multi-window, AI vision and ghost text"],
  ["05-12", "tag: v0.2.0", "The AI side panel"],
  ["05-12", "tag: v0.1.3", "New prompt, live CPU, GPU and RAM"],
  ["05-04", "tag: v0.1.2", "“Open in NexTerm” in the Explorer menu"],
  ["05-04", "tag: v0.1.1", "Native Windows 11 window chrome"],
  ["05-04", "tag: v0.1.0", "First release"],
];

// The real dependencies, from package.json.
const DEPS = ["electron@30", "react@18", "zustand@4", "@xterm/xterm@5", "monaco-editor@0.55", "node-pty", "better-sqlite3", "ssh2", "node-llama-cpp@3.18", "tailwindcss@3"];

function Prompt({ path = "nexterm" }: { path?: string }) {
  return (
    <span className="nt-prompt" aria-hidden="true">
      <span className="nt-ps">PS</span> <span className="nt-path">C:\Users\rajendra{path ? `\\${path}` : ""}</span>
      <span className="nt-gt">&gt;</span>{" "}
    </span>
  );
}

/** A command line: the prompt, then the command, typed when its block arrives. */
function Cmd({ cmd, path }: { cmd: string; path?: string }) {
  return (
    <p className="nt-cmd">
      <Prompt path={path} />
      <span className="nt-typed" data-type={cmd}>
        {cmd}
      </span>
    </p>
  );
}

/** A NexTerm window: its title bar with tabs, then the session. */
function Win({ tab, shell = "PS7", className, children }: { tab: string; shell?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`nt-win${className ? ` ${className}` : ""}`}>
      <div className="nt-titlebar" aria-hidden="true">
        <span className="nt-wordmark">NEXTERM</span>
        <span className="nt-tab is-on">
          <i>{shell}</i> {tab}
        </span>
        <span className="nt-tab nt-tab--add">+</span>
        <span className="nt-caps">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="nt-body">{children}</div>
    </div>
  );
}

export default function NexTerm({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  const screens = p.desktop?.screens ?? [];

  return (
    <NexTermMotion className={`w-nx ${mono.variable}`}>
      {/* ── Boot: the about screen, and NexTerm on its laptop ──────────── */}
      <section className="nt-hero" data-cwd="nexterm">
        <div className="nt-hero-copy nt-block">
          <Cmd cmd="nexterm --about" path="" />
          <div className="nt-out">
            <h1 className="nt-title">
              <span className="sr-only">{p.name}</span>
              <pre aria-hidden="true">{banner("NEXTERM")}</pre>
            </h1>
            <p className="nt-tagline">{p.tagline}</p>
            <p className="nt-summary">{p.summary}</p>
            <dl className="nt-info">
              {[
                ["OS", "Windows 10 / 11 x64"],
                ["Shells", "PowerShell 7, CMD, Git Bash, WSL, Zsh, Fish"],
                ["Version", "0.4.1, May 20, 2026"],
                ["AI", "Groq, Gemini, Claude, Ollama, llama.cpp"],
                ["Accounts", "none · telemetry: none · ads: none"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="nt-links">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={`nt-a${l.primary ? " is-primary" : ""}`}>
                  [{l.label}]
                </a>
              ))}
            </p>
          </div>
        </div>
        <figure className="nt-hero-dev">
          <Laptop os="windows" className="nt-laptop nt-hero-laptop">
            <DesktopShell pinned={[p]}>
              <div className="nt-screen">
                <Shot m={shot(screens[0].img)} alt="NexTerm on Windows 11: PowerShell with the animated banner and system info" className="nt-sshot is-on" eager />
              </div>
            </DesktopShell>
          </Laptop>
        </figure>
      </section>

      {/* ── Themes: repaint the page ───────────────────────────────────── */}
      <section className="nt-sec nt-themes-sec" data-cwd="nexterm\themes">
        <Win tab="themes" className="nt-block">
          <Cmd cmd="nexterm theme --pick" />
          <div className="nt-out">
            <p className="nt-dim"># 19 themes ship with NexTerm. Pick one and the whole page repaints.</p>
            <div className="nt-themes" role="radiogroup" aria-label="NexTerm theme for this page">
              {THEMES.map((t, i) => (
                <button key={t.id} type="button" role="radio" aria-checked={i === 0} className="nt-theme" data-theme={t.id}>
                  <span className="nt-theme-dot" aria-hidden="true" style={{ background: t.bg, boxShadow: `inset 0 0 0 3px ${t.acc}` }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </Win>
      </section>

      {/* ── The tour: a command for each real screen ───────────────────── */}
      <section className="nt-tour" data-cwd="nexterm\docs\screenshots" aria-labelledby="nt-tour">
        <div className="nt-tour-term">
          <h2 className="nt-h2" id="nt-tour">
            <span className="nt-dim">#</span> One terminal, every shell
          </h2>
          <ol className="nt-tour-steps">
            {screens.map((s, i) => (
              <li key={s.img} className={i === 0 ? "is-on" : undefined}>
                <p className="nt-cmd">
                  <Prompt />
                  <span className="nt-tour-cmd" data-cmd={TOUR[s.img] ?? "nexterm"}>
                    {TOUR[s.img] ?? "nexterm"}
                  </span>
                </p>
                <p className="nt-tour-note">
                  <b>{s.title}.</b> {s.note}
                </p>
              </li>
            ))}
          </ol>
          <p className="nt-tour-count nt-dim" aria-hidden="true">
            <span className="nt-tour-n">1</span> / {screens.length}
          </p>
        </div>
        <figure className="nt-tour-dev">
          <Laptop os="windows" className="nt-laptop">
            <DesktopShell pinned={[p]}>
              <div className="nt-screen">
                {screens.map((s, i) => (
                  <Shot key={s.img} m={shot(s.img)} alt={`NexTerm: ${s.title}`} className={`nt-tshot${i === 0 ? " is-on" : ""}`} eager={i === 0} />
                ))}
              </div>
            </DesktopShell>
          </Laptop>
        </figure>
      </section>

      {/* ── A live session: ghost text, a broken build, Explain & Fix ───── */}
      <section className="nt-sec nt-live-sec" data-cwd="dev\blazify" aria-labelledby="nt-live">
        <h2 className="nt-h2" id="nt-live">
          <span className="nt-dim">#</span> It reads the error with you
        </h2>
        <p className="nt-lede">Ghost text finishes the command, the build breaks, and Explain &amp; Fix reads the last thirty lines and hands back the fix. Pick a theme above and the session plays in it.</p>
        <Win tab="blazify" className="nt-live">
          <div className="nt-live-grid">
            <div className="nt-live-term" role="img" aria-label="A NexTerm session: a build fails, the AI panel explains the bug and suggests a fix, and the next build passes.">
              <p className="nt-l nt-l-1">
                <Prompt path="dev\blazify" />
                <span data-live="git status">git status</span>
              </p>
              <p className="nt-l nt-l-2 nt-dim">On branch main · nothing to commit, working tree clean</p>
              <p className="nt-l nt-l-3">
                <Prompt path="dev\blazify" />
                <span data-live="npm run b">npm run b</span>
                <span className="nt-ghost">uild</span>
                <span className="nt-tabkey">Tab</span>
              </p>
              <p className="nt-l nt-l-4 nt-dim">&gt; vite build</p>
              <p className="nt-l nt-l-5 nt-err">✗ src/eq.ts:42 Type &apos;string&apos; is not assignable to type &apos;number&apos;.</p>
              <p className="nt-l nt-l-6 nt-dim">1 error, build failed [2.4s]</p>
              <p className="nt-l nt-l-7">
                <Prompt path="dev\blazify" />
                <span data-live="npm run build">npm run build</span>
              </p>
              <p className="nt-l nt-l-8 nt-ok">✓ built in 1.9s [1.9s]</p>
            </div>
            <aside className="nt-ai" aria-hidden="true">
              <p className="nt-ai-head">
                <span>✦ AI · Explain &amp; Fix</span>
                <span className="nt-dim">last 30 lines</span>
              </p>
              <p className="nt-l nt-ai-q">
                <span data-live="Why did the build fail?">Why did the build fail?</span>
              </p>
              <p className="nt-l nt-ai-a">
                <span data-live="The slider hands eq.ts a string, and the band gain is typed as a number. Turn it into a number before you store it:">
                  The slider hands eq.ts a string, and the band gain is typed as a number. Turn it into a number before you store it:
                </span>
              </p>
              <pre className="nt-l nt-ai-code">
                <code>
                  <span className="nt-mag">const</span> gain = <span className="nt-cyan">Number</span>(input.value);
                </code>
              </pre>
              <p className="nt-l nt-ai-btns">
                <span>[Copy]</span> <span>[Insert]</span> <span className="nt-run">[▶ Run]</span>
              </p>
            </aside>
          </div>
        </Win>
      </section>

      {/* ── Features, as a table ───────────────────────────────────────── */}
      <section className="nt-sec" data-cwd="nexterm\features">
        <Win tab="features" className="nt-block">
          <Cmd cmd="Get-NexTermFeature | Format-Table -AutoSize" />
          <div className="nt-out">
            <table className="nt-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">What it does</th>
                </tr>
                <tr className="nt-rule" aria-hidden="true">
                  <td>----</td>
                  <td>------------</td>
                </tr>
              </thead>
              <tbody>
                {p.features.map((f) => (
                  <tr key={f.title} className="nt-row">
                    <td>{f.title}</td>
                    <td>{f.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Win>
      </section>

      {/* ── Changelog, trace and dependencies ──────────────────────────── */}
      <section className="nt-sec nt-trio" data-cwd="nexterm (main)">
        <Win tab="git" shell="Git" className="nt-block nt-log-win">
          <Cmd cmd="git log --graph --oneline --decorate" />
          <ol className="nt-out nt-log">
            {LOG.map(([date, refs, msg]) => (
              <li key={refs} className="nt-log-line">
                <span className="nt-graph" aria-hidden="true" />
                <span className="nt-warn">2026-{date}</span> <span className="nt-refs">({refs})</span> <span className="nt-msg">{msg}</span>
              </li>
            ))}
          </ol>
        </Win>
        <Win tab="trace" className="nt-block">
          <Cmd cmd="nexterm trace --keystroke" />
          <div className="nt-out">
            <p className="nt-dim"># {p.flow.intro}</p>
            <ol className="nt-trace">
              {p.flow.steps.map((s) => (
                <li key={s.label}>
                  <b>{s.label}</b>
                  <span className="nt-dim">{s.sub}</span>
                </li>
              ))}
            </ol>
          </div>
        </Win>
        <Win tab="deps" className="nt-block">
          <Cmd cmd="npm ls --depth=0" />
          <div className="nt-out">
            <p>nexterm@0.4.1</p>
            <ul className="nt-tree">
              {DEPS.map((d, i) => (
                <li key={d}>
                  <span className="nt-dim">{i === DEPS.length - 1 ? "└── " : "├── "}</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </Win>
      </section>

      {/* ── Next ───────────────────────────────────────────────────────── */}
      <section className="nt-sec nt-next" data-cwd={next.slug}>
        <Win tab={next.slug} className="nt-block">
          <p className="nt-cmd">
            <Prompt />
            <WorldNext href={`/projects/${next.slug}`} color={next.world.bg} icon={iconOf(next)?.src} className="nt-next-link">
              cd ..\{next.slug}
              <span className="nt-next-card">
                <AppTile p={next} className="nt-next-tile" />
                <span>
                  <b>{next.name}</b> <span className="nt-dim">{next.tagline}</span>
                </span>
              </span>
            </WorldNext>
          </p>
          <p className="nt-cmd nt-last">
            <Prompt />
            <span className="nt-cursor" aria-hidden="true" />
          </p>
        </Win>
      </section>

      <div className="nt-status" aria-hidden="true">
        <span className="nt-status-cwd">~\nexterm</span>
        <span>⎇ main</span>
        <span className="nt-status-r">
          CPU 12% · GPU 3% · RAM 41% <DeviceClock />
        </span>
      </div>
    </NexTermMotion>
  );
}
