// Leaving a page without a frozen frame. On a click, an exact copy of the page
// as it looks right now is laid over it, and that copy lifts and fades. The
// animations run on the compositor (Web Animations, transform and opacity
// only), so they keep moving while the main thread is busy swapping in the next
// page underneath. When the new page is in, the cover clears to reveal it with
// its own entrance playing, and the old title glides to where the new title sits.
// The header sits above the cover throughout, so it never moves.
//
// Leaving Stories for the portfolio, the copy turns away like a book page
// instead (`turn`), over the portfolio's own sky (`background`).

const TITLES = ".hx-name, .eh-title, .pl-title, .ch-title, .rs-h1, .xh-copy:not(.xh-ink) .xh-title";
// An animation is running on the compositor once it is ready and a frame
// carrying it has been drawn: wait for the next frame, then for a task after
// that frame (work started inside the frame callback would hold the frame back).
// Give up waiting after a moment either way (a background tab draws no frames).
const afterFrame = () => new Promise((res) => requestAnimationFrame(() => window.setTimeout(res, 0)));
export const running = (a: Animation) => Promise.race([a.ready.then(afterFrame), new Promise((res) => window.setTimeout(res, 200))]).catch(() => {});

// `ready` resolves once the lift is running on the compositor: only then is it
// safe to start the heavy page swap, which would otherwise hold the animation's
// start back until it finished. `arrive` resolves the same way for the reveal.
export type Leaving = { ready: Promise<unknown>; arrive: () => Promise<unknown>; cancel: () => void };
export type LeaveStyle = { turn?: boolean; background?: string };

function opaque(color: string) {
  return color && color !== "transparent" && !/rgba\(.*,\s*0\)$/.test(color);
}
const pageBackground = () => {
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  return opaque(bodyBg) ? bodyBg : getComputedStyle(document.documentElement).backgroundColor;
};

/**
 * A copy of `#main` as it is on screen right now, positioned for a fixed layer
 * the size of the window: ids stripped, canvases repainted, and sections off
 * screen kept at their size but skipped for layout and paint.
 */
function copyMain(main: HTMLElement) {
  const vh = window.innerHeight;
  const copy = main.cloneNode(true) as HTMLElement;
  copy.removeAttribute("id");
  copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  copy.style.cssText += `;position:absolute;left:0;right:0;top:${-window.scrollY}px;margin:0`;

  // A copied canvas is blank: paint the original's pixels into it.
  const canvases = copy.querySelectorAll("canvas");
  main.querySelectorAll("canvas").forEach((c, i) => {
    const d = canvases[i];
    if (!d || !c.width || !c.height) return;
    try {
      d.width = c.width;
      d.height = c.height;
      d.getContext("2d")?.drawImage(c, 0, 0);
    } catch {}
  });

  // Sections off screen keep their exact size but skip layout and paint, so
  // laying the copy down costs only what is actually visible.
  const sections = main.querySelectorAll<HTMLElement>("section");
  const copies = copy.querySelectorAll<HTMLElement>("section");
  sections.forEach((s, i) => {
    const c = copies[i];
    if (!c || s.parentElement?.closest("section")) return;
    const r = s.getBoundingClientRect();
    if (r.bottom >= 0 && r.top <= vh) return;
    c.style.contentVisibility = "hidden";
    c.style.containIntrinsicSize = `${r.width}px ${r.height}px`;
  });
  return copy;
}

/** The one sticky element (the Experience page's terminal) falls back to its place in the flow in a copy; put it back where it is on screen. */
function fixSticky(main: HTMLElement, copy: HTMLElement) {
  const vh = window.innerHeight;
  main.querySelectorAll<HTMLElement>(".xg-term").forEach((s, i) => {
    const c = copy.querySelectorAll<HTMLElement>(".xg-term")[i];
    const a = s.getBoundingClientRect();
    if (!c || a.bottom < 0 || a.top > vh) return;
    const b = c.getBoundingClientRect();
    c.style.transform = `translateY(${a.top - b.top}px)`;
  });
}

/**
 * The whole window as it looks now (the header too), as one opaque sheet:
 * what the welcome into Stories turns over like a page. Call `settle` once the
 * sheet is in the document.
 */
export function snapshotPage(): { sheet: HTMLElement; settle: () => void } | null {
  const main = document.getElementById("main");
  if (!main) return null;
  const sheet = document.createElement("div");
  sheet.style.background = pageBackground();
  const copy = copyMain(main);
  sheet.appendChild(copy);
  const header = document.querySelector<HTMLElement>(".header");
  if (header) {
    const h = header.cloneNode(true) as HTMLElement;
    h.classList.add("is-copy"); // Stories hides the real header; not this picture of it
    h.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    const r = header.getBoundingClientRect();
    h.style.cssText += `;position:absolute;left:${r.left}px;top:${r.top}px;width:${r.width}px;margin:0;transform:none`;
    sheet.appendChild(h);
  }
  return { sheet, settle: () => fixSticky(main, copy) };
}

export function leavePage(style: LeaveStyle = {}): Leaving | null {
  const main = document.getElementById("main");
  if (!main) return null;
  const vh = window.innerHeight;

  const layer = document.createElement("div");
  layer.className = `page-leave${style.turn ? " page-leave--turn" : ""}`;
  layer.setAttribute("aria-hidden", "true");
  layer.inert = true;

  // Behind the copy, the page's own background (or the next page's, for a
  // turn), so the page underneath never shows through.
  const bg = document.createElement("div");
  bg.className = "page-leave-bg";
  bg.style.background = style.background ?? pageBackground();

  const sheet = document.createElement("div");
  sheet.className = "page-leave-sheet";
  const copy = copyMain(main);
  sheet.appendChild(copy);

  // The title travels on its own, from where it is to where the new page puts it.
  let title: HTMLElement | null = null;
  let from: DOMRect | null = null;
  const real = style.turn ? null : main.querySelector<HTMLElement>(TITLES);
  if (real) {
    const r = real.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh && r.width > 0) {
      from = r;
      const inCopy = copy.querySelector<HTMLElement>(TITLES);
      if (inCopy) inCopy.style.visibility = "hidden";
      title = real.cloneNode(true) as HTMLElement;
      title.removeAttribute("id");
      const cs = getComputedStyle(real);
      Object.assign(title.style, {
        position: "absolute",
        left: `${r.left}px`,
        top: `${r.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        margin: "0",
        transformOrigin: "0 0",
        color: cs.color,
        fontFamily: cs.fontFamily,
        textAlign: cs.textAlign,
      });
    }
  }

  let shade: HTMLElement | null = null;
  if (style.turn) {
    // The page is opaque (it lifts off the next page's colour) and darkens as it turns.
    sheet.style.background = pageBackground();
    shade = document.createElement("div");
    shade.className = "page-leave-shade";
    sheet.appendChild(shade);
  }

  layer.append(bg, sheet);
  if (title) layer.append(title);
  document.body.appendChild(layer);
  fixSticky(main, copy);

  // A lift: quick off the mark, so the click visibly answers at once, then
  // easing out. A turn: the page swings away about its right edge, like turning
  // back a page of a book.
  const out = style.turn
    ? sheet.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(8deg)", offset: 0.18 }, { transform: "rotateY(96deg)" }], {
        duration: 900,
        easing: "cubic-bezier(0.45, 0, 0.25, 1)",
        fill: "forwards",
      })
    : sheet.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-40px) scale(0.985)" }], {
        duration: 440,
        easing: "cubic-bezier(0.25, 0.6, 0.35, 1)",
        fill: "forwards",
      });
  shade?.animate([{ opacity: 0 }, { opacity: 0.55 }], { duration: 900, easing: "ease-in", fill: "forwards" });

  let gone = false;
  const remove = () => {
    if (gone) return;
    gone = true;
    layer.remove();
  };

  return {
    ready: running(out),
    // The new page is in: clear the cover and send the title to its new place.
    arrive() {
      const reveal = bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: style.turn ? 600 : 450, delay: style.turn ? 150 : 0, easing: "ease-out", fill: "forwards" });
      const anims = [out.finished, reveal.finished];
      const next = document.getElementById("main")?.querySelector<HTMLElement>(TITLES);
      if (title && from && next) {
        const to = next.getBoundingClientRect();
        const s = to.height / from.height;
        const flight = title.animate(
          [
            { transform: "none", opacity: 1 },
            { opacity: 0.85, offset: 0.5 },
            { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${s})`, opacity: 0 },
          ],
          { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" },
        );
        anims.push(flight.finished);
      } else if (title) {
        anims.push(title.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }).finished);
      }
      Promise.allSettled(anims).then(remove);
      window.setTimeout(remove, style.turn ? 2200 : 1500);
      return running(reveal);
    },
    cancel: remove,
  };
}
