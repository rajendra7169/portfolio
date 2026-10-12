// R-AI's world: the drive. The page opens like the stick itself: plug it in
// (or pull it out and plug it back) and the folder opens. Then the internet
// gets switched off while it keeps answering, the drive gets packed with the
// real model catalogue, and the real interface, chat and images taking turns
// on memory. Its own look: the app's greys, its blue-to-violet greeting, Inter
// and JetBrains Mono.
import { Inter, JetBrains_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import { AppTile, DesktopShell, Laptop, OsWindow, Phone, Shot } from "@/components/proj/Devices";
import { iconOf, nextProject, shot, type Project } from "@/lib/projects";
import WorldNext from "../WorldNext";
import RAiMotion from "./RAiMotion";
import "./rai.css";

const sans = Inter({ subsets: ["latin"], variable: "--ra-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--ra-mono", display: "swap" });

// The drive, as the repository lays it out.
const TREE: { name: string; files: string[]; note: string }[] = [
  { name: "Android", files: ["install.sh", "start.sh"], note: "Termux" },
  { name: "Linux", files: ["install.sh", "start.sh", "Start R-AI.desktop"], note: "Ubuntu, Debian" },
  { name: "Mac", files: ["install.command", "start.command"], note: "macOS 12+" },
  { name: "Windows", files: ["install.bat", "start-fast-chat.bat"], note: "Windows 10+" },
  { name: "Shared", files: ["chat_server.py", "FastChatUI.html", "models/", "bin/"], note: "one copy for all four" },
];

// The model catalogue (Shared/config/models.json), sizes in GB.
type Model = { id: string; name: string; size: string; gb: number; tag: string; desk: boolean; phone: boolean };
const MODELS: Model[] = [
  { id: "gemma2", name: "Gemma 2", size: "2B", gb: 1.6, tag: "The quick one, the default", desk: true, phone: true },
  { id: "phi", name: "Phi-3.5 Mini", size: "3.8B", gb: 2.2, tag: "Light and careful", desk: true, phone: true },
  { id: "dolphin", name: "Dolphin 2.9", size: "Llama 3 8B", gb: 4.9, tag: "All-rounder", desk: true, phone: false },
  { id: "qwen9", name: "Qwen 3.5", size: "9B", gb: 5.2, tag: "Sharp; on a phone, 12 GB of RAM", desk: true, phone: true },
  { id: "gemma4", name: "Gemma 4", size: "E4B", gb: 5.34, tag: "The newest", desk: true, phone: false },
  { id: "nemo", name: "NemoMix", size: "12B", gb: 7.0, tag: "The heavyweight", desk: true, phone: false },
  { id: "smol", name: "SmolLM2", size: "1.7B", gb: 1.0, tag: "Lightest, for phones", desk: false, phone: true },
  { id: "qwen15", name: "Qwen 2.5", size: "1.5B", gb: 1.1, tag: "Many languages, for phones", desk: false, phone: true },
  { id: "sd", name: "CyberRealistic", size: "Stable Diffusion 1.5", gb: 1.99, tag: "Images", desk: true, phone: false },
];
const CAPS = [16, 32, 64];

const ANSWER =
  "Everything you would ask a chat assistant, from this drive: write and fix code, summarise the PDF you just attached, explain a photo, draft an email, or make an image with Stable Diffusion. Pull the cable and nothing changes, because the model, the engine and this page all live in one folder.";

// Rough working memory on a 16 GB laptop, for a 9B chat model or SD 1.5 at 512 × 512.
const RAM = [
  { id: "os", label: "System and apps", gb: 4 },
  { id: "srv", label: "Python server", gb: 0.1 },
  { id: "chat", label: "Chat model", gb: 6.2 },
  { id: "img", label: "Image engine", gb: 4.5 },
];

export default function RAi({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  const logo = iconOf(p)!;
  const desk = p.desktop!.screens;
  const phone = p.phone![0];

  return (
    <RAiMotion className={`w-ra ${sans.variable} ${mono.variable}`}>
      {/* ── The drive ──────────────────────────────────────────────────── */}
      <section className="ra-hero" data-drive="in">
        <div className="ra-copy">
          <p className="ra-kind">{p.kind}</p>
          <h1 className="ra-title">
            <span className="ra-name">{p.name}</span>
          </h1>
          <p className="ra-tag">{p.tagline}</p>
          <p className="ra-lede">{p.summary}</p>
          <div className="ra-links">
            {p.links.map((l) => (
              <a key={l.href} href={l.href} className={`ra-link${l.primary ? " is-primary" : ""}`} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="ra-side">
          <div className="ra-toast" role="status">
            {/* eslint-disable-next-line @next/next/no-img-element -- trimmed icon from `npm run images` */}
            <img src={logo.src} width={logo.w} height={logo.h} alt="" />
            <div>
              <b>R-AI (E:)</b>
              <span>Open the folder, double-click Start. No internet needed.</span>
            </div>
          </div>
          <div className="ra-explorer">
            <div className="ra-win-bar">
              <span className="ra-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <b>R-AI (E:)</b>
              <em className="ra-win-cap">32 GB</em>
            </div>
            <ul className="ra-tree" aria-label="What is on the drive">
              {TREE.map((d) => (
                <li key={d.name} className={`ra-dir${d.name === "Shared" ? " is-shared" : ""}`}>
                  <span className="ra-dir-name">
                    <i aria-hidden="true" />
                    {d.name}/
                  </span>
                  <span className="ra-dir-note">{d.note}</span>
                  <span className="ra-files">
                    {d.files.map((f) => (
                      <code key={f}>{f}</code>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="ra-gone">Drive removed. Plug it back in.</p>
          </div>
        </div>

        <div className="ra-rig">
          <button type="button" className="ra-stick" aria-label="Unplug the drive" data-cursor="Drag">
            <span className="ra-body">
              {/* eslint-disable-next-line @next/next/no-img-element -- trimmed icon from `npm run images` */}
              <img src={logo.src} width={logo.w} height={logo.h} alt="" />
              <b>R-AI</b>
              <em>32 GB · USB 3.0</em>
              <i className="ra-led" aria-hidden="true" />
            </span>
            <span className="ra-plug" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
          <span className="ra-laptop" aria-hidden="true">
            <i className="ra-port" />
            <i className="ra-vent" />
          </span>
          <p className="ra-hint">Drag the drive out, then plug it back in.</p>
        </div>
      </section>

      {/* ── Pull the plug ─────────────────────────────────────────────────── */}
      <section className="ra-offline" aria-labelledby="ra-offline">
        <header className="ra-head">
          <h2 className="ra-h2" id="ra-offline">
            Pull the plug
          </h2>
          <p className="ra-sub">Switch the internet off. It keeps answering: the model, the engine and the page it talks through are all on the drive.</p>
        </header>
        <div className="ra-off-grid">
          <div className="ra-net">
            <button type="button" className="ra-switch" role="switch" aria-checked="true" aria-label="Internet">
              <i />
            </button>
            <p className="ra-net-state">
              Internet <b>on</b>
            </p>
            <dl className="ra-meter">
              <div>
                <dt>Sent to the internet</dt>
                <dd>0 B</dd>
              </div>
              <div>
                <dt>Cloud calls</dt>
                <dd>0</dd>
              </div>
              <div>
                <dt>Where it runs</dt>
                <dd>this drive</dd>
              </div>
            </dl>
          </div>
          <div className="ra-chat">
            <div className="ra-chat-bar">
              <span className="ra-model-pill">
                {/* eslint-disable-next-line @next/next/no-img-element -- trimmed icon from `npm run images` */}
                <img src={logo.src} width={logo.w} height={logo.h} alt="" />
                gemma2-2b-local
              </span>
              <span className="ra-badge">Offline, still answering</span>
            </div>
            <div className="ra-msgs">
              <div className="ra-you">
                <span className="ra-attach">trek-permit.pdf</span>
                What can you do with no internet at all?
              </div>
              <div className="ra-bot">
                {/* eslint-disable-next-line @next/next/no-img-element -- trimmed icon from `npm run images` */}
                <img src={logo.src} width={logo.w} height={logo.h} alt="" />
                <div>
                  <p className="ra-think">Thought for 1 second</p>
                  <p className="ra-answer" data-stream={ANSWER}>
                    {ANSWER}
                  </p>
                </div>
              </div>
            </div>
            <div className="ra-inp">
              <span>Ask anything…</span>
              <button type="button" className="ra-ask" aria-label="Ask again">
                <i aria-hidden="true" />
              </button>
            </div>
            <p className="ra-fine">Responses are generated locally. A replay of the interface, with its own words.</p>
          </div>
        </div>
      </section>

      {/* ── Pack the drive ────────────────────────────────────────────────── */}
      <section className="ra-pack" aria-labelledby="ra-pack">
        <header className="ra-head">
          <h2 className="ra-h2" id="ra-pack">
            Pack the drive
          </h2>
          <p className="ra-sub">Each model is one file in Shared/models. Download it once and Windows, macOS, Linux and Android all use the same copy. Pick a drive, then pick your models.</p>
        </header>
        <div className="ra-drive">
          <div className="ra-caps" role="radiogroup" aria-label="Drive size">
            {CAPS.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={c === 32} data-cap={c} className="ra-cap">
                {c} GB
              </button>
            ))}
          </div>
          <div className="ra-bar" aria-hidden="true">
            <i className="ra-bar-fill" />
          </div>
          <p className="ra-bar-text" aria-live="polite">
            <b className="ra-used">1.6</b> GB of <b className="ra-total">32</b> GB used
          </p>
        </div>
        <ul className="ra-models">
          {MODELS.map((m) => (
            <li key={m.id}>
              <button type="button" className="ra-model" aria-pressed={m.id === "gemma2"} data-gb={m.gb}>
                <span className="ra-model-head">
                  <b>{m.name}</b>
                  <span className="ra-model-size">{m.size}</span>
                </span>
                <span className="ra-model-tag">{m.tag}</span>
                <span className="ra-chips">
                  {m.desk && (
                    <>
                      <i>Windows</i>
                      <i>macOS</i>
                      <i>Linux</i>
                    </>
                  )}
                  {m.phone && <i>Android</i>}
                </span>
                <span className="ra-dl" aria-hidden="true">
                  <b />
                </span>
                <span className="ra-model-gb">{m.gb} GB</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="ra-pack-note" aria-live="polite" />
      </section>

      {/* ── The interface ─────────────────────────────────────────────────── */}
      <section className="ra-real" aria-labelledby="ra-real">
        <header className="ra-head">
          <h2 className="ra-h2" id="ra-real">
            The interface
          </h2>
          <p className="ra-sub">One HTML file, served by the drive&rsquo;s own Python server and opened as an app window. These are its real screens.</p>
        </header>
        <div className="ra-tabs" role="tablist" aria-label="Mode">
          {desk.map((s, i) => (
            <button key={s.img} type="button" role="tab" aria-selected={i === 0} data-tab={i} className="ra-tab">
              {s.title}
            </button>
          ))}
        </div>
        <div className="ra-real-grid">
          <figure className="ra-dev">
            <Laptop os="linux">
              <DesktopShell pinned={[p]}>
                <OsWindow p={p} title="R-AI">
                  {desk.map((s, i) => (
                    <Shot key={s.img} m={shot(s.img)} alt={`R-AI ${s.title}`} className={`ra-shot${i === 0 ? " is-on" : ""}`} eager={i === 0} />
                  ))}
                </OsWindow>
              </DesktopShell>
            </Laptop>
            <figcaption>
              {desk.map((s, i) => (
                <span key={s.img} className={`ra-note${i === 0 ? " is-on" : ""}`}>
                  <b>{s.title}.</b> {s.note}
                </span>
              ))}
            </figcaption>
          </figure>
          <figure className="ra-dev ra-dev-phone">
            <Phone model="android" top={shot(phone.img).top}>
              <Shot m={shot(phone.img)} alt="R-AI on a phone: the same chat" />
            </Phone>
            <figcaption>
              <b>{phone.title}.</b> {phone.note}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Small, on purpose ─────────────────────────────────────────────── */}
      <section className="ra-ram" aria-labelledby="ra-ram">
        <header className="ra-head">
          <h2 className="ra-h2" id="ra-ram">
            {p.flow.title}
          </h2>
          <p className="ra-sub">{p.flow.intro} Chat and images take turns on memory, so one laptop can do both.</p>
        </header>
        <div className="ra-ram-grid">
          <ol className="ra-procs" aria-label="Processes">
            {p.flow.steps.map((s, i) => (
              <li key={s.label} style={{ "--d": i ? 1 : 0 } as CSSProperties} data-proc={i}>
                <code>{s.label}</code>
                <span>{s.sub}</span>
              </li>
            ))}
          </ol>
          <div className="ra-mem">
            <div className="ra-modes" role="radiogroup" aria-label="What is running">
              <button type="button" role="radio" aria-checked="true" data-mode="chat" className="ra-mode">
                Chatting
              </button>
              <button type="button" role="radio" aria-checked="false" data-mode="img" className="ra-mode">
                Making an image
              </button>
            </div>
            <div className="ra-mem-bar" data-mode="chat" aria-hidden="true">
              {RAM.map((r) => (
                <i key={r.id} className={`ra-seg ra-seg-${r.id}`} style={{ "--gb": r.gb } as CSSProperties} />
              ))}
            </div>
            <ul className="ra-mem-key">
              {RAM.map((r) => (
                <li key={r.id} className={`ra-key-${r.id}`}>
                  <i aria-hidden="true" />
                  {r.label} <b>about {r.gb < 1 ? `${r.gb * 1000} MB` : `${r.gb} GB`}</b>
                </li>
              ))}
            </ul>
            <p className="ra-mem-note">Rough figures for 16 GB of RAM, a 9B model and Stable Diffusion 1.5 at 512 × 512. Load one, and the other steps aside.</p>
          </div>
        </div>
      </section>

      <section className="ra-next">
        <p className="ra-sub">Next folder</p>
        <WorldNext href={`/projects/${next.slug}`} color={next.world.bg} icon={iconOf(next)?.src} className="ra-next-link">
          <AppTile p={next} className="ra-next-tile" />
          <b>{next.name}</b>
          <span>{next.tagline}</span>
        </WorldNext>
      </section>
    </RAiMotion>
  );
}
