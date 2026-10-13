// The site chrome (header, footer, cursor, back to top) dresses for the page it
// frames: a project world's colours, Stories' paper. What the page holds is kept
// as attributes on <html> for the CSS to match on:
//   data-worlds   the worlds in the page ([data-world]: the live page's, and a
//                 copy of the last page while it lifts away; "other" for the
//                 Projects launcher's apps, which carry their world's colour)
//   data-tones    the tones of those worlds ([data-tone]; Tally, NexTerm and
//                 Vocabu change theirs as they run)
//   data-stories  Stories is the live page (#main > .st-root)
//   data-welcome  the welcome into Stories is up: "on", then "landed" once its
//                 words reach the masthead
// CSS could ask the page itself, with :root:has(…), and once did; but a :has()
// on the root makes every text change anywhere restyle the whole document (the
// video timecode on the home page alone did it 25 times a second). Whatever
// adds or removes one of those elements, or changes a tone, calls syncRoot().

/** Each world's tone as the page is first served. */
export const WORLD_TONES: Record<string, "dark" | "light"> = {
  blazify: "dark",
  fitevo: "dark",
  nexterm: "dark",
  jarvis: "dark",
  tally: "light",
  "r-ai": "dark",
  vocabu: "light",
};

function set(name: string, value: string | null) {
  const html = document.documentElement;
  if (value === null) html.removeAttribute(name);
  else if (html.getAttribute(name) !== value) html.setAttribute(name, value);
}

const list = (sel: string, read: (el: HTMLElement) => string) => {
  const seen = new Set<string>();
  document.querySelectorAll<HTMLElement>(sel).forEach((el) => seen.add(read(el)));
  return seen.size ? [...seen].join(" ") : null;
};

export function syncRoot() {
  set("data-worlds", list("[data-world]", (w) => (w.dataset.world! in WORLD_TONES ? w.dataset.world! : "other")));
  set("data-tones", list("[data-tone]", (w) => w.dataset.tone!));
  set("data-stories", document.querySelector("#main > .st-root") ? "" : null);
  const welcome = document.querySelector(".st-welcome");
  set("data-welcome", welcome ? (welcome.classList.contains("is-landed") ? "landed" : "on") : null);
}

/** The same before first paint, from the address (inline in <head>, where the page isn't there yet to look at). */
export const rootFlagsScript = `(function(d,t){var p=location.pathname.replace(/\\/+$/,""),m=/^\\/projects\\/([^/]+)$/.exec(p);if(p=="/projects")d.setAttribute("data-worlds","other");else if(m&&t[m[1]]){d.setAttribute("data-worlds",m[1]);d.setAttribute("data-tones",t[m[1]])}if(/^\\/stories(\\/|$)/.test(p))d.setAttribute("data-stories","")})(document.documentElement,${JSON.stringify(WORLD_TONES)})`;
