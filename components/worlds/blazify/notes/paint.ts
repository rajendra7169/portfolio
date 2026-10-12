// Repaint Blazify's world with one of the app's accent colours, the way its
// Theme screen does (ui/screens/settings/ThemeScreen.kt). A seed that is too dark
// to read on black is lifted to a lighter tone of the same hue, as a dark theme does.

export const BLAZE = "#ffa726"; // BlazeThemeColor, the default
export const PALETTE: [string, string][] = [
  ["Blaze", BLAZE],
  ["Crimson", "#ec5464"],
  ["Rose", "#d81b60"],
  ["Purple", "#8e24aa"],
  ["Deep purple", "#5e35b1"],
  ["Indigo", "#3949ab"],
  ["Blue", "#1e88e5"],
  ["Sky blue", "#039be5"],
  ["Cyan", "#00acc1"],
  ["Teal", "#00897b"],
  ["Green", "#43a047"],
  ["Light green", "#7cb342"],
  ["Lime", "#c0ca33"],
  ["Yellow", "#fdd835"],
  ["Amber", "#ffb300"],
  ["Orange", "#fb8c00"],
  ["Deep orange", "#f4511e"],
  ["Brown", "#6d4c41"],
  ["Grey", "#757575"],
  ["Blue grey", "#546e7a"],
];

const KEY = "blazify-colour";
export type Look = { hex: string; black: boolean };

const toHsl = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l] as const;
};
const hsl = (h: number, s: number, l: number) => `hsl(${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%)`;

/** The accent as the page uses it: the seed, lifted if it is too dark for black. */
export function tones(hex: string) {
  const [h, s0, l] = toHsl(hex);
  // A lifted tone loses some chroma, as a dark theme's primary does, so it isn't neon.
  const lift = Math.max(l, 0.62);
  const s = l < 0.62 ? Math.min(s0, 0.68) : s0;
  return {
    acc: hex === BLAZE ? BLAZE : hsl(h, s, lift),
    ember: hsl((h + 338) % 360, Math.min(1, s * 1.05), Math.max(0.48, lift - 0.07)),
  };
}

const WORLD_VARS = ["--bz-amber", "--bz-ember", "--bz-void", "--bz-coal", "--bz-slate"];

export function paint(world: HTMLElement, look: Look) {
  const html = document.documentElement;
  // --bz-flame is built from these two in CSS, and both are registered colours,
  // so the whole page eases from one accent to the next.
  if (look.hex === BLAZE) ["--bz-amber", "--bz-ember"].forEach((v) => world.style.removeProperty(v));
  else {
    const t = tones(look.hex);
    world.style.setProperty("--bz-amber", t.acc);
    world.style.setProperty("--bz-ember", t.ember);
  }
  html.style.setProperty("--w-accent", tones(look.hex).acc);
  if (look.black) {
    world.style.setProperty("--bz-void", "#000");
    world.style.setProperty("--bz-coal", "#0b0b0b");
    world.style.setProperty("--bz-slate", "#141414");
    html.style.setProperty("--w-bg", "#000");
  } else {
    ["--bz-void", "--bz-coal", "--bz-slate"].forEach((v) => world.style.removeProperty(v));
    html.style.removeProperty("--w-bg");
  }
  world.dataset.accent = look.hex;
}

export function unpaint(world: HTMLElement | null) {
  WORLD_VARS.forEach((v) => world?.style.removeProperty(v));
  ["--w-accent", "--w-bg"].forEach((v) => document.documentElement.style.removeProperty(v));
}

export function loadLook(): Look {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (v && PALETTE.some(([, h]) => h === v.hex)) return { hex: v.hex, black: !!v.black };
  } catch {}
  return { hex: BLAZE, black: false };
}

export function saveLook(look: Look) {
  try {
    if (look.hex === BLAZE && !look.black) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(look));
  } catch {}
}
