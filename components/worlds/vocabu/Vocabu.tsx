// Vocabu's world: a page of the dictionary. The hero is an entry for the app
// itself, with a pronunciation you can hear and a search over the app's own
// sample words. A photographed page is compressed, read and picked through
// the way the app does it, the explore cards can be swiped, and the whole page
// switches between the app's green light theme and its orange dark one.
// Newsreader for the printed page, Roboto for the app.
import { Newsreader, Roboto } from "next/font/google";
import type { CSSProperties } from "react";
import { AppTile, Phone, Shot } from "@/components/proj/Devices";
import { iconOf, nextProject, shot, type Project } from "@/lib/projects";
import WorldNext from "../WorldNext";
import VocabuMotion from "./VocabuMotion";
import "./vocabu.css";

const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500", "600"], variable: "--vc-serif", display: "swap" });
const sans = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--vc-sans", display: "swap" });

// The app's built-in explore words (lib/screens/home_screen.dart).
export const WORDS: { w: string; pos: string; def: string; ex: string }[] = [
  { w: "serene", pos: "adjective", def: "Calm, peaceful, and untroubled; tranquil.", ex: "She had a serene expression on her face." },
  { w: "countenance", pos: "noun", def: "A person's face or facial expression.", ex: "His countenance fell when he heard the news." },
  { w: "admittance", pos: "noun", def: "The process or fact of entering or being allowed to enter.", ex: "Admittance to the club is by invitation only." },
  { w: "wholesome", pos: "adjective", def: "Conducive to or suggestive of good health and physical well-being.", ex: "Wholesome food and fresh air." },
  { w: "ephemeral", pos: "adjective", def: "Lasting for a very short time.", ex: "The beauty of the sunset was ephemeral." },
  { w: "mellifluous", pos: "adjective", def: "Pleasant to hear; sweetly flowing.", ex: "Her mellifluous voice soothed the audience." },
  { w: "eloquent", pos: "adjective", def: "Fluent or persuasive in speaking or writing.", ex: "His eloquent speech moved the crowd." },
  { w: "ubiquitous", pos: "adjective", def: "Present, appearing, or found everywhere.", ex: "Smartphones are ubiquitous today." },
  { w: "lucid", pos: "adjective", def: "Expressed clearly; easy to understand.", ex: "She gave a lucid explanation of the concept." },
  { w: "resilient", pos: "adjective", def: "Able to withstand or recover quickly from difficult conditions.", ex: "The community was resilient after the storm." },
  { w: "pristine", pos: "adjective", def: "In its original condition; unspoiled.", ex: "The beach was pristine early in the morning." },
];
const KNOWN = new Set(WORDS.map((x) => x.w));

// A page to photograph.
const PAGE =
  "Early in the morning the lake was pristine, and the village above it was serene. A boatman with a weathered countenance offered us admittance to his little ferry for ten rupees. His voice was mellifluous, his directions lucid, and his stories eloquent enough to make the crossing feel short. The mist was ephemeral; by nine it had gone. Phones are ubiquitous even here, yet the people seemed resilient in an older way, and the breakfast of beaten rice and tea was wholesome.";
// The word picker's rules (lib/services/text_processor.dart): five letters or
// more, and not on its stop or common word lists.
const SKIP = new Set(["about", "above", "after", "before", "people", "often", "later", "first", "between", "among", "under", "being", "could", "would", "shall", "should", "might", "which", "there", "their", "these", "those", "family", "using", "however", "during", "within", "without", "because", "while", "though", "whereas", "therefore", "early", "little", "enough"]);
const TOKENS = PAGE.split(/(\s+)/).map((t) => {
  const word = t.replace(/[^A-Za-z]/g, "").toLowerCase();
  const kind = !word ? "" : KNOWN.has(word) ? "pick" : word.length >= 5 && !SKIP.has(word) ? "cand" : "skip";
  return { t, word, kind };
});
const PICKS = WORDS.filter((x) => PAGE.toLowerCase().includes(x.w));
const CANDIDATES = new Set(TOKENS.filter((t) => t.kind === "cand" || t.kind === "pick").map((t) => t.word)).size;

const STEPS = ["Camera", "Compress", "OCR.space", "Word picker", "Dictionary API"];

export default function Vocabu({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  const home = p.phone![0];
  const saved = p.phone![1];

  return (
    <VocabuMotion className={`w-vc ${serif.variable} ${sans.variable}`} words={WORDS}>
      {/* ── The entry ─────────────────────────────────────────────────────── */}
      <section className="vc-hero">
        <div className="vc-guide" aria-hidden="true">
          <span>vocable</span>
          <span className="vc-folio">{p.started.slice(-4)}</span>
          <span>vocal</span>
        </div>

        <div className="vc-entry">
          <h1 className="vc-head">
            <span className="sr-only">{p.name}</span>
            <span aria-hidden="true">
              vo<i>·</i>cab<i>·</i>u
            </span>
          </h1>
          <p className="vc-say">
            <span className="vc-ipa">/vəˈkæb.juː/</span>
            <button type="button" className="vc-hear" data-say="Vocabu" aria-label="Hear it: Vocabu">
              <i aria-hidden="true" />
            </button>
            <em>noun, an app</em>
          </p>
          <ol className="vc-senses">
            <li>A dictionary for people still learning English, on Android and Windows.</li>
            <li>The habit of looking a word up, hearing it, and keeping it.</li>
          </ol>
          <p className="vc-ex">&ldquo;I didn&rsquo;t know the word on the sign, so I looked it up in Vocabu.&rdquo;</p>
          <p className="vc-lede">{p.summary}</p>
          <div className="vc-links">
            {p.links.map((l) => (
              <a key={l.href} href={l.href} className={`vc-link${l.primary ? " is-primary" : ""}`} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
            <button type="button" className="vc-theme" aria-label="Switch to the dark theme" data-cursor="Theme">
              <i aria-hidden="true" />
              <span>Dark theme</span>
            </button>
          </div>
        </div>

        <div className="vc-look">
          <form className="vc-search" role="search" action="#">
            <i className="vc-glass" aria-hidden="true" />
            <input type="search" className="vc-q" placeholder="Search a word…" aria-label="Search a word" autoComplete="off" spellCheck={false} list="vc-words" />
            <datalist id="vc-words">
              {WORDS.map((x) => (
                <option key={x.w} value={x.w} />
              ))}
            </datalist>
            <button type="submit" className="vc-go">
              Search
            </button>
          </form>
          <p className="vc-try">
            Try{" "}
            {WORDS.slice(4, 8).map((x) => (
              <button key={x.w} type="button" className="vc-chip" data-word={x.w}>
                {x.w}
              </button>
            ))}
          </p>
          <article className="vc-card" aria-live="polite">
            <header>
              <b className="vc-card-w">{WORDS[3].w}</b>
              <button type="button" className="vc-hear vc-card-hear" data-say={WORDS[3].w} aria-label={`Hear it: ${WORDS[3].w}`}>
                <i aria-hidden="true" />
              </button>
              <button type="button" className="vc-save" aria-pressed="false">
                Save
              </button>
            </header>
            <p className="vc-card-pos">{WORDS[3].pos}</p>
            <p className="vc-card-def">
              <span>Meaning:</span> {WORDS[3].def}
            </p>
            <p className="vc-card-exh">Examples</p>
            <p className="vc-card-ex">• {WORDS[3].ex}</p>
          </article>
          <p className="vc-note">Looks up the app&rsquo;s own explore words. The app itself asks the Free Dictionary API for any word.</p>
        </div>
      </section>

      {/* ── Scan a page ───────────────────────────────────────────────────── */}
      <section className="vc-scan" aria-labelledby="vc-scan">
        <header className="vc-shead">
          <h2 className="vc-h2" id="vc-scan">
            {p.flow.title}
          </h2>
          <p className="vc-sub">{p.flow.intro} Photograph a page and Vocabu finds the words worth looking up.</p>
        </header>
        <ol className="vc-rail" aria-label="Steps">
          {p.flow.steps.map((s, i) => (
            <li key={s.label} data-step={i}>
              <b>{STEPS[i]}</b>
              <span>{s.sub}</span>
            </li>
          ))}
        </ol>
        <div className="vc-scan-stage">
          <div className="vc-photo">
            <div className="vc-paper">
              <p className="vc-paper-run" aria-hidden="true">
                Chapter 3 · The ferry
              </p>
              <p className="vc-text">
                {TOKENS.map((t, i) =>
                  t.word ? (
                    <span key={i} className="vc-w" data-k={t.kind}>
                      {t.t}
                    </span>
                  ) : (
                    t.t
                  ),
                )}
              </p>
              <p className="vc-paper-folio" aria-hidden="true">
                41
              </p>
            </div>
            <span className="vc-finder" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="vc-scanline" aria-hidden="true" />
            <span className="vc-flash" aria-hidden="true" />
            <p className="vc-readout" aria-hidden="true">
              <span className="vc-size">3.8 MB</span>
              <span className="vc-count">
                {CANDIDATES} candidates, {PICKS.length} ticked
              </span>
            </p>
          </div>
          <div className="vc-found">
            <p className="vc-found-head">
              Looked up <span>one request at a time</span>
            </p>
            <ul className="vc-found-list">
              {PICKS.map((x) => (
                <li key={x.w}>
                  <b>{x.w}</b> <em>{x.pos}</em>
                  <span>{x.def}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Explore ───────────────────────────────────────────────────────── */}
      <section className="vc-explore" aria-labelledby="vc-explore">
        <header className="vc-shead">
          <h2 className="vc-h2" id="vc-explore">
            Explore vocabulary
          </h2>
          <p className="vc-sub">The words on the home screen, as a deck. Swipe one away, hear it, keep the ones you like.</p>
        </header>
        <div className="vc-deck-wrap">
          <div className="vc-deck">
            {WORDS.map((x, i) => (
              <article key={x.w} className="vc-dcard" data-i={i} style={{ "--i": i } as CSSProperties}>
                <header>
                  <b>{x.w}</b>
                  <button type="button" className="vc-hear" data-say={x.w} aria-label={`Hear it: ${x.w}`}>
                    <i aria-hidden="true" />
                  </button>
                  <button type="button" className="vc-save" aria-pressed="false">
                    Save
                  </button>
                </header>
                <p className="vc-card-pos">{x.pos}</p>
                <p className="vc-card-def">
                  <span>Meaning:</span> {x.def}
                </p>
                <p className="vc-card-exh">Examples</p>
                <p className="vc-card-ex">• {x.ex}</p>
              </article>
            ))}
          </div>
          <div className="vc-deck-ui">
            <button type="button" className="vc-deck-btn" data-dir="-1" aria-label="Previous word">
              <i aria-hidden="true" />
            </button>
            <span className="vc-dots" aria-hidden="true">
              {WORDS.map((x, i) => (
                <i key={x.w} className={i === 0 ? "is-on" : undefined} />
              ))}
            </span>
            <button type="button" className="vc-deck-btn is-next" data-dir="1" aria-label="Next word">
              <i aria-hidden="true" />
            </button>
          </div>
          <p className="vc-kept" aria-live="polite">
            Saved: <b>none yet</b>
          </p>
        </div>
      </section>

      {/* ── The app ───────────────────────────────────────────────────────── */}
      <section className="vc-app" aria-labelledby="vc-app">
        <header className="vc-shead">
          <h2 className="vc-h2" id="vc-app">
            Light and dark
          </h2>
          <p className="vc-sub">Green by day, orange by night, like this page. Real screens from the Android app; switch the theme and they switch too.</p>
        </header>
        <div className="vc-phones">
          {[home, saved].map((s) => (
            <figure key={s.img} className="vc-phone">
              <Phone model="android" top={shot(s.img).top}>
                <Shot m={shot(s.img)} alt={`Vocabu, ${s.title.toLowerCase()}, light theme`} className="vc-shot vc-shot-light" />
                <Shot m={shot(`${s.img}-dark`)} alt={`Vocabu, ${s.title.toLowerCase()}, dark theme`} className="vc-shot vc-shot-dark" />
              </Phone>
              <figcaption>
                <b>{s.title}.</b> {s.note}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Usage ─────────────────────────────────────────────────────────── */}
      <section className="vc-usage" aria-labelledby="vc-usage">
        <header className="vc-shead">
          <h2 className="vc-h2" id="vc-usage">
            Usage
          </h2>
        </header>
        <dl className="vc-uses">
          {p.features.map((f, i) => (
            <div key={f.title}>
              <dt>
                <span>{i + 1}</span> {f.title}
              </dt>
              <dd>{f.text}</dd>
            </div>
          ))}
        </dl>
        <p className="vc-etym">
          <b>Origin</b> Short for <i>vocabulary</i>. Built in Flutter and Dart from one codebase, words kept in SQLite on the device, meanings from the Free Dictionary API and text from OCR.space; first written {p.started}.
        </p>
      </section>

      <section className="vc-next">
        <p className="vc-sub">See also</p>
        <WorldNext href={`/projects/${next.slug}`} color={next.world.bg} icon={iconOf(next)?.src} className="vc-next-link">
          <AppTile p={next} className="vc-next-tile" />
          <b>{next.name}</b>
          <span>{next.tagline}</span>
        </WorldNext>
      </section>
    </VocabuMotion>
  );
}
