// The four "What I Do?" module scenes. Static markup only; WhatIDoMotion plays them.
// Every scene is decorative (aria-hidden); the real content is in the panel beside it.
import Icon from "@/components/Icon";

/* ── 01 · Full Stack: an editor typing Blazify's Now Playing screen ─────── */

type Tok = [cls: string, text: string];
const CODE: Tok[][] = [
  [["a", "@Composable"]],
  [["k", "fun "], ["f", "NowPlaying"], ["p", "(track: "], ["t", "Track"], ["p", ") {"]],
  [["p", "    "], ["k", "val "], ["p", "lyrics "], ["k", "by "], ["p", "player.syncedLyrics"]],
  [["p", "    "], ["f", "Column"], ["p", "("], ["t", "Modifier"], ["p", "."], ["f", "fillMaxSize"], ["p", "()) {"]],
  [["p", "        "], ["f", "AlbumArt"], ["p", "(track.cover)"]],
  [["p", "        "], ["f", "LyricLine"], ["p", "(lyrics.now, glow = "], ["k", "true"], ["p", ")"]],
  [["p", "        "], ["f", "Equalizer"], ["p", "(bands = "], ["n", "10"], ["p", ")"]],
  [["p", "    }"]],
  [["p", "}"]],
];
const LYRIC = ["Word", "by", "word,", "in", "sync"];

export function EditorScene() {
  return (
    <div className="wd-editor" aria-hidden="true">
      <div className="wd-tree">
        <span>▾ blazify</span>
        <span>  ▾ app</span>
        <span className="is-active">    Player.kt</span>
        <span>    Lyrics.kt</span>
        <span>    Equalizer.kt</span>
        <span>  ▸ server</span>
        <span>  ▸ desktop</span>
      </div>
      <div className="wd-tabs">
        <span className="wd-tab is-active">
          <Icon icon="logos:kotlin-icon" /> Player.kt
        </span>
        <span className="wd-tab">
          <Icon icon="simple-icons:go" color="#00add8" /> server.go
        </span>
        <span className="wd-tab">
          <Icon icon="logos:typescript-icon" /> App.tsx
        </span>
      </div>
      <div className="wd-code">
        {CODE.map((line, i) => (
          <div className="wd-code-line" key={i}>
            <span className="wd-code-text">
              {line.map(([cls, text], j) => (
                <span className={`tk-${cls}`} key={j}>
                  {text}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
      <div className="wd-preview">
        <div className="wd-phone">
          <div className="wd-phone-screen">
            <div className="wd-ph-el wd-ph-art">♪</div>
            <div className="wd-ph-el wd-ph-title">
              <b>Now playing</b>
              <small>Blazify</small>
            </div>
            <div className="wd-ph-el wd-ph-lyric">
              {LYRIC.map((w, i) => (
                <span key={i} style={{ "--i": i } as React.CSSProperties}>
                  {w}
                </span>
              ))}
            </div>
            <div className="wd-ph-el wd-ph-eq">
              {Array.from({ length: 10 }, (_, i) => (
                <i key={i} style={{ "--i": i } as React.CSSProperties} />
              ))}
            </div>
            <div className="wd-ph-el wd-ph-bar">
              <span />
            </div>
          </div>
        </div>
      </div>
      <div className="wd-status">
        <span>● Kotlin · UTF-8 · Ln 9</span>
        <span className="wd-ok">✓ BUILD SUCCESSFUL</span>
      </div>
    </div>
  );
}

/* ── 02 · Cloud: a terminal deploying, lighting up a network map ────────── */

const NODES = [
  { id: "docker", name: "Docker", icon: "logos:docker-icon", x: 50, y: 14 },
  { id: "cloudflare", name: "Cloudflare", icon: "logos:cloudflare-icon", x: 81.2, y: 32 },
  { id: "supabase", name: "Supabase", icon: "logos:supabase-icon", x: 81.2, y: 68 },
  { id: "firebase", name: "Firebase", icon: "logos:firebase-icon", x: 50, y: 86 },
  { id: "postgres", name: "PostgreSQL", icon: "logos:postgresql", x: 18.8, y: 68 },
  { id: "netlify", name: "Netlify", icon: "logos:netlify-icon", x: 18.8, y: 32 },
];
const COMMANDS = [
  { cmd: "docker compose up -d listen-together", out: "listen-together started · Go on Docker", nodes: ["docker"] },
  { cmd: "wrangler deploy", out: "deployed to Cloudflare Workers", nodes: ["cloudflare"] },
  { cmd: "supabase db push", out: "PostgreSQL schema up to date", nodes: ["supabase", "postgres"] },
  { cmd: "firebase deploy && netlify deploy --prod", out: "Firebase + Netlify live", nodes: ["firebase", "netlify"] },
  { cmd: "./release.sh --sign android ios windows linux", out: "4 signed, reproducible builds", nodes: [] },
];

export function CloudScene() {
  return (
    <div className="wd-cloud" aria-hidden="true">
      <div className="wd-term">
        <p className="wd-term-head">rajendra@ktm ~/blazify</p>
        {COMMANDS.map((c) => (
          <div className="wd-term-row" key={c.cmd} data-nodes={c.nodes.join(" ")}>
            <span className="wd-prompt">$ </span>
            <span className="wd-cmd">{c.cmd}</span>
            <span className="wd-out">
              <b>✓</b> {c.out}
            </span>
          </div>
        ))}
        <span className="wd-term-caret" />
      </div>
      <div className="wd-net">
        <div className="wd-net-square">
          <svg viewBox="0 0 100 100" className="wd-net-svg">
            {NODES.map((n, i) => (
              <g className="wd-net-link" data-node={n.id} data-on="0" key={n.id}>
                <line x1="50" y1="50" x2={n.x} y2={n.y} className="wd-link" />
                <circle r="1.3" className="wd-packet">
                  <animateMotion dur={`${1.6 + (i % 3) * 0.35}s`} repeatCount="indefinite" path={`M50 50 L${n.x} ${n.y}`} />
                </circle>
              </g>
            ))}
            <circle cx="50" cy="50" r="36" className="wd-orbit-ring" />
          </svg>
          <span className="wd-node wd-node--hub">
            <Icon icon="simple-icons:go" color="#7cc8f0" />
            <small>listen-together</small>
          </span>
          {NODES.map((n) => (
            <span className="wd-node" data-node={n.id} data-on="0" key={n.id} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <Icon icon={n.icon} />
              <small>{n.name}</small>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 03 · UI/UX: a canvas where a cursor builds a screen and a logo ─────── */

const ARTBOARD = [
  { cls: "wd-ab-header", size: "W 312 · H 40", layer: "Header" },
  { cls: "wd-ab-card", size: "W 312 · H 168", layer: "Now playing" },
  { cls: "wd-ab-row", size: "W 312 · H 52", layer: "Track row" },
  { cls: "wd-ab-row wd-ab-row--2", size: "W 312 · H 52", layer: "Track row" },
  { cls: "wd-ab-button", size: "W 212 · H 48", layer: "Play button" },
];
const SWATCHES = ["#001c55", "#2f7fc1", "#a6dff7", "#f26b38"];

export function DesignScene() {
  return (
    <div className="wd-design" aria-hidden="true">
      <div className="wd-dbar">
        <span>blazify-ui</span>
        <span>Home · Logo</span>
        <span>100%</span>
      </div>
      <div className="wd-tools">
        <svg viewBox="0 0 24 24" className="is-active"><path d="M5 3l14 8-6 2-3 6z" /></svg>
        <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
        <svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16z" /></svg>
        <svg viewBox="0 0 24 24"><path d="M6 5h12M12 5v14" /></svg>
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>
      </div>
      <div className="wd-area">
        <div className="wd-artboard">
          <span className="wd-board-label">Home</span>
          <div className="wd-ab-screen">
            {ARTBOARD.map((el, i) => (
              <div className={`wd-ab-el ${el.cls}`} data-size={el.size} key={i}>
                {el.cls.includes("card") && (
                  <>
                    <i className="wd-ab-note">♪</i>
                    <b>Now playing</b>
                  </>
                )}
                {el.cls.includes("row") && (
                  <>
                    <i />
                    <span />
                  </>
                )}
                {el.cls.includes("button") && <b>▶ Play</b>}
                {el.cls.includes("header") && <b>Blazify</b>}
              </div>
            ))}
          </div>
        </div>
        <div className="wd-logo-board">
          <span className="wd-board-label">Logo</span>
          <svg viewBox="0 0 120 120" className="wd-logo">
            <circle cx="60" cy="60" r="44" className="wd-logo-path" />
            <path d="M44 84V36h20a13 13 0 0 1 0 26H44M62 62l16 22" className="wd-logo-path" />
            <path d="M44 36h20a13 13 0 0 1 0 26H44V36z" className="wd-logo-fill" />
            {[
              [44, 84],
              [44, 36],
              [64, 36],
              [64, 62],
              [78, 84],
            ].map(([x, y], i) => (
              <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" className="wd-anchor" />
            ))}
          </svg>
          <div className="wd-swatches">
            {SWATCHES.map((c) => (
              <span className="wd-swatch" key={c} style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="wd-sel">
          <i />
          <i />
          <i />
          <i />
          <span className="wd-sel-label" />
        </div>
        <div className="wd-cursor">
          <svg viewBox="0 0 24 24">
            <path d="M4 2l16 9-7 2-3 7z" />
          </svg>
          <span>Rajendra</span>
        </div>
      </div>
      <div className="wd-layers">
        <p>Layers</p>
        <span className="wd-layer" data-on="1">▣ Home</span>
        {ARTBOARD.map((el, i) => (
          <span className="wd-layer" data-on="0" key={i}>
            ▭ {el.layer}
          </span>
        ))}
        <span className="wd-layer" data-on="0">◯ Logo</span>
      </div>
    </div>
  );
}

/* ── 04 · Video: a viewfinder over the Himalaya and an editing timeline ─── */

// Deterministic "waveform" so server and client render the same bars.
const WAVE = Array.from({ length: 64 }, (_, i) => Math.round(28 + 60 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21))));

export function VideoScene() {
  return (
    <div className="wd-video" aria-hidden="true">
      <div className="wd-viewer">
        <div className="wd-footage">
          <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMax slice" className="wd-land">
            <defs>
              <linearGradient id="wd-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8fd0f2" />
                <stop offset="1" stopColor="#eaf7fe" />
              </linearGradient>
            </defs>
            <rect width="400" height="225" fill="url(#wd-sky)" />
            <circle cx="300" cy="62" r="20" fill="#fff" opacity="0.85" className="wd-sun" />
            <g className="wd-range wd-range--far">
              <path d="M-60 160 L10 92 L52 120 L104 64 L150 110 L196 76 L250 118 L300 70 L352 112 L410 80 L470 130 L470 225 L-60 225Z" fill="#a9c8e4" />
              <path d="M104 64 L118 78 L110 80 L98 74Z M300 70 L314 84 L304 86Z" fill="#ffffff" />
            </g>
            <g className="wd-range wd-range--mid">
              <path d="M-60 180 L30 128 L80 158 L140 112 L200 156 L262 120 L320 160 L380 130 L470 170 L470 225 L-60 225Z" fill="#5b86b8" />
            </g>
            <g className="wd-range wd-range--near">
              <path d="M-60 205 L40 170 L120 196 L200 168 L290 198 L370 176 L470 200 L470 225 L-60 225Z" fill="#1e3f73" />
            </g>
          </svg>
          <span className="wd-rec">
            <i /> REC
          </span>
          <span className="wd-tc">00:00:00:00</span>
          <span className="wd-meta">4K · 25 fps · ISO 400 · f/2.8</span>
          <span className="wd-focus" />
          <span className="wd-corner wd-corner--tl" />
          <span className="wd-corner wd-corner--tr" />
          <span className="wd-corner wd-corner--bl" />
          <span className="wd-corner wd-corner--br" />
        </div>
        <div className="wd-apps">
          <span><Icon icon="simple-icons:davinciresolve" color="#233a51" /></span>
          <span><Icon icon="logos:adobe-premiere" /></span>
          <span><Icon icon="logos:adobe-photoshop" /></span>
          <span><Icon icon="logos:adobe-lightroom" /></span>
        </div>
      </div>
      <div className="wd-timeline">
        <div className="wd-ruler">
          {["00:00", "00:05", "00:10", "00:15", "00:20", "00:25"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="wd-track">
          <span>V2</span>
          <div className="wd-lane">
            <span className="wd-clip wd-clip--title" style={{ left: "30%", width: "22%" }}>Title</span>
          </div>
        </div>
        <div className="wd-track">
          <span>V1</span>
          <div className="wd-lane">
            <span className="wd-clip" style={{ left: "0%", width: "26%" }}>Intro</span>
            <span className="wd-clip wd-clip--b" style={{ left: "27%", width: "34%" }}>B-roll · Kathmandu</span>
            <span className="wd-clip wd-clip--c" style={{ left: "62%", width: "38%" }}>Vlog</span>
          </div>
        </div>
        <div className="wd-track">
          <span>A1</span>
          <div className="wd-lane">
            <span className="wd-clip wd-clip--audio" style={{ left: "0%", width: "100%" }}>
              <span className="wd-wave">
                {WAVE.map((h, i) => (
                  <i key={i} style={{ "--h": h } as React.CSSProperties} />
                ))}
              </span>
            </span>
          </div>
        </div>
        <span className="wd-playhead" />
      </div>
    </div>
  );
}
