// Crossing from the portfolio into Stories, as a page of a book.
//
// The portfolio, exactly as it is on screen, turns away about its left edge like
// a page, onto paper. A pen traces "मेरो अर्को संसार" (my other world) word by
// word; then the ink bar, the shirorekha that Devanagari letters hang from, is
// drawn across the whole page, joining the words; ink runs down from it into
// the letters, and "Welcome to the other side of me" appears beneath. Stories
// loads underneath the whole time. When it's ready, the words glide to where
// the masthead sits on the Stories front page, and the paper clears around them.
//
// The page turn is a Web Animation on transform only, so it runs on the
// compositor while the main thread swaps the page in underneath.
import { running, snapshotPage } from "../pageLeave";
import { fontOf, headline } from "./headline";

/** Set while the welcome is handing over to the masthead, so the masthead skips its own entrance. */
export const welcome = { handoff: false };

export type Welcoming = { covered: Promise<unknown>; arrive: () => Promise<void>; cancel: () => void };

const SHOW_AT_LEAST = 2700; // long enough to read, short enough not to wait on
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const PEN = "cubic-bezier(0.45, 0.05, 0.3, 1)";
const SVG = "http://www.w3.org/2000/svg";

let warm: Promise<unknown> | null = null;
/** Start the two fonts the welcome writes with (it's called on hover too, so they're usually ready). */
export function warmStoriesFonts() {
  if (warm) return warm;
  const css = getComputedStyle(document.documentElement);
  const martel = css.getPropertyValue("--font-martel").trim();
  const literata = css.getPropertyValue("--font-literata").trim();
  warm = Promise.all([
    martel ? document.fonts?.load(`800 100px ${martel}`, "मेरो अर्को संसार") : null,
    literata ? document.fonts?.load(`italic 400 20px ${literata}`, "Welcome") : null,
  ]).catch(() => {});
  return warm;
}

export function startWelcome(): Welcoming {
  welcome.handoff = true;
  const t0 = performance.now();
  const fonts = warmStoriesFonts();

  const root = document.createElement("div");
  root.className = "st-welcome";
  root.setAttribute("aria-hidden", "true");
  root.inert = true;
  root.innerHTML =
    '<div class="st-welcome-paper"></div>' +
    '<div class="st-welcome-in">' +
    '<p class="st-welcome-title" lang="ne">' +
    '<span class="st-welcome-bar"></span><span class="st-welcome-nib"></span>' +
    '<span class="st-welcome-word">मेरो</span> <span class="st-welcome-word">अर्को</span> <span class="st-welcome-word">संसार</span>' +
    '<i class="st-welcome-base"></i></p>' +
    '<p class="st-welcome-en">Welcome to the other side of me.</p>' +
    "</div>" +
    '<div class="st-welcome-spine"></div>' +
    '<div class="st-welcome-page"></div>';
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector(s) as T;
  const group = $(".st-welcome-in");
  const title = $(".st-welcome-title");
  const bar = $(".st-welcome-bar");
  const nib = $(".st-welcome-nib");
  const words = [...root.querySelectorAll<HTMLElement>(".st-welcome-word")];
  const en = $(".st-welcome-en");
  const page = $(".st-welcome-page");

  // The portfolio as it is right now becomes the page that turns.
  const snap = snapshotPage();
  if (snap) {
    snap.sheet.className = "st-welcome-sheet";
    page.appendChild(snap.sheet);
  }
  const shade = document.createElement("div");
  shade.className = "st-welcome-shade";
  page.appendChild(shade);
  document.body.appendChild(root);
  snap?.settle();

  // The page lifts at its free edge, hangs a moment, then swings over.
  const turn = page.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-7deg)", offset: 0.2 }, { transform: "rotateY(-97deg)" }], {
    duration: 1000,
    easing: "cubic-bezier(0.45, 0, 0.25, 1)",
    fill: "both",
  });
  shade.animate([{ opacity: 0 }, { opacity: 0.6 }], { duration: 1000, easing: "ease-in", fill: "both" });
  $(".st-welcome-spine").animate([{ opacity: 0 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], { duration: 1150, easing: "ease-in-out", fill: "both" });

  let gone = false;

  // The writing, laid over the words exactly: one SVG text per word, at the
  // same place, size and font, so the traced outline is the word's own.
  const write = (async () => {
    await Promise.race([Promise.all([sleep(380), fonts]), sleep(1400)]);
    if (gone) return;
    const g = group.getBoundingClientRect();
    const base = $(".st-welcome-base").getBoundingClientRect().top - g.top;
    const cs = getComputedStyle(title);
    const size = parseFloat(cs.fontSize);
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "st-welcome-pen");
    svg.setAttribute("width", String(Math.ceil(g.width)));
    svg.setAttribute("height", String(Math.ceil(g.height)));
    const len = Math.round(size * 9); // longer than any one glyph's outline
    const traces = words.map((w, i) => {
      const r = w.getBoundingClientRect();
      const t = document.createElementNS(SVG, "text");
      t.textContent = w.textContent;
      t.setAttribute("x", String(r.left - g.left));
      t.setAttribute("y", String(base));
      Object.assign(t.style, {
        font: `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
        letterSpacing: cs.letterSpacing,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: String(Math.max(1.4, size * 0.011)),
        strokeLinejoin: "round",
        strokeLinecap: "round",
        strokeDasharray: `${len} ${len}`,
      });
      svg.appendChild(t);
      return t.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1050, delay: i * 190, easing: PEN, fill: "both" });
    });
    group.appendChild(svg);

    // The bar, drawn across the whole page through the tops of the words (on
    // their own headline stroke, as this browser draws it: see headline.ts),
    // with a drop of ink at the pen's point.
    bar.style.left = nib.style.left = `${-g.left}px`;
    bar.style.width = `${window.innerWidth}px`;
    const hl = headline(fontOf(title), title.textContent ?? "");
    if (hl) {
      const top = $(".st-welcome-base").getBoundingClientRect().top - hl.above - title.getBoundingClientRect().top;
      bar.style.top = `${top}px`;
      bar.style.height = `${hl.thick}px`;
      nib.style.top = `${top + hl.thick / 2 - nib.offsetHeight / 2}px`;
    }
    const barAt = 820;
    const barFor = 760;
    bar.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: barFor, delay: barAt, easing: "cubic-bezier(0.6, 0, 0.3, 1)", fill: "both" });
    nib.animate(
      [
        { transform: "translateX(0)", opacity: 0 },
        { opacity: 1, offset: 0.08 },
        { opacity: 1, offset: 0.9 },
        { transform: `translateX(${window.innerWidth}px)`, opacity: 0 },
      ],
      { duration: barFor, delay: barAt, easing: "cubic-bezier(0.6, 0, 0.3, 1)", fill: "both" },
    );

    // Ink runs down from the bar into each word once the bar has reached it.
    const fills = words.map((w) => {
      const r = w.getBoundingClientRect();
      const reach = Math.min(1, Math.max(0, (r.left + r.width / 2) / window.innerWidth));
      return w.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 -25% 0)" }], {
        duration: 620,
        delay: barAt + reach * barFor * 0.85,
        easing: "cubic-bezier(0.3, 0, 0.2, 1)",
        fill: "both",
      });
    });
    // The pen's outline gives way to the ink.
    const lastFill = fills[fills.length - 1];
    svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: barAt + barFor * 0.85 + 380, fill: "both" });
    en.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 700, delay: barAt + barFor, easing: OUT, fill: "both" },
    );
    await Promise.allSettled([...traces.map((a) => a.finished), lastFill.finished]);
  })();

  const remove = () => {
    gone = true;
    root.remove();
  };

  return {
    // Safe to swap the page in once the turn is running on its own.
    covered: running(turn),
    async arrive() {
      await Promise.race([Promise.all([sleep(Math.max(0, SHOW_AT_LEAST - (performance.now() - t0))), write, fonts]), sleep(4500)]);
      await frame();
      if (gone) return;
      // The page's own fade-in nudges it; settle that first so the words land true.
      document
        .querySelector("#main .st-page")
        ?.getAnimations()
        .forEach((a) => a.finish());
      const mast = document.querySelector<HTMLElement>("#main .st-mast-title");
      const paper = $(".st-welcome-paper");
      if (mast) {
        // To the masthead, which sits exactly where the words land; then the paper clears.
        const from = title.getBoundingClientRect();
        const to = mast.getBoundingClientRect();
        const glide = group.animate([{ transform: "none" }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px)` }], {
          duration: 820,
          easing: "cubic-bezier(0.65, 0, 0.25, 1)",
          fill: "both",
        });
        en.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-out", fill: "both" });
        paper.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 620, delay: 380, easing: "ease-in-out", fill: "both" });
        await glide.finished.catch(() => {});
        root.classList.add("is-landed"); // the real masthead shows again, right under the words
        await root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease-out", fill: "both" }).finished.catch(() => {});
      } else {
        // Anywhere else in Stories: the words lift away as the page shows.
        group.animate(
          [
            { opacity: 1, transform: "none" },
            { opacity: 0, transform: "translateY(-56px)" },
          ],
          { duration: 560, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "both" },
        );
        await root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 640, delay: 180, easing: "ease-out", fill: "both" }).finished.catch(() => {});
      }
      welcome.handoff = false;
      remove();
    },
    cancel() {
      welcome.handoff = false;
      remove();
    },
  };
}
