// Tally's forest rules, ported from the app (src/components/Forest.jsx and
// src/utils/forestTheme.js) so the page's sky, seasons, health and weather
// follow the same maths and colours as the real thing.

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, k: number) =>
  "#" +
  hex(a)
    .map((v, i) => Math.round(v + (hex(b)[i] - v) * k).toString(16).padStart(2, "0"))
    .join("");

export type Phase = "night" | "dawn" | "day" | "dusk";
export type Sky = { phase: Phase; top: string; bottom: string; sun: { x: number; y: number; o: number }; moon: { x: number; y: number; o: number } };

/** The sky at a time of day (hours, 0–24). Positions are fractions of the scene. */
export function skyAt(hours: number): Sky {
  const dawnStart = 5.5, dawnEnd = 7, duskStart = 17, duskEnd = 18.5;
  const day = ["#bfdbfe", "#fef3c7"], night = ["#0b1729", "#1e3a5f"], dawn = ["#fda4af", "#fdba74"], dusk = ["#7c3aed", "#fb7185"];
  const two = (a: string[], b: string[], k: number) => [mix(a[0], b[0], k), mix(a[1], b[1], k)];
  let phase: Phase, c: string[], sunO: number, moonO: number;
  if (hours < dawnStart || hours > duskEnd) [phase, c, sunO, moonO] = ["night", night, 0, 1];
  else if (hours < dawnEnd) {
    const t = (hours - dawnStart) / (dawnEnd - dawnStart);
    [phase, c, sunO, moonO] = ["dawn", t < 0.5 ? two(night, dawn, t * 2) : two(dawn, day, (t - 0.5) * 2), t, 1 - t];
  } else if (hours > duskStart) {
    const t = (hours - duskStart) / (duskEnd - duskStart);
    [phase, c, sunO, moonO] = ["dusk", t < 0.5 ? two(day, dusk, t * 2) : two(dusk, night, (t - 0.5) * 2), 1 - t, t];
  } else [phase, c, sunO, moonO] = ["day", day, 1, 0];
  const sp = Math.max(0, Math.min(1, (hours - dawnStart) / (duskEnd - dawnStart)));
  const mp = Math.max(0, Math.min(1, ((hours - duskEnd + 24) % 24) / (24 - (duskEnd - dawnStart))));
  const arc = (p: number) => ({ x: 0.1 + p * 0.8, y: 0.5 - Math.sin(p * Math.PI) * 0.35 });
  return { phase, top: c[0], bottom: c[1], sun: { ...arc(sp), o: sunO }, moon: { ...arc(mp), o: moonO } };
}

export type Season = "spring" | "summer" | "autumn" | "winter";
export const SEASONS: Record<Season, { name: string; ground: [string, string]; accent: string }> = {
  spring: { name: "Spring", ground: ["#bbf7d0", "#86efac"], accent: "#f9a8d4" },
  summer: { name: "Summer", ground: ["#a7f3d0", "#6ee7b7"], accent: "#fcd34d" },
  autumn: { name: "Autumn", ground: ["#fde68a", "#fbbf24"], accent: "#f97316" },
  winter: { name: "Winter", ground: ["#e2e8f0", "#cbd5e1"], accent: "#bfdbfe" },
};
export const seasonOf = (month: number): Season => (month >= 2 && month <= 4 ? "spring" : month <= 7 && month > 4 ? "summer" : month >= 8 && month <= 10 ? "autumn" : "winter");

// A day at the office, as the forest draws it.
export type Kind = "normal" | "late" | "overtime" | "early" | "absent" | "off";
export type Shape = "round" | "pine" | "willow";

/** Forest health, 0–100: on time counts fully, late 0.6, leaving early 0.4. */
export function healthOf(days: Kind[]) {
  const n = (k: Kind) => days.filter((d) => d === k).length;
  const onTime = n("normal") + n("overtime");
  const total = onTime + n("late") + n("early") + n("absent");
  if (!total) return 0;
  return Math.round(((onTime + 0.6 * n("late") + 0.4 * n("early")) / total) * 100);
}
export const healthLabel = (s: number) => (s >= 90 ? "Thriving" : s >= 75 ? "Healthy" : s >= 60 ? "Steady" : s >= 40 ? "Struggling" : "Declining");

/** Weather from the last seven working days. */
export function weatherOf(days: Kind[]) {
  const last = days.filter((d) => d !== "off").slice(-7);
  if (!last.length) return "Sunny";
  const absent = last.filter((d) => d === "absent").length;
  const rate = (last.length - absent) / last.length;
  return absent >= 3 ? "Stormy" : rate >= 0.85 ? "Sunny" : rate >= 0.65 ? "Cloudy" : "Rainy";
}

/** Kathmandu's clock, in minutes since midnight, and its month. */
export function kathmandu(d = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", month: "numeric", hourCycle: "h23" })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return { minutes: +parts.hour * 60 + +parts.minute, month: +parts.month - 1 };
}
export const hhmm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(Math.floor(min % 60)).padStart(2, "0")}`;

/** A small seeded random, so the server and the browser draw the same forest. */
export function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
